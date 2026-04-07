import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class VerifyOtpDto {
  @ApiProperty({ description: 'Email người dùng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @ApiProperty({ description: 'Mã OTP' })
  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  @IsString()
  otp!: string;
}
