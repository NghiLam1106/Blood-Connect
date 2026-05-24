import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { HttpRequestStatus } from '../../enums/httpRequest.enum';
import { AdminService } from './admin.service';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('stats')
  @Roles('ADMIN')
  async getStats() {
    const data = await this.adminService.getStats();
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Lấy thống kê hệ thống thành công!',
      data,
    };
  }

  @Get('stats/demand-chart')
  @Roles('ADMIN')
  async getDemandChart(@Query('days') days: string) {
    const daysNum = Math.min(Math.max(Number(days) || 30, 7), 90);
    const data = await this.adminService.getDemandChart(daysNum);
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Lấy dữ liệu biểu đồ thành công!',
      data,
    };
  }

  @Get('recent-traffic')
  @Roles('ADMIN')
  async getRecentTraffic(@Query('limit') limit: string) {
    const limitNum = Math.min(Math.max(Number(limit) || 5, 1), 20);
    const data = await this.adminService.getRecentTraffic(limitNum);
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Lấy lưu lượng gần đây thành công!',
      data,
    };
  }

  @Get('hospitals-traffic')
  @Roles('ADMIN')
  async getHospitalsTraffic(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('status') status: string,
    @Query('bloodType') bloodType: string,
  ) {
    const data = await this.adminService.getHospitalsTraffic({
      page: Math.max(Number(page) || 1, 1),
      limit: Math.min(Math.max(Number(limit) || 20, 5), 100),
      search: search || undefined,
      status: status || undefined,
      bloodType: bloodType || undefined,
    });
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Lấy danh sách lưu lượng bệnh viện thành công!',
      data,
    };
  }
}
