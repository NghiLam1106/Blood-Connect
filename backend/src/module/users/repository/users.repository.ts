import { Injectable } from '@nestjs/common';
import { Role } from 'generated/prisma/enums';
import { PrismaService } from "src/common/prisma/prisma.service";

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: any): Promise<void> {
    const { name, email, phone, bloodType, hashedPassword, role } = data;
    this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role,
          isVerified: false
        },
      });

      if (role === Role.DONOR) {
        await tx.donors.create({
          data: {
            bloodType,
            userId: newUser.id,
          },
        });
      }
    });
  }

  async update(email: string){
    return this.prisma.user.update({
    where: { email },
    data: { isVerified: true },
  });
  }
}
