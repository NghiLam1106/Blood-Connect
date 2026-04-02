import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { MailProcessor } from 'src/helpers/mail/mail.processor';
import { UsersRepository } from '../users/repository/users.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [BullModule.registerQueue({
    name: 'mail_queue',
  }), PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, MailProcessor],
  exports: [],
})
export class AuthModule { }
