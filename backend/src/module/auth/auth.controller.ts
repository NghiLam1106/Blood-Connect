import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterHospitalDto } from './dto/registerHospital.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { VerifyForgotPasswordOtpDto } from './dto/verifyForgotPasswordOtp.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  @Post('/register-hospital')
  async registerHospital(@Body() registerHospitalDto: RegisterHospitalDto) {
    return this.authService.registerHospital(registerHospitalDto);
  }

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  @Post('/verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('/verify-forgot-password-otp')
  async verifyForgotPasswordOtp(@Body() verifyForgotPasswordOtpDto: VerifyForgotPasswordOtpDto) {
    return this.authService.verifyForgotPasswordOtp(verifyForgotPasswordOtpDto);
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
