import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../../src/common/prisma/prisma.service';
import { GeocodingService } from '../../helpers/map/openStreetMap.map';
import { HttpModule } from '@nestjs/axios/dist/http.module';

@Module({
  imports: [HttpModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, GeocodingService],
  exports: [GeocodingService],
})
export class UsersModule {}
