import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaService } from "../../common/prisma/prisma.service";
import { DonorsRepository } from "../donors/repository/donors.respository";
import { NotificationModule } from "../notification/notification.module";
import { HospitalController } from "./hosospital.controller";
import { HospitalService } from "./hospital.service";
import { HospitalRepository } from "./repository/hospital.repository";

@Module({
  imports: [JwtModule, NotificationModule],
  controllers: [HospitalController],
  providers: [HospitalService, PrismaService, DonorsRepository, HospitalRepository],
  exports: [HospitalService],
})
export class HospitalModule { }
