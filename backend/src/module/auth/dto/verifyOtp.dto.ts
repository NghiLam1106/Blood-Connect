import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  @IsString()
  otp!: string;
}
