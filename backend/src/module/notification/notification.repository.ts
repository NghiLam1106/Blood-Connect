import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../src/common/prisma/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: {
    donorId: number;
    hospitalId: number;
    hospitalName: string;
    hospitalAddress?: string;
    distance: number;
    urgency: number;
    notes?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        ...data,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async findByIdWithHospital(id: number) {
    return this.prisma.notification.findUnique({
      where: { id },
      include: {
        hospital: true,
      },
    });
  }

  async updateAcceptStatus(id: number, isAccept: boolean) {
    return this.prisma.notification.update({
      where: { id },
      data: { isAccept },
    });
  }

  async findByDonorId(donorId: number) {
    return this.prisma.notification.findMany({
      where: { donorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkPendingOrRecentNotification(donorId: number, hospitalId: number, cooldownMinutes: number = 30) {
    const timeLimit = new Date();
    timeLimit.setMinutes(timeLimit.getMinutes() - cooldownMinutes);

    return this.prisma.notification.findFirst({
      where: {
        donorId,
        hospitalId,
        OR: [
          { isAccept: null },
          { createdAt: { gt: timeLimit } }
        ]
      }
    });
  }
}
