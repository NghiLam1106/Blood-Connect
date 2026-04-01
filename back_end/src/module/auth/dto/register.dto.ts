import { IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { Role } from 'generated/prisma/enums';

export class RegisterDto {
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString()
  name!: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsPhoneNumber('VN')
  phone!: string;

  @IsNotEmpty({ message: 'Nhóm máu không được để trống' })
  @IsString()
  bloodType!: string;

  @MinLength(6, { message: 'Mật khẩu phải ít nhất 6 ký tự' })
  password!: string;

  @IsEnum(Role, { message: 'Role phải là ADMIN, DONOR hoặc REQUESTER' })
  role!: Role;
}
