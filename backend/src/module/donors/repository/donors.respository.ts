import { Injectable } from '@nestjs/common';
import { PrismaService } from "../../../../src/common/prisma/prisma.service";
import { BloodGroup } from '../../../enums/bloodTypes.enum';
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
        data: { address: data.address, name: data.name, avatar: data.avatar },
      }),
      this.prisma.donors.update({
        where: { userId: userId },
        data: {
          weight: data.weight,
          latitude: coordinates?.lat,
          longitude: coordinates?.lng,
          bloodType: data.bloodType,
          status: data.status,
        },
      }),
    ]);

    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      ...donor
    };
  }

  async findListDonor(compatibleBloodGroups: BloodGroup[], requiredBloodMl: number) {
    return this.prisma.donors.findMany({
      where: {
        bloodType: {
          in: compatibleBloodGroups
        },
        status: 'AVAILABLE',
        unitBlood: {
          lte: requiredBloodMl
        }
      }
    });
  }

  async getDonorById(id: number) {

    const [user, donor] = await this.prisma.$transaction([
      this.prisma.user.findUnique({
        where: { id: id },
      }),
      this.prisma.donors.findUnique({
        where: { userId: id },
      }),
    ]);

    if (!user || !donor) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, ...donor };
  }
}
