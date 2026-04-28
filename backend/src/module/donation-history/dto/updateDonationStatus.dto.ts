import { ApiProperty } from "@nestjs/swagger";
import { StatusDonation } from "../../../../generated/prisma/enums";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";

export class UpdateDonationStatusDto {
  @ApiProperty({ description: 'Trạng thái hiến máu', enum: StatusDonation })
  @IsEnum(StatusDonation)
  @IsNotEmpty()
  status!: StatusDonation;

  @ApiProperty({ description: 'Id của người hiến máu' })
  @IsNumber()
  @IsNotEmpty()
  donorId!: number;
}
