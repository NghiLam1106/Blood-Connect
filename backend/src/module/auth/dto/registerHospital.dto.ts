import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../generated/prisma/enums';

export class RegisterHospitalDto {
  @ApiProperty({ description: 'Tên người dùng' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString()
  nameHospital!: string;

  @ApiProperty({ description: 'Email người dùng' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @ApiProperty({ description: 'Số điện thoại người dùng' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsPhoneNumber('VN')
  phone!: string;

  @ApiProperty({ description: 'Địa chỉ người dùng' })
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @IsString()
  address!: string;

  @ApiProperty({ description: 'Mật khẩu người dùng' })
  @MinLength(6, { message: 'Mật khẩu phải ít nhất 6 ký tự' })
  password!: string;

  @ApiProperty({ description: 'Mã giấy phép hoạt động' })
  @IsOptional({ message: 'Mã giấy phép hoạt động không được để trống' })
  // @IsNotEmpty({ message: 'Mã giấy phép hoạt động không được để trống' })
  licenseCode!: string;

  @ApiProperty({ description: 'Tài liệu xác minh' })
  @IsOptional({ message: 'Tài liệu xác minh không được để trống' })
  // @IsNotEmpty({ message: 'Tài liệu xác minh không được để trống' })
  licenseFile!: string;

  @ApiProperty({ description: 'Role người dùng' })
  @IsEnum(Role, { message: 'Role phải là ADMIN, DONOR hoặc REQUESTER' })
  role!: Role;

  @ApiProperty({ description: 'Ten tinh/thanh pho', required: false })
  @IsOptional()
  @IsString()
  provinceName?: string;

  @ApiProperty({ description: 'Ten xa/phuong', required: false })
  @IsOptional()
  @IsString()
  wardName?: string;

  @ApiProperty({ description: 'So nha / ten duong', required: false })
  @IsOptional()
  @IsString()
  street?: string;
}
