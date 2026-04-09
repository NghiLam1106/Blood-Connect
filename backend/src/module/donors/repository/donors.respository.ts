import { Injectable } from '@nestjs/common';
import { PrismaService } from "src/common/prisma/prisma.service";
import { UpdateDonorsDto } from '../dto/updateDonors.dto';

@Injectable()
export class DonorsRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByUserId(userId: number) {
    return this.prisma.donors.findUnique({ where: { userId } });
  }

  async updateDonor(userId: number, data: UpdateDonorsDto, coordinates?: { lat: number, lng: number }): Promise<any> {
    const [user, donor] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { address: data.address },
      }),
      this.prisma.donors.update({
        where: { userId: userId },
        data: {
          weight: data.weight,
          unitBlood: data.unitBlood,
          latitude: coordinates?.lat,
          longitude: coordinates?.lng,
          bloodType: data.bloodType,
          lastDonation: data.lastDonation,
          responseRate: data.responseRate,
          status: data.status,
        },
      }),
    ]);

    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      ...donor,
      id: userId
    };
  }
}
