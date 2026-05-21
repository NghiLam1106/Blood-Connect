import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DonationHistoryModule } from '../donation-history/donationHistory.module';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

@Module({
  imports: [ConfigModule, DonationHistoryModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, PrismaService, JwtService, OptionalAuthGuard],
})
export class ChatbotModule { }

