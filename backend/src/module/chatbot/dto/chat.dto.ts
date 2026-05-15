import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class ChatMessageDto {
  @ApiProperty({ description: 'Role of the message sender', enum: ['user', 'model'] })
  @IsString()
  @IsNotEmpty()
  role!: 'user' | 'model';

  @ApiProperty({ description: 'The message content' })
  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class ChatDto {
  @ApiProperty({ type: [ChatMessageDto], description: 'History of chat messages', required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];

  @ApiProperty({ description: 'The current message from user' })
  @IsString()
  @IsNotEmpty()
  message!: string;
}
