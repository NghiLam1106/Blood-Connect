import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Status } from "../../../../generated/prisma/enums";

export class CreateDonorsDto {
  @ApiProperty({ description: 'Tên người hiến máu' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString({ message: 'Tên phải là chuỗi' })
  name!: string;

  @ApiProperty({ description: 'Cân nặng người hiến máu' })
  @IsNotEmpty({ message: 'Cân nặng không được để trống' })
  @IsNumber({}, { message: 'Cân nặng phải là số' })
  weight!: number;

  @ApiProperty({ description: 'Đơn vị máu' })
  @IsNotEmpty({ message: 'Đơn vị máu không được để trống' })
  @IsNumber({}, { message: 'Đơn vị máu phải là số' })
  unitBlood!: number;

  @ApiProperty({ description: 'Địa chỉ' })
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  address!: string;

  @ApiProperty({ description: 'Nhóm máu' })
  @IsNotEmpty({ message: 'Nhóm máu không được để trống' })
  @IsString({ message: 'Nhóm máu phải là chuỗi' })
  bloodType!: string;

  // @ApiProperty({ description: 'Ngày hiến máu gần nhất' })
  // @IsNotEmpty({ message: 'Ngày hiến máu gần nhất không được để trống' })
  // @IsDate({ message: 'Ngày hiến máu gần nhất phải là ngày' })
  // lastDonation!: Date;

  // @ApiProperty({ description: 'Tỷ lệ phản hồi' })
  // @IsNotEmpty({ message: 'Tỷ lệ phản hồi không được để trống' })
  // @IsNumber({}, { message: 'Tỷ lệ phản hồi phải là số' })
  // responseRate!: number;

  @ApiProperty({ description: 'Ảnh đại diện' })
  @IsString({ message: 'Ảnh đại diện phải là chuỗi' })
  @IsNotEmpty({ message: 'Ảnh đại diện không được để trống' })
  avatar!: string;

  @ApiProperty({ description: 'Trạng thái' })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsString({ message: 'Trạng thái phải là chuỗi' })
  status!: Status;
}
