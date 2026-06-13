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

  async getReportStats(hospitalId: number) {
    const [totalRequests, acceptedRequests, pendingRequests, donationStats] = await Promise.all([
      this.prisma.notification.count({ where: { hospitalId } }),
      this.prisma.notification.count({ where: { hospitalId, isAccept: true } }),
      this.prisma.notification.count({ where: { hospitalId, isAccept: null } }),
      this.prisma.donationHistory.aggregate({
        where: { hospitalId, status: 'ACCEPTED' },
        _sum: { unitBlood: true },
      }),
    ]);
    return {
      totalRequests,
      acceptedRequests,
      pendingRequests,
      totalUnitBlood: donationStats._sum.unitBlood ?? 0,
      acceptRate: totalRequests > 0 ? Math.round((acceptedRequests / totalRequests) * 100) : 0,
    };
  }

  async getNotificationHistory(params: {
    hospitalId: number;
    skip: number;
    take: number;
    isAccept?: boolean | null;
  }) {
    const where: any = { hospitalId: params.hospitalId };
    if (params.isAccept !== undefined) where.isAccept = params.isAccept;
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
        select: {
          id: true,
          urgency: true,
          distance: true,
          isAccept: true,
          notes: true,
          createdAt: true,
        },
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { items, total };
  }

  async getChartData(hospitalId: number, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const rows = await this.prisma.notification.findMany({
      where: { hospitalId, createdAt: { gte: since } },
      select: { createdAt: true, isAccept: true },
      orderBy: { createdAt: 'asc' },
    });
    const map = new Map<string, { requests: number; accepted: number }>();
    for (const r of rows) {
      const key = r.createdAt.toISOString().slice(0, 10);
      const entry = map.get(key) ?? { requests: 0, accepted: 0 };
      entry.requests++;
      if (r.isAccept === true) entry.accepted++;
      map.set(key, entry);
    }
    return Array.from(map.entries()).map(([date, v]) => ({ date, ...v }));
  }

  async getBloodTypeDistribution(hospitalId: number) {
    const rows = await this.prisma.donationHistory.groupBy({
      by: ['bloodType'],
      where: { hospitalId, status: 'ACCEPTED' },
      _count: { bloodType: true },
      orderBy: { _count: { bloodType: 'desc' } },
    });
    return rows.map(r => ({ bloodType: r.bloodType, count: r._count.bloodType }));
  }

  async updateUserVerified(userId: number, isVerified: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isVerified },
      select: { id: true, isVerified: true },
    });
  }

  async findUserByUserId(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
  }
}
