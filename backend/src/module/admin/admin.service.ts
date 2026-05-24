import { Injectable } from '@nestjs/common';
import { DonationHistoryRepository } from '../donation-history/repository/donationHistory.repository';
import { DonorsRepository } from '../donors/repository/donors.respository';
import { HospitalRepository } from '../hospital/repository/hospital.repository';

@Injectable()
export class AdminService {
  constructor(
    private readonly donorsRepository: DonorsRepository,
    private readonly hospitalRepository: HospitalRepository,
    private readonly donationHistoryRepository: DonationHistoryRepository,
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
}
