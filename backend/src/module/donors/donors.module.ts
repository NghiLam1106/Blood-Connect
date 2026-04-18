import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../../src/common/prisma/prisma.service';
import { GeocodingService } from '../../../src/helpers/map/openStreetMap.map';
import { DonorsController } from './donors.controller';
import { DonorsService } from './donors.service';
import { DonorsRepository } from './repository/donors.respository';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [JwtModule, HttpModule, NotificationModule],
  controllers: [DonorsController],
  providers: [DonorsService, DonorsRepository, GeocodingService, PrismaService],
  exports: [],
})
export class DonorsModule { }
