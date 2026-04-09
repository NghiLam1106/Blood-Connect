import { IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { Role } from '../../../../generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Tên người dùng' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Email người dùng' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @ApiProperty({ description: 'Số điện thoại người dùng' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsPhoneNumber('VN')
  phone!: string;

  @ApiProperty({ description: 'Nhóm máu người dùng' })
  @IsNotEmpty({ message: 'Nhóm máu không được để trống' })
  @IsString()
  bloodType!: string;

  @ApiProperty({ description: 'Mật khẩu người dùng' })
  @MinLength(6, { message: 'Mật khẩu phải ít nhất 6 ký tự' })
  password!: string;

  @ApiProperty({ description: 'Role người dùng' })
  @IsEnum(Role, { message: 'Role phải là ADMIN, DONOR hoặc REQUESTER' })
  role!: Role;
}
