import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DonorsRepository } from '../donors/repository/donors.respository';
import { HospitalRepository } from '../hospital/repository/hospital.repository';
import { DonationHistoryController } from './donationHistory.controller';
import { DonationHistoryService } from './donationHistory.service';
import { DonationHistoryRepository } from './repository/donationHistory.repository';

@Module({
  controllers: [DonationHistoryController],
  providers: [DonationHistoryService, DonationHistoryRepository, PrismaService, JwtService, DonorsRepository, HospitalRepository],
  exports: [DonationHistoryService]
})
export class DonationHistoryModule { }
