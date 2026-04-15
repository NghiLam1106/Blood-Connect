import { Module } from "@nestjs/common";
import { HospitalController } from "./hosospital.controller";
import { HospitalService } from "./hospital.service";
import { JwtModule } from "@nestjs/jwt";
import { PrismaService } from "../../common/prisma/prisma.service";
import { DonorsRepository } from "../donors/repository/donors.respository";
import { HospitalRepository } from "./repository/hospital.repository";

@Module({
    imports: [JwtModule],
    controllers: [HospitalController],
    providers: [HospitalService, PrismaService, DonorsRepository, HospitalRepository],
    exports: [HospitalService],
})
export class HospitalModule { }
