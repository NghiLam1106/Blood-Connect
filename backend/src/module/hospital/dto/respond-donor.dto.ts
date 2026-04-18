import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

export class RespondDonorDto {
  @ApiProperty({ description: 'ID của thông báo' })
  @IsNotEmpty()
  @IsNumber()
  notificationId!: number;

  @ApiProperty({ description: 'userId của donor phản hồi' })
  @IsNotEmpty()
  @IsNumber()
  donorUserId!: number;

  @ApiProperty({
    description: 'Hành động của donor: accept hoặc reject',
    enum: ['accept', 'reject'],
  })
  @IsNotEmpty()
  @IsIn(['accept', 'reject'], { message: 'action phải là "accept" hoặc "reject"' })
  action!: 'accept' | 'reject';
}
