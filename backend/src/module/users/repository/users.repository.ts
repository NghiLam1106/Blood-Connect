import { Injectable } from '@nestjs/common';
import { Role } from '../../../../generated/prisma/enums';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GeocodingService } from '../../../helpers/map/openStreetMap.map';
import { NotificationRepository } from '../../notification/notification.repository';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geocodingService: GeocodingService,
    private readonly notificationRepository: NotificationRepository,
  ) { }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: any): Promise<void> {
    const {
      name,
      email,
      phone,
      bloodType,
      hashedPassword,
      role,
      licenseCode,
      licenseFile,
      address,
    } = data;

    let coordinates: { lat: number; lon: number } | undefined;

    if (address) {
      coordinates = await this.geocodingService.getCoordinates(address);
    }

    this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role,
          isVerified: false,
          ...(address && { address }),
        },
      });

      if (role === Role.DONOR) {
        const newDonor = await tx.donors.create({
          data: {
            bloodType,
            userId: newUser.id,
          },
        });

        const totalCount = await this.notificationRepository.countAll();
        const totalCountAccept = await this.notificationRepository.countAllAccept();
        const c = totalCount > 0 ? (totalCountAccept / totalCount) : 0; //response rate trung bình toàn hệ thống
        const n = await this.notificationRepository.countByDonorId(newDonor.id); //số lần được request
        const acceptedCount = await this.notificationRepository.countAcceptedByDonorId(newDonor.id);
        const r = n > 0 ? (acceptedCount / n) : 0; //response rate thật
        const m = 5; //độ tin cậy tối thiểu
        const responseRate = ((n * r) + (m * c)) / (n + m); // công thức Bayesian Average

        await tx.donors.update({
          where: { id: newDonor.id },
          data: { responseRate },
        });

      } else if (role === Role.HOSPITAL) {
        await tx.hospital.create({
          data: {
            userId: newUser.id,
            ...(licenseCode && { licenseCode }),
            ...(licenseFile && { licenseFile }),
            latitude: coordinates!.lat,
            longitude: coordinates!.lon,
          },
        });
      }
    });
  }

  async update(email: string) {
    return this.prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });
  }

  async updatePassword(email: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }
}
