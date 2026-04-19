import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyForgotPasswordOtpDto {
  @ApiProperty({ description: 'Email người dùng' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @ApiProperty({ description: 'Mã OTP' })
  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  otp!: string;
}
