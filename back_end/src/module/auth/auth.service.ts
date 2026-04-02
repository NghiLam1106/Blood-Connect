import { InjectRedis } from '@nestjs-modules/ioredis';
import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { HttpRequestStatus } from 'src/enums/httpRequest.enum';
import { UsersRepository } from '../users/repository/users.repository';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';

@Injectable()
export class AuthService {

  constructor(@InjectQueue('mail_queue') private mailQueue: Queue,
    @InjectRedis() private readonly redis: Redis, private readonly usersRepository: UsersRepository) {}

  async register(registerDto: RegisterDto) {
    const { name, email, phone, bloodType, password, role } = registerDto;

    const userExists = await this.usersRepository.findByEmail(email);

    if (userExists) {
      throw new BadRequestException('Email này đã được sử dụng!');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await this.usersRepository.create({ name, email, phone, bloodType, hashedPassword, role });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.redis.set(`otp:${email}`, otp, 'EX', 300);

    await this.mailQueue.add('sendOtpEmail', {
      email,
      otp,
      name
    }, {
      attempts: 3,
      backoff: 5000,
    });

    return { message: 'Đăng ký tài khoản thành công!', status:  HttpRequestStatus.SUCCESS};
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;
    const storedOtp = await this.redis.get(`otp:${email}`);
    if (!storedOtp) {
      throw new BadRequestException('Mã OTP đã hết hạn!');
    }
    if (storedOtp !== otp) {
      throw new BadRequestException('Mã OTP không chính xác!');
    }
    await this.redis.del(`otp:${email}`);
    await this.usersRepository.update(email);
    return { message: 'Xác thực tài khoản thành công!', status:  HttpRequestStatus.SUCCESS};
  }
}
