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
}
