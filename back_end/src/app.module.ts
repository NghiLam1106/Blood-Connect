import { Module } from '@nestjs/common';
import { UsersModule } from './module/users/user.module';

@Module({
  imports: [UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
