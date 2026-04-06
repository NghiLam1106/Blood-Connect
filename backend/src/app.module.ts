import { RedisModule } from '@nestjs-modules/ioredis';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './module/auth/auth.module';
import { UsersModule } from './module/users/users.module';

@Module({
  imports: [UsersModule, AuthModule, ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env'
  }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
    }),
    RedisModule.forRoot({
      type: 'single',
      options: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
