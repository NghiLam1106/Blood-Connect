import { InjectQueue } from "@nestjs/bullmq";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import axios from "axios";
import { Queue } from "bullmq";
import { BloodGroup } from "../../enums/bloodTypes.enum";
import { HttpRequestStatus } from "../../enums/httpRequest.enum";
import { getCompatibleDonors } from "../../helpers/blood/bloodType";
import { convertLastDonationDays } from "../../helpers/Date/convertLastDonationDay";
import { getNowGMT7ISOString } from "../../helpers/Date/getNowGMT7";
import { calculateDistance } from "../../helpers/distance/calulateDistance";
import { DonorsRepository } from "../donors/repository/donors.respository";
import { NotificationGateway } from "../notification/notification.gateway";
import { NotificationRepository } from "../notification/notification.repository";
import { RequestDto } from "./dto/request.dto";
import { SelectDonorDto } from "./dto/select-donor.dto";
import { HospitalRepository } from "./repository/hospital.repository";

@Injectable()
export class HospitalService {
  constructor(
    @InjectQueue('mail_queue') private readonly mailQueue: Queue,
    private readonly donorsRepository: DonorsRepository,
    private readonly hospitalRepository: HospitalRepository,
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationRepository: NotificationRepository,
  ) { }

  async requestBlood(id: number, requestDto: RequestDto) {
    const { quantity, bloodType, urgency, notes } = requestDto;

    const requiredBloodMl: number = quantity * 250;

    const hospital = await this.hospitalRepository.findByUserId(Number(id));

    if (!hospital) {
      throw new NotFoundException({
        status: HttpRequestStatus.NOT_FOUND,
        message: 'Không tìm thấy bệnh viện'
      });
    }

    const lat = hospital.latitude;
    const lon = hospital.longitude;

    const compatibleBloodGroups = getCompatibleDonors(bloodType as BloodGroup);

    const compatibleDonors = await this.donorsRepository.findListDonor(compatibleBloodGroups, requiredBloodMl);

    const donorsWithDistance = compatibleDonors.map(donor => {
      let distance: any;
      if (donor.latitude !== null && donor.longitude !== null && lat !== null && lon !== null) {
        distance = calculateDistance(donor.latitude, donor.longitude, lat, lon);
      }
      const { user, ...donorData } = donor as any;
      return {
        ...donorData,
        name: user?.name,
        phone: user?.phone,
        distance,
      };
    });

    const aiDonors = donorsWithDistance.map((donor) => ({
      id: donor.id,
      distance: donor.distance ?? 9999,
      lastDonation: convertLastDonationDays(donor.lastDonation),
      responseRate: Number(donor.responseRate),
      weight: donor.weight,
      age: donor.age,
      gender: donor.gender,
      bloodType: donor.bloodType ?? null,
      requiredBloodType: bloodType ?? null,
    }));

    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
      const response = await axios.post(`${aiServiceUrl}/predict`, {
        donors: aiDonors,
        urgency: urgency
      });

      const aiResult = response.data;

      // Ghép thêm full donor info nếu cần
      const mergedResults = aiResult.results.map((item: any) => {
        const donorInfo = donorsWithDistance.find(
          (d) => d.id === item.id
        );

        return {
          ...donorInfo,
          ...item
        };
      });

      return {
        status: HttpRequestStatus.SUCCESS,
        message: "Hiển thị danh sách donor thành công",
        data: {
          urgency: aiResult.urgency,
          mergedResults
        }
      };
    } catch (error: any) {
      throw new BadRequestException({
        status: HttpRequestStatus.ERROR,
        message: "Lỗi khi gửi donor"
      });
    }
  }

  async selectDonor(hospitalUserId: number, dto: SelectDonorDto) {
    const { donorUserId, distance, urgency, notes } = dto;

    const hospital = await this.hospitalRepository.findByUserIdWithUser(Number(hospitalUserId));
    if (!hospital) {
      throw new NotFoundException({
        status: HttpRequestStatus.NOT_FOUND,
        message: 'Không tìm thấy bệnh viện'
      });
    }

    const donor = await this.donorsRepository.findByUserId(donorUserId);
    if (!donor) {
      throw new NotFoundException({
        status: HttpRequestStatus.NOT_FOUND,
        message: 'Không tìm thấy người hiến máu'
      });
    }

    // Kiểm tra chống spam (thời gian chờ 30 phút)
    const existingNotification = await this.notificationRepository.checkPendingOrRecentNotification(donor.id, hospital.id, 30);
    if (existingNotification) {
      if (existingNotification.isAccept === null) {
        throw new BadRequestException({
          status: HttpRequestStatus.ERROR,
          message: 'Đã gửi thông báo và đang chờ phản hồi.'
        })
      } else {
        throw new BadRequestException({
          status: HttpRequestStatus.ERROR,
          message: 'Đã gửi yêu cầu tới người hiến máu này gần đây. Xin vui lòng thử lại sau.'
        })
      }
    }

    // Payload gửi đến donor qua WebSocket
    const payload = {
      hospitalName: hospital.user.name,
      hospitalAddress: hospital.user.address,
      distance: distance,
      urgency: urgency,
      unitBlood: donor.unitBlood,
      notes: notes ?? null,
      requestedAt: getNowGMT7ISOString(),
    };

    const notification = await this.notificationRepository.create({
      donorId: donor.id,
      hospitalId: hospital.id,
      hospitalName: hospital.user.name,
      hospitalAddress: hospital.user.address ?? undefined,
      distance: distance,
      urgency: urgency,
      notes: notes ?? undefined,
    });

    const delivered = await this.notificationGateway.sendToUser(
      donorUserId,
      'blood-request',
      { ...payload, notificationId: notification.id },
    );

    // Gửi email thông báo cho donor (bất đồng bộ qua BullMQ)
    const donorWithUser = donor as any;
    const donorEmail = donorWithUser?.user?.email;
    const donorName = donorWithUser?.user?.name;
    if (donorEmail) {
      await this.mailQueue.add(
        'sendBloodRequestEmail',
        {
          email: donorEmail,
          donorName: donorName ?? 'Người hiến máu',
          hospitalName: hospital.user.name,
          hospitalAddress: hospital.user.address,
          distance: distance,
          urgency: urgency,
          notes: notes ?? null,
          unitBlood: donor.unitBlood,
        },
        { attempts: 3, backoff: 5000 },
      );
    }

    return {
      status: HttpRequestStatus.SUCCESS,
      message: delivered
        ? `Đã gửi thông báo đến donor (userId=${donorUserId})`
        : `Donor (userId=${donorUserId}) hiện không online. Thông báo đã được lưu và sẽ tự động gửi khi donor kết nối lại.`,
      delivered,
      notificationId: notification.id,
    };
  }

  async getReportStats(hospitalUserId: number) {
    const hospital = await this.hospitalRepository.findByUserId(Number(hospitalUserId));
    if (!hospital) {
      throw new NotFoundException({
        status: HttpRequestStatus.NOT_FOUND,
        message: 'Không tìm thấy bệnh viện'
      });
    }
    const stats = await this.hospitalRepository.getReportStats(hospital.id);
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Lấy thống kê báo cáo thành công',
      data: stats,
    };
  }

  async getNotificationHistory(
    hospitalUserId: number,
    page: number,
    limit: number,
    isAccept?: string,
  ) {
    const hospital = await this.hospitalRepository.findByUserId(Number(hospitalUserId));
    if (!hospital) {
      throw new NotFoundException({
        status: HttpRequestStatus.NOT_FOUND,
        message: 'Không tìm thấy bệnh viện',
      });
    }

    let isAcceptFilter: boolean | null | undefined = undefined;
    if (isAccept === 'true') isAcceptFilter = true;
    else if (isAccept === 'false') isAcceptFilter = false;
    else if (isAccept === 'null') isAcceptFilter = null;

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    const skip = (safePage - 1) * safeLimit;

    const { items, total } = await this.hospitalRepository.getNotificationHistory({
      hospitalId: hospital.id,
      skip,
      take: safeLimit,
      isAccept: isAcceptFilter,
    });

    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Lấy lịch sử yêu cầu thành công',
      data: {
        items,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getChartData(hospitalUserId: number, days: number) {
    const validDays = [7, 30, 90].includes(Number(days)) ? Number(days) : 30;
    const hospital = await this.hospitalRepository.findByUserId(Number(hospitalUserId));
    if (!hospital) {
      throw new NotFoundException({
        status: HttpRequestStatus.NOT_FOUND,
        message: 'Không tìm thấy bệnh viện',
      });
    }
    const chartData = await this.hospitalRepository.getChartData(hospital.id, validDays);
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Lấy dữ liệu biểu đồ thành công',
      data: chartData,
    };
  }

  async getBloodTypeDistribution(hospitalUserId: number) {
    const hospital = await this.hospitalRepository.findByUserId(Number(hospitalUserId));
    if (!hospital) {
      throw new NotFoundException({
        status: HttpRequestStatus.NOT_FOUND,
        message: 'Không tìm thấy bệnh viện',
      });
    }
    const data = await this.hospitalRepository.getBloodTypeDistribution(hospital.id);
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Lấy phân bố nhóm máu thành công',
      data,
    };
  }
}
