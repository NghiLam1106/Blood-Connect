import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { NotificationService } from './notification.service';

@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Notification')
@Controller('/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  /**
   * Donor lấy danh sách thông báo của mình
   * GET /notifications/donor
   */
  @Get('/donor')
  @Roles('DONOR')
  async getMyNotifications(@Req() req: any) {
    const userId: number = req.user.userId;
    return this.notificationService.getNotificationsByDonor(userId);
  }
}
