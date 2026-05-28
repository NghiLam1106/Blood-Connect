import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../../common/guards/auth.guard";
import { Roles } from "../../common/guards/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { RequestDto } from "./dto/request.dto";
import { SelectDonorDto } from "./dto/select-donor.dto";
import { HospitalService } from "./hospital.service";

@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Hospital')
@Controller('/hospital')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) { }

  @Post('/request/:id')
  @Roles('HOSPITAL')
  async requestBlood(@Param('id') id: number, @Body() requestDto: RequestDto) {
    return this.hospitalService.requestBlood(id, requestDto);
  }

  @Post('/select-donor/:id')
  @Roles('HOSPITAL')
  async selectDonor(@Param('id') id: number, @Body() dto: SelectDonorDto) {
    return this.hospitalService.selectDonor(id, dto);
  }

  @Get('/reports/:id')
  @Roles('HOSPITAL')
  async getReportStats(@Param('id') id: number) {
    return this.hospitalService.getReportStats(id);
  }

  @Get('/notifications/:id')
  @Roles('HOSPITAL')
  async getNotificationHistory(
    @Param('id') id: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('isAccept') isAccept?: string,
  ) {
    return this.hospitalService.getNotificationHistory(id, page, limit, isAccept);
  }

  @Get('/chart/:id')
  @Roles('HOSPITAL')
  async getChartData(
    @Param('id') id: number,
    @Query('days') days: number = 30,
  ) {
    return this.hospitalService.getChartData(id, days);
  }

  @Get('/blood-types/:id')
  @Roles('HOSPITAL')
  async getBloodTypeDistribution(@Param('id') id: number) {
    return this.hospitalService.getBloodTypeDistribution(id);
  }
}
