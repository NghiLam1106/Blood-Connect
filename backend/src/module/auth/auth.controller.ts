import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { RegisterHospitalDto } from './dto/registerHospital.dto';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @ApiOperation({ summary: 'Đăng ký tài khoản bệnh viện' })
  @Post('/register-hospital')
  async registerHospital(@Body() registerHospitalDto: RegisterHospitalDto) {
    return this.authService.registerHospital(registerHospitalDto);
  }

  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Xác thực mã OTP' })
  @Post('/verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @ApiOperation({ summary: 'Đăng nhập vào hệ thống' })
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Cấp lại access token bằng refresh token' })
  @Post('/refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
