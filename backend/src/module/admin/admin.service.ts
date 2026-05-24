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
}
