import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { HttpRequestStatus } from '../../enums/httpRequest.enum';
import { CreateDonationHistoryDto } from './dto/createDonationHistory.dto';
import { DonationHistoryRepository } from './repository/donationHistory.repository';
import { DonorsRepository } from '../donors/repository/donors.respository';
import { HospitalRepository } from '../hospital/repository/hospital.repository';
import { UpdateDonationStatusDto } from './dto/updateDonationStatus.dto';
import { StatusDonation } from '../../../generated/prisma/enums';

@Injectable()
export class DonationHistoryService {
  constructor(
    private readonly donationHistoryRepository: DonationHistoryRepository,
    private readonly donorRepository: DonorsRepository,
    private readonly hospitalRepository: HospitalRepository
  ) { }

  async createHistory(data: CreateDonationHistoryDto) {
    // Note: Cần cẩn thận check tồn tại của donorId và hospitalId nếu cần,
    // Tuy nhiên Prisma sẽ throw foreign key error nên có thể để catch ở exception filter tổng!
    const history = await this.donationHistoryRepository.create(data);
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Tạo lịch sử hiến máu thành công!',
      data: history,
    };
  }

  async getHistoryByDonor(donorId: number) {
    const donor = await this.donorRepository.findByUserId(donorId);
    if (!donor) {
      throw new NotFoundException({
        status: HttpRequestStatus.NOT_FOUND,
        message: 'Không tìm thấy thông tin người hiến máu!',
      });
    }
    const history = await this.donationHistoryRepository.findByDonorId(donor.id);
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Lấy danh sách lịch sử hiến máu thành công!',
      data: history,
    };
  }

  async getHistoryByHospital(hospitalId: number) {
    const hospital = await this.hospitalRepository.findByUserId(Number(hospitalId));
    if (!hospital) {
      throw new NotFoundException({
        status: HttpRequestStatus.NOT_FOUND,
        message: 'Không tìm thấy bệnh viện'
      });
    }
    const history = await this.donationHistoryRepository.findByHospitalId(hospital.id);
    if (!history) {
      throw new NotFoundException({
        status: HttpRequestStatus.NOT_FOUND,
        message: 'Không tìm thấy lịch sử hiến máu'
      });
    }
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Lấy lịch sử hiến máu thành công!',
      data: history,
    };
  }

  async updateDonationStatus(id: number, dto: UpdateDonationStatusDto) {
    const getDonation = await this.donationHistoryRepository.findById(id);
    if (!getDonation) {
      throw new NotFoundException({
        status: HttpRequestStatus.NOT_FOUND,
        message: 'Không tìm thấy lịch sử hiến máu'
      });
    }

    if (getDonation.status !== StatusDonation.PENDING) {
      throw new BadRequestException({
        status: HttpRequestStatus.ERROR,
        message: 'Lịch sử hiến máu đã được xử lý trước đó'
      });
    }

    const donation = await this.donationHistoryRepository.updateStatus(id, dto.status);
    if (!donation) {
      throw new NotFoundException({
        status: HttpRequestStatus.NOT_FOUND,
        message: 'Không tìm thấy lịch sử hiến máu'
      });
    }
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Cập nhật trạng thái hiến máu thành công!',
      data: donation,
    };
  }
}
