import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeocodingService {
  constructor(private readonly httpService: HttpService) {}

  async getCoordinates(address: string|undefined) {
    // Nominatim API URL
    const url = `https://nominatim.openstreetmap.org/search`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            q: address,
            format: 'json',
            limit: 1,
            addressdetails: 1,
          },
          headers: {
            // Rất quan trọng: OSM yêu cầu User-Agent để tránh bị coi là bot spam
            'User-Agent': `BloodConnect/1.0 (${process.env.MAIL_USER})`,
          },
        }),
      );

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return { lat: Number(lat), lon: Number(lon) };
      }

      throw new HttpException('Không tìm thấy tọa độ cho địa chỉ này', HttpStatus.NOT_FOUND);
    } catch (error) {
      throw new HttpException(
        'Lỗi khi kết nối với dịch vụ Geocoding',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
