import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";

@Injectable()
export class HospitalRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByUserId(userId: number) {
    return this.prisma.hospital.findUnique({ where: { userId } });
  }

  async countAll() {
    return this.prisma.hospital.count();
  }

  async findByUserIdWithUser(userId: number) {
    return this.prisma.hospital.findUnique({
      where: { userId },
      include: {
        user: {
          select: { name: true, address: true },
        },
      },
    });
  }

  async findAllWithUser(params: {
    skip: number;
    take: number;
    search?: string;
    isVerified?: boolean;
  }) {
    const { skip, take, search, isVerified } = params;
    return this.prisma.hospital.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      where: {
        user: {
          ...(search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          } : {}),
          ...(isVerified !== undefined ? { isVerified } : {}),
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true,
            isVerified: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async countAllWithFilter(params: { search?: string; isVerified?: boolean }) {
    const { search, isVerified } = params;
    return this.prisma.hospital.count({
      where: {
        user: {
          ...(search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          } : {}),
          ...(isVerified !== undefined ? { isVerified } : {}),
        },
      },
    });
  }

  async updateUserVerified(userId: number, isVerified: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isVerified },
      select: { id: true, isVerified: true },
    });
  }
}
