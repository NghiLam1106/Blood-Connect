import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpRequestStatus } from '../../enums/httpRequest.enum';
import { DonorsRepository } from '../donors/repository/donors.respository';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly donorsRepository: DonorsRepository,
  ) { }

  /**
   * Lấy danh sách thông báo của donor đang đăng nhập
   */
  async getNotificationsByDonor(userId: number) {
    const donor = await this.donorsRepository.findByUserId(userId);
    if (!donor) {
      throw new NotFoundException({
        status: HttpRequestStatus.NOT_FOUND,
        message: 'Không tìm thấy thông tin donor',
      });
    }

    const notifications = await this.notificationRepository.findByDonorUserId(userId);

    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Lấy danh sách thông báo thành công',
      data: notifications,
    };
  }
}
