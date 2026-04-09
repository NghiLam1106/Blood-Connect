import { Injectable } from '@nestjs/common';
import { HttpRequestStatus } from 'src/enums/httpRequest.enum';
import { GeocodingService } from 'src/helpers/map/openStreetMap.map';
import { UpdateDonorsDto } from './dto/updateDonors.dto';
import { DonorsRepository } from './repository/donors.respository';

@Injectable()
export class DonorsService {

  constructor(
    private readonly donorsRepository: DonorsRepository,
    private readonly geocodingService: GeocodingService
  ) { }

  async updateDonor(userId: number, body: UpdateDonorsDto) {
    const { weight, unitBlood, address, bloodType, lastDonation, responseRate, status } = body;
    let data: any;
    if (address) {
      const coordinates = await this.geocodingService.getCoordinates(address);
      data = await this.donorsRepository.updateDonor(userId, { weight, unitBlood, address, bloodType, lastDonation, responseRate, status }, { lat: coordinates.lat, lng: coordinates.lon });
    } else {
      data = await this.donorsRepository.updateDonor(userId, { weight, unitBlood, address, bloodType, lastDonation, responseRate, status });
    }
    return { message: 'Cập nhật thông tin hiến máu thành công!', status: HttpRequestStatus.SUCCESS, data };
  }
}
