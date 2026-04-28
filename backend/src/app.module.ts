import { RedisModule } from '@nestjs-modules/ioredis';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './module/auth/auth.module';
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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: config.get('REDIS_URL')
          ? { url: config.get('REDIS_URL') }
          : { host: config.get('REDIS_HOST'), port: config.get('REDIS_PORT') }
      }),
    }),

    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: Number(config.get('MAIL_PORT')),
          secure: false,
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
