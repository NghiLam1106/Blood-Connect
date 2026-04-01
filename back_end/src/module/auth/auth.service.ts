import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Role } from 'generated/prisma/enums';
import { HttpRequestStatus } from 'src/enums/httpRequest.enum';

@Injectable()
export class AuthService {

  constructor(private prisma: PrismaService) {}

  async register(data: RegisterDto) {
    const { name, email, phone, bloodType, password, role } = data;

    // Kiểm tra email đã tồn tại chưa
    const userExists = await this.prisma.user.findUnique({ where: { email } });

    if (userExists) {
      throw new BadRequestException('Email này đã được sử dụng!');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    // Dùng transaction để đảm bảo cả user và donor đều được tạo thành công
    await this.prisma.$transaction(async (tx) => {
      // Bước 1: Tạo User
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role,
        },
      });

      // Bước 2: Nếu role là DONOR thì tạo bản ghi Donors với bloodType
      if (role === Role.DONOR) {
        await tx.donors.create({
          data: {
            bloodType,
            userId: newUser.id,
          },
        });
      }
    });

    return { message: 'Đăng ký tài khoản thành công!', status:  HttpRequestStatus.SUCCESS};
  }
}
