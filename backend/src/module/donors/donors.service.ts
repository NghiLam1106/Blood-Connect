import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpRequestStatus } from '../../../src/enums/httpRequest.enum';
import { GeocodingService } from '../../../src/helpers/map/openStreetMap.map';
import { RespondDonorDto } from '../hospital/dto/respond-donor.dto';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationRepository } from '../notification/notification.repository';
import { UpdateDonorsDto } from './dto/updateDonors.dto';
import { DonorsRepository } from './repository/donors.respository';

@Injectable()
export class DonorsService {

  constructor(
    private readonly donorsRepository: DonorsRepository,
    private readonly geocodingService: GeocodingService,
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationGateway: NotificationGateway,
  ) { }

  async updateDonor(userId: number, body: UpdateDonorsDto) {
    const { weight, unitBlood, address, bloodType, name, avatar, status } = body;
    let data: any;
    if (address) {
      const coordinates = await this.geocodingService.getCoordinates(address);
      data = await this.donorsRepository.updateDonor(userId, { weight, unitBlood, address, bloodType, name, avatar, status }, { lat: coordinates.lat, lng: coordinates.lon });
    } else {
      data = await this.donorsRepository.updateDonor(userId, { weight, unitBlood, address, bloodType, name, avatar, status });
    }
    return { message: 'Cập nhật thông tin người hiến máu thành công!', status: HttpRequestStatus.SUCCESS, data };
  }

  async getDonorById(id: number) {
    const donor = await this.donorsRepository.getDonorById(id);
    return { message: 'Lấy thông tin người hiến máu thành công!', status: HttpRequestStatus.SUCCESS, data: donor };
  }

  /**
   * Donor chấp nhận hoặc từ chối yêu cầu hiến máu
   */
  async respondDonor(dto: RespondDonorDto) {
    const { donorUserId, action, notificationId } = dto;

    const donor = await this.donorsRepository.findByUserId(donorUserId);
    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    const isAccept = action === 'accept';
    await this.notificationRepository.updateAcceptStatus(notificationId, isAccept);

    const notification = await this.notificationRepository.findByIdWithHospital(notificationId);
    if (notification && notification.hospital) {
      const donorFull = await this.donorsRepository.getDonorById(donorUserId);
      const payload = {
        action,
        donorUserId,
        donorName: donorFull?.name,
        donorPhone: donorFull?.phone,
        message: isAccept ? 'Người hiến máu đã chấp nhận yêu cầu của bạn.' : 'Người hiến máu đã từ chối yêu cầu.'
      };

      await this.notificationGateway.sendToUser(
        notification.hospital.userId,
        'donor-response',
        payload
      );
    }

    if (isAccept) {
      return {
        status: HttpRequestStatus.SUCCESS,
        message: 'Donor đã chấp nhận yêu cầu hiến máu.',
      };
    }

    // action === 'reject'
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Donor đã từ chối yêu cầu hiến máu.',
    };
  }
}
