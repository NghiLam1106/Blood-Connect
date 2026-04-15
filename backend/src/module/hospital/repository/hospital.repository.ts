import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";

@Injectable()
export class HospitalRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByUserId(userId: number) {
        return this.prisma.hospital.findUnique({ where: { userId } });
    }
}
