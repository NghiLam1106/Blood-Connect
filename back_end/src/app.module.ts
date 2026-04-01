import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './module/auth/auth.module';
import { UsersModule } from './module/users/users.module';

@Module({
  imports: [UsersModule, AuthModule, ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    })],
  controllers: [],
  providers: [],
})
export class AppModule {}
