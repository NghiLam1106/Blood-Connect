import { RedisModule } from '@nestjs-modules/ioredis';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminModule } from './module/admin/admin.module';
import { AuthModule } from './module/auth/auth.module';
import { ChatbotModule } from './module/chatbot/chatbot.module';
import { DonationHistoryModule } from './module/donation-history/donationHistory.module';
import { DonorsModule } from './module/donors/donors.module';
import { HospitalModule } from './module/hospital/hospital.module';
import { NotificationModule } from './module/notification/notification.module';
import { UsersModule } from './module/users/users.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    DonorsModule,
    HospitalModule,
    NotificationModule,
    DonationHistoryModule,
    ChatbotModule,
    AdminModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL');

        console.log('--- [BullModule] Đang kết nối Redis với URL:', redisUrl);

        if (redisUrl) {
          const isExternal = redisUrl.includes('render.com');

          return {
            connection: {
              url: redisUrl,
              ...(isExternal && {
                tls: {
                  rejectUnauthorized: false,
                },
              }),
            },
          };
        }

        return {
          connection: {
            host: config.get('REDIS_HOST'),
            port: Number(config.get('REDIS_PORT')),
          },
        };
      },
    }),

    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: Number(config.get('MAIL_PORT')),
          secure: false,
          requireTLS: true,
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASSWORD'),
          },
        },
      }),
    }),

    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: config.get('REDIS_URL') || `redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
