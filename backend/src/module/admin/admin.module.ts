import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DonationHistoryRepository } from '../donation-history/repository/donationHistory.repository';
import { DonorsRepository } from '../donors/repository/donors.respository';
import { HospitalRepository } from '../hospital/repository/hospital.repository';
import { NotificationRepository } from '../notification/notification.repository';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [JwtModule, BullModule.registerQueue({ name: 'mail_queue' })],
  controllers: [AdminController],
  providers: [
    AdminService,
    PrismaService,
    DonorsRepository,
    HospitalRepository,
    DonationHistoryRepository,
    NotificationRepository,
  ],
})
export class AdminModule { }
