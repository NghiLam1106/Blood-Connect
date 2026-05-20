import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DonorsRepository } from '../donors/repository/donors.respository';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationRepository } from './notification.repository';
import { NotificationService } from './notification.service';

@Module({
  imports: [JwtModule],
  controllers: [NotificationController],
  providers: [NotificationGateway, NotificationRepository, NotificationService, DonorsRepository, PrismaService],
  exports: [NotificationGateway, NotificationRepository],
})
export class NotificationModule { }
