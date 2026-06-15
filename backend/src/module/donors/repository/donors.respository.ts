import { Injectable } from '@nestjs/common';
import { PrismaService } from "../../../../src/common/prisma/prisma.service";
import { BloodGroup } from '../../../enums/bloodTypes.enum';
import { toGMT7ISOString } from "../../../helpers/Date/getNowGMT7";
import { calculateAge } from '../../../helpers/age/calculateAge';
import { UpdateDonorsDto } from '../dto/updateDonors.dto';


@Injectable()
export class DonorsRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByUserId(userId: number) {
    return this.prisma.donors.findUnique({
      where: { userId },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });
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
          age: data.dob ? calculateAge(new Date(data.dob)) : undefined,
          gender: data.gender,
          unitBlood: data.unitBlood,
          lastDonation: data.lastDonation ? new Date(data.lastDonation) : undefined,
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

  async countAll() {
    return this.prisma.donors.count();
  }

  async findAllWithUser(params: {
    skip: number;
    take: number;
    search?: string;
    bloodType?: string;
    status?: string;
  }) {
    const { skip, take, search, bloodType, status } = params;
    return this.prisma.donors.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      where: {
        ...(bloodType ? { bloodType: bloodType as any } : {}),
        ...(status ? { status: status as any } : {}),
        ...(search ? {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          },
        } : {}),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true,
            avatar: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            donationHistories: { where: { status: 'ACCEPTED' } },
          },
        },
      },
    });
  }

  async countAllWithFilter(params: {
    search?: string;
    bloodType?: string;
    status?: string;
  }) {
    const { search, bloodType, status } = params;
    return this.prisma.donors.count({
      where: {
        ...(bloodType ? { bloodType: bloodType as any } : {}),
        ...(status ? { status: status as any } : {}),
        ...(search ? {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          },
        } : {}),
      },
    });
  }

  async getDonorById(id: number) {
    const donor: any = await this.prisma.donors.findUnique({
      where: { userId: id },
      include: {
        user: true,
        _count: {
          select: {
            donationHistories: { where: { status: 'ACCEPTED' } },
          },
        },
      },
    });

    if (!donor || !donor.user) {
      return null;
    }

    const { password, ...userWithoutPassword } = donor.user;
    const { user, _count, ...donorFields } = donor;

    return {
      ...userWithoutPassword,
      ...donorFields,
      totalDonations: _count.donationHistories,
    };
  }
}

