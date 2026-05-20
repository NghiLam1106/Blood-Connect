import { Injectable } from '@nestjs/common';
import { PrismaService } from "../../../../src/common/prisma/prisma.service";
import { BloodGroup } from '../../../enums/bloodTypes.enum';
import { UpdateDonorsDto } from '../dto/updateDonors.dto';
import { toGMT7ISOString } from "../../../helpers/Date/getNowGMT7";

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
        data: { address: data.address, provinceName: data.provinceName, wardName: data.wardName, street: data.street, name: data.name, avatar: data.avatar },
      }),
      this.prisma.donors.update({
        where: { userId: userId },
        data: {
          weight: data.weight,
          latitude: coordinates?.lat,
          longitude: coordinates?.lng,
          bloodType: data.bloodType,
          status: data.status,
          dob: data.dob ? new Date(data.dob) : undefined,
          gender: data.gender,
          unitBlood: data.unitBlood,
        },
      }),
    ]);

    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      ...donor
    };
  }

  async updateResponseRate(userId: number, responseRate: number) {
    return this.prisma.donors.update({
      where: { userId },
      data: { responseRate }
    });
  }

  async updateLastDonation(donorId: number, lastDonation: string) {
    return this.prisma.donors.update({
      where: { id: donorId },
      data: { lastDonation: toGMT7ISOString(lastDonation) },
    });
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
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true
          }
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
