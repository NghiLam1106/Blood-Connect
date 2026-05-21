import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { ChatbotService } from './chatbot.service';
import { ChatDto } from './dto/chat.dto';

@UseGuards(OptionalAuthGuard)
@ApiBearerAuth()
@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) { }

  @Post('message')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a message to the chatbot. Login required only for donation history queries.' })
  @ApiResponse({ status: 200, description: 'Successful response from the bot' })
  async sendMessage(@Request() req: any, @Body() chatDto: ChatDto) {
    // Lấy user từ request nếu có token hợp lệ (optional auth)
    const userId: number | null = req.user?.userId ?? null;
    const role: string | null = req.user?.role ?? null;
    return this.chatbotService.handleChat(chatDto, userId, role);
  }
}
