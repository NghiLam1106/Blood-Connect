import { InjectRedis } from '@nestjs-modules/ioredis';
import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { HttpRequestStatus } from 'src/enums/httpRequest.enum';
import { DonorsRepository } from '../donors/repository/donors.respository';
import { UsersRepository } from '../users/repository/users.repository';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectQueue('mail_queue') private mailQueue: Queue,
    @InjectRedis() private readonly redis: Redis,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly donorsRepository: DonorsRepository
  ) { }

  async register(registerDto: RegisterDto) {
    const { name, email, phone, bloodType, password, role } = registerDto;

    const userExists = await this.usersRepository.findByEmail(email);

    if (userExists) {
      throw new BadRequestException('Email này đã được sử dụng!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    return { message: 'Đăng ký tài khoản thành công!', status: HttpRequestStatus.SUCCESS };
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

    const user = await this.usersRepository.findByEmail(email);

    const donor = await this.donorsRepository.findByUserId(user?.id!);

    const payload = {
      userId: user?.id,
      email: user?.email,
      role: user?.role,
    };
    const accessToken = this.jwtService.sign(payload, { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: '7d' });
    return {
      message: 'Xác thực tài khoản thành công!',
      status: HttpRequestStatus.SUCCESS,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
          bloodType: donor?.bloodType,
          lastDonation: donor?.lastDonation,
          role: user?.role
        }
      }
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại!');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu không chính xác!');
    }
    const donor = await this.donorsRepository.findByUserId(user.id);
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload, { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: '7d' });
    return {
      message: 'Đăng nhập thành công!',
      status: HttpRequestStatus.SUCCESS,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          bloodType: donor?.bloodType,
          lastDonation: donor?.lastDonation,
          role: user.role
        }
      }
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    let decodedToken: any;
    try {
      decodedToken = this.jwtService.verify(refreshToken, { secret: process.env.REFRESH_TOKEN_SECRET });
    } catch (error) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn!');
    }

    const user = await this.usersRepository.findByEmail(decodedToken.email);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại hoặc đã bị khoá!');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload, { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: '1h' });
    return {
      message: 'Refresh token thành công!',
      status: HttpRequestStatus.SUCCESS,
      data: {
        accessToken
      }
    };
  }
}
