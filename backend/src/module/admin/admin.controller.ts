import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
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

  @Get('hospitals')
  @Roles('ADMIN')
  async getHospitals(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('isVerified') isVerified: string,
  ) {
    let isVerifiedFilter: boolean | undefined = undefined;
    if (isVerified === 'true') isVerifiedFilter = true;
    else if (isVerified === 'false') isVerifiedFilter = false;

    const data = await this.adminService.getHospitals({
      page: Math.max(Number(page) || 1, 1),
      limit: Math.min(Math.max(Number(limit) || 20, 5), 100),
      search: search || undefined,
      isVerified: isVerifiedFilter,
    });
    return {
      status: 'success',
      message: 'Lấy danh sách bệnh viện thành công!',
      data,
    };
  }

  @Patch('hospitals/:userId/verify')
  @Roles('ADMIN')
  async verifyHospital(
    @Param('userId') userId: string,
    @Body('isVerified') isVerified: boolean,
  ) {
    const data = await this.adminService.verifyHospital(Number(userId), isVerified);
    return {
      status: 'success',
      message: isVerified
        ? 'Đã xác minh bệnh viện thành công!'
        : 'Đã thu hồi xác minh bệnh viện!',
      data,
    };
  }

  @Get('donors')
  @Roles('ADMIN')
  async getDonors(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('bloodType') bloodType: string,
    @Query('status') status: string,
  ) {
    const data = await this.adminService.getDonors({
      page: Math.max(Number(page) || 1, 1),
      limit: Math.min(Math.max(Number(limit) || 20, 5), 100),
      search: search || undefined,
      bloodType: bloodType || undefined,
      status: status || undefined,
    });
    return {
      status: HttpRequestStatus.SUCCESS,
      message: 'Lấy danh sách người hiến máu thành công!',
      data,
    };
  }
}
