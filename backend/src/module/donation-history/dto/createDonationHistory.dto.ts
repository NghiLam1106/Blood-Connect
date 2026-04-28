import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDonationHistoryDto {
  @ApiProperty({ description: 'Mã số của người hiến máu' })
  @IsNumber()
  @IsNotEmpty()
  donorId!: number;

  @ApiProperty({ description: 'Mã số của cơ sở y tế/bệnh viện' })
  @IsNumber()
  @IsNotEmpty()
  hospitalId!: number;

  @ApiProperty({ description: 'Lượng máu đã hiến' })
  @IsNumber()
  @IsNotEmpty()
  unitBlood!: number;

  @ApiProperty({ description: 'Nhóm máu đã hiến' })
  @IsString()
  @IsNotEmpty()
  bloodType!: string;

  @ApiPropertyOptional({ description: 'Ghi chú thêm về lần hiến máu' })
  @IsString()
  @IsOptional()
  notes?: string;
}
