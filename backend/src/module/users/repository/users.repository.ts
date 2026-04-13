import { Injectable } from '@nestjs/common';
import { Role } from '../../../../generated/prisma/enums';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GeocodingService } from '../../../helpers/map/openStreetMap.map';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geocodingService: GeocodingService,
  ) {}

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
      pathFile,
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
        await tx.donors.create({
          data: {
            bloodType,
            userId: newUser.id,
          },
        });
      } else if (role === Role.REQUESTER) {
        await tx.hospital.create({
          data: {
            userId: newUser.id,
            ...(licenseCode && { licenseCode }),
            ...(pathFile && { pathFile }),
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
}
