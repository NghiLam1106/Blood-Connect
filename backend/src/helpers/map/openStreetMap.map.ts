import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HttpRequestStatus } from '../../enums/httpRequest.enum';

@Injectable()
export class GeocodingService {
  constructor(private readonly httpService: HttpService) {}

  async getCoordinates(address: string | undefined) {
    if (!address) {
      throw new HttpException('Địa chỉ không được để trống', HttpStatus.BAD_REQUEST);
    }

    const url = `https://rsapi.goong.io/Geocode`;

    const apiKey = process.env.GOONG_API_KEY;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            address: address,
            api_key: apiKey,
          },
        }),
      );

      if (response.data && response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;

        return {
          lat: Number(location.lat),
          lon: Number(location.lng)
        };
      }

      throw new HttpException('Không tìm thấy tọa độ cho địa chỉ này tại Goong Maps', HttpRequestStatus.NOT_FOUND);
    } catch (error: any) {
      console.error('Goong Maps Error:', error.response?.data || error.message);

      throw new HttpException(
        'Lỗi khi kết nối với dịch vụ Goong Maps',
        HttpRequestStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
