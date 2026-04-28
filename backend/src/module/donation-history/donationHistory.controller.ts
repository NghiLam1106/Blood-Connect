import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from "../../common/guards/auth.guard";
import { DonationHistoryService } from './donationHistory.service';
import { CreateDonationHistoryDto } from './dto/createDonationHistory.dto';
import { UpdateDonationStatusDto } from './dto/updateDonationStatus.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Donation History')
@Controller('donation-history')
export class DonationHistoryController {
  constructor(private readonly donationHistoryService: DonationHistoryService) { }

  @Get('get-donation-history-by-donor/:id')
  getByDonor(@Param('id', ParseIntPipe) donorId: number) {
    return this.donationHistoryService.getHistoryByDonor(donorId);
  }

  @Get('get-donation-history-by-hospital/:id')
  getByHospital(@Param('id', ParseIntPipe) hospitalId: number) {
    return this.donationHistoryService.getHistoryByHospital(hospitalId);
  }

  @Put('/update-donation-status/:id')
  async updateDonationStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDonationStatusDto) {
    return this.donationHistoryService.updateDonationStatus(id, dto);
  }
}
