import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class RequestDto {
    @ApiProperty({ description: 'Số lượng đơn vị máu' })
    @IsNotEmpty({ message: 'Số lượng đơn vị máu không được để trống' })
    @IsNumber({}, { message: 'Số lượng đơn vị máu phải là số' })
    quantity!: number;

    @ApiProperty({ description: 'Nhóm máu' })
    @IsNotEmpty({ message: 'Nhóm máu không được để trống' })
    @IsString({ message: 'Nhóm máu phải là chuỗi' })
    bloodType!: string;

    @ApiProperty({ description: 'Trường hợp khẩn cấp' })
    @IsNumber({}, { message: 'Trường hợp khẩn cấp phải là số' })
    urgency!: number;

    @ApiProperty({ description: 'Ghi chú' })
    @IsString({ message: 'Ghi chú phải là chuỗi' })
    @IsOptional()
    notes?: string;
}
