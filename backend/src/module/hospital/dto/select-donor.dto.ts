import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SelectDonorDto {
  @ApiProperty({ description: 'userId của donor được chọn' })
  @IsNotEmpty()
  @IsNumber()
  donorUserId!: number;

  @ApiProperty({ description: 'Khoảng cách từ bệnh viện đến donor (km)' })
  @IsNotEmpty()
  @IsNumber()
  distance!: number;

  @ApiProperty({ description: 'Mức độ khẩn cấp (1-5)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  urgency!: number;

  @ApiProperty({ description: 'Ghi chú thêm', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
