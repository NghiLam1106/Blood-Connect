import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import axios from "axios";
import { BloodGroup } from "../../enums/bloodTypes.enum";
import { HttpRequestStatus } from "../../enums/httpRequest.enum";
import { getCompatibleDonors } from "../../helpers/blood/bloodType";
import { convertLastDonationDays } from "../../helpers/Date/convertLastDonationDay";
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
      return {
        ...donor,
        distance
      };
    });

    const aiDonors = donorsWithDistance.map((donor) => ({
      id: donor.id,
      distance: donor.distance ?? 9999,
      lastDonation: convertLastDonationDays(donor.lastDonation),
      responseRate: Number(donor.responseRate)
    }));

    try {
      const response = await axios.post("http://localhost:8000/predict", {
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
      notes: notes ?? null,
      requestedAt: new Date().toISOString(),
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

    return {
      status: HttpRequestStatus.SUCCESS,
      message: delivered
        ? `Đã gửi thông báo đến donor (userId=${donorUserId})`
        : `Donor (userId=${donorUserId}) hiện không online, thông báo chưa được gửi`,
      delivered,
      notificationId: notification.id,
    };
  }
}
