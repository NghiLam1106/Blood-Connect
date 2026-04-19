import { InjectRedis } from '@nestjs-modules/ioredis';
import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';
import { Redis } from 'ioredis';
import { HttpRequestStatus } from '../../../src/enums/httpRequest.enum';
import { DonorsRepository } from '../donors/repository/donors.respository';
import { UsersRepository } from '../users/repository/users.repository';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterHospitalDto } from './dto/registerHospital.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { VerifyForgotPasswordOtpDto } from './dto/verifyForgotPasswordOtp.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectQueue('mail_queue') private mailQueue: Queue,
    @InjectRedis() private readonly redis: Redis,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly donorsRepository: DonorsRepository,
  ) { }

  async registerHospital(registerHospitalDto: RegisterHospitalDto) {
    const {
      name,
      email,
      phone,
      address,
      password,
      licenseCode,
      pathFile,
      role,
    } = registerHospitalDto;

    const userExists = await this.usersRepository.findByEmail(email);

    if (userExists) {
      throw new BadRequestException({
        status: HttpRequestStatus.ERROR,
        message: 'Email này đã được sử dụng!',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.usersRepository.create({
      name,
      email,
      phone,
      address,
      licenseCode,
      pathFile,
      hashedPassword,
      role,
    });

    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Đăng ký tài khoản thành công!',
    };
  }

  async register(registerDto: RegisterDto) {
    const { name, email, phone, bloodType, password, role } = registerDto;

    const userExists = await this.usersRepository.findByEmail(email);

    if (userExists) {
      throw new BadRequestException({
        status: HttpRequestStatus.ERROR,
        message: 'Email này đã được sử dụng!',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.usersRepository.create({
      name,
      email,
      phone,
      bloodType,
      hashedPassword,
      role,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.redis.set(`otp:${email}`, otp, 'EX', 300);

    await this.mailQueue.add(
      'sendOtpEmail',
      {
        email,
        otp,
        name,
      },
      {
        attempts: 3,
        backoff: 5000,
      },
    );

    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Đăng ký tài khoản thành công!',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;
    const storedOtp = await this.redis.get(`otp:${email}`);
    if (!storedOtp) {
      throw new BadRequestException({
        status: HttpRequestStatus.ERROR,
        message: 'Mã OTP đã hết hạn!',
      });
    }
    if (storedOtp !== otp) {
      throw new BadRequestException({
        status: HttpRequestStatus.ERROR,
        message: 'Mã OTP không chính xác!',
      });
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
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: '1h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Xác thực tài khoản thành công!',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
          bloodType: donor?.bloodType,
          avatar: user?.avatar,
          role: user?.role,
        },
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException({
        status: HttpRequestStatus.ERROR,
        message: 'Email không tồn tại!',
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException({
        status: HttpRequestStatus.ERROR,
        message: 'Mật khẩu không chính xác!',
      });
    }
    const donor = await this.donorsRepository.findByUserId(user.id);
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: '1h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Đăng nhập thành công!',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          bloodType: donor?.bloodType,
          avatar: user?.avatar,
          role: user.role,
        },
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    let decodedToken: any;
    try {
      decodedToken = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException(
        {
          status: HttpRequestStatus.UNAUTHORIZED,
          message: 'Refresh token không hợp lệ hoặc đã hết hạn!',
        }
      );
    }

    const user = await this.usersRepository.findByEmail(decodedToken.email);
    if (!user) {
      throw new UnauthorizedException(
        {
          status: HttpRequestStatus.UNAUTHORIZED,
          message: 'Người dùng không tồn tại hoặc đã bị khoá!',
        }
      );
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: '1h',
    });
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Refresh token thành công!',
      data: {
        accessToken,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException({
        status: HttpRequestStatus.ERROR,
        message: 'Email không tồn tại!',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.redis.set(`forgot_password_otp:${email}`, otp, 'EX', 300);

    await this.mailQueue.add(
      'sendForgotPasswordEmail',
      {
        email,
        otp,
        name: user.name,
      },
      {
        attempts: 3,
        backoff: 5000,
      },
    );

    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn!',
    };
  }

  async verifyForgotPasswordOtp(verifyForgotPasswordOtpDto: VerifyForgotPasswordOtpDto) {
    const { email, otp } = verifyForgotPasswordOtpDto;

    const storedOtp = await this.redis.get(`forgot_password_otp:${email}`);
    if (!storedOtp) {
      throw new BadRequestException({
        status: HttpRequestStatus.ERROR,
        message: 'Mã OTP đã hết hạn!',
      });
    }

    if (storedOtp !== otp) {
      throw new BadRequestException({
        status: HttpRequestStatus.ERROR,
        message: 'Mã OTP không chính xác!',
      });
    }

    await this.redis.del(`forgot_password_otp:${email}`);

    const resetToken = crypto.randomUUID();

    await this.redis.set(`reset_password_token:${email}`, resetToken, 'EX', 300);

    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Xác thực OTP thành công!',
      data: {
        resetToken,
      },
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, resetToken, newPassword } = resetPasswordDto;

    const storedToken = await this.redis.get(`reset_password_token:${email}`);
    if (!storedToken || storedToken !== resetToken) {
      throw new BadRequestException({
        status: HttpRequestStatus.ERROR,
        message: 'Phiên đặt lại mật khẩu đã hết hạn hoặc không hợp lệ!',
      });
    }

    await this.redis.del(`reset_password_token:${email}`);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.updatePassword(email, hashedPassword);

    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Đặt lại mật khẩu thành công!',
    };
  }
}
