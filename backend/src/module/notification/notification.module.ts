import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationRepository } from './notification.repository';

@Module({
  imports: [JwtModule],
  providers: [NotificationGateway, NotificationRepository, PrismaService],
  exports: [NotificationGateway, NotificationRepository],
})
export class NotificationModule { }
