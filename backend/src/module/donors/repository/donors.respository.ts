import { Injectable } from '@nestjs/common';
import { PrismaService } from "src/common/prisma/prisma.service";

@Injectable()
export class DonorsRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByUserId(userId: number) {
    return this.prisma.donors.findUnique({ where: { userId } });
  }
}
