import { Injectable } from '@nestjs/common';
import { StatusDonation } from '../../../../generated/prisma/enums';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateDonationHistoryDto } from '../dto/createDonationHistory.dto';

@Injectable()
export class DonationHistoryRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateDonationHistoryDto) {
    const history = await this.prisma.donationHistory.create({
      data,
    });
    return history;
  }

  async findByDonorId(donorId: number) {
    return this.prisma.donationHistory.findMany({
      where: { donorId: donorId },
      include: {
        hospital: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { donationDate: 'desc' },
    });
  }

  async findByHospitalId(hospitalId: number) {
    return this.prisma.donationHistory.findMany({
      where: { hospitalId: hospitalId },
      include: {
        donor: {
          include: {
            user: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: { donationDate: 'desc' },
    });
  }

  async updateStatus(id: number, status: StatusDonation) {
    return this.prisma.donationHistory.update({
      where: { id: Number(id) },
      data: { status: status },
    });
  }

  async findById(id: number) {
    return this.prisma.donationHistory.findUnique({ where: { id: id } });
  }
}
