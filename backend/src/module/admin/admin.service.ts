import { Injectable } from '@nestjs/common';
import { DonationHistoryRepository } from '../donation-history/repository/donationHistory.repository';
import { DonorsRepository } from '../donors/repository/donors.respository';
import { HospitalRepository } from '../hospital/repository/hospital.repository';
import { NotificationRepository } from '../notification/notification.repository';

@Injectable()
export class AdminService {
  constructor(
    private readonly donorsRepository: DonorsRepository,
    private readonly hospitalRepository: HospitalRepository,
    private readonly donationHistoryRepository: DonationHistoryRepository,
    private readonly notificationRepository: NotificationRepository,
  ) { }

  async getStats() {
    const [totalDonors, totalHospitals, totalBloodUnits, todayConnections] =
      await Promise.all([
        this.donorsRepository.countAll(),
        this.hospitalRepository.countAll(),
        this.donationHistoryRepository.countAccepted(),
        this.donationHistoryRepository.countTodayConnections(),
      ]);

    return {
      totalDonors,
      totalBloodUnits,
      totalHospitals,
      todayConnections,
    };
  }

  async getDemandChart(days: number) {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const [notifications, donations] = await Promise.all([
      this.notificationRepository.findByDateRange(startDate, endDate),
      this.donationHistoryRepository.findAcceptedByDateRange(startDate, endDate),
    ]);

    // Tạo map đếm theo ngày (format: YYYY-MM-DD)
    const toDateKey = (date: Date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const requestMap: Record<string, number> = {};
    const responseMap: Record<string, number> = {};

    notifications.forEach(({ createdAt }) => {
      const key = toDateKey(createdAt);
      requestMap[key] = (requestMap[key] || 0) + 1;
    });

    donations.forEach(({ donationDate }) => {
      const key = toDateKey(donationDate);
      responseMap[key] = (responseMap[key] || 0) + 1;
    });

    // Tạo array đầy đủ N ngày (kể cả ngày = 0)
    const result: { date: string; requests: number; responses: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      result.push({
        date: key,
        requests: requestMap[key] || 0,
        responses: responseMap[key] || 0,
      });
    }

    return result;
  }

  async getRecentTraffic(limit: number) {
    const notifications = await this.notificationRepository.findRecent(limit);

    return notifications.map((n) => {
      let status: string;
      if (n.isAccept === true) {
        status = 'Đã xử lý';
      } else if (n.isAccept === false) {
        status = 'Từ chối';
      } else if (n.urgency === 5) {
        status = 'Cực kỳ khẩn cấp';
      } else if (n.urgency === 4) {
        status = 'Khẩn cấp';
      } else if (n.urgency === 3) {
        status = 'Ưu tiên';
      } else if (n.urgency === 2) {
        status = 'Ưu tiên thấp';
      } else {
        status = 'Bình thường';
      }

      return {
        id: n.id,
        hospitalName: n.hospitalName,
        bloodType: n.donor?.bloodType ?? 'N/A',
        createdAt: n.createdAt,
        status,
      };
    });
  }

  async getHospitalsTraffic(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;    // 'urgent' | 'normal' | 'resolved' | 'rejected'
    bloodType?: string;
  }) {
    const { page, limit, search, status, bloodType } = params;
    const skip = (page - 1) * limit;

    // Map status filter sang isAccept
    let isAcceptFilter: boolean | null | undefined = undefined;
    let urgencyMin: number | undefined = undefined;
    if (status === 'resolved') isAcceptFilter = true;
    else if (status === 'rejected') isAcceptFilter = false;
    else if (status === 'urgent') { isAcceptFilter = null; urgencyMin = 3; }
    else if (status === 'normal') { isAcceptFilter = null; urgencyMin = undefined; }

    const filterParams = { search, isAccept: isAcceptFilter, bloodType };

    const [rows, total] = await Promise.all([
      this.notificationRepository.findPaginated({ skip, take: limit, ...filterParams }),
      this.notificationRepository.countPaginated(filterParams),
    ]);

    const formatStatus = (isAccept: boolean | null, urgency: number) => {
      if (isAccept === true) return 'Đã xử lý';
      if (isAccept === false) return 'Từ chối';
      if (urgency === 5) return 'Cực kỳ khẩn cấp';
      if (urgency === 4) return 'Khẩn cấp';
      if (urgency === 3) return 'Ưu tiên';
      if (urgency === 2) return 'Ưu tiên thấp';
      return 'Bình thường';
    };

    const data = rows
      .filter((n) => {
        if (status === 'urgent') return n.isAccept === null && n.urgency >= 3;
        if (status === 'normal') return n.isAccept === null && n.urgency < 3;
        return true;
      })
      .map((n) => ({
        id: n.id,
        hospitalName: n.hospitalName,
        bloodType: n.donor?.bloodType ?? 'N/A',
        urgency: n.urgency,
        createdAt: n.createdAt,
        status: formatStatus(n.isAccept, n.urgency),
      }));

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
