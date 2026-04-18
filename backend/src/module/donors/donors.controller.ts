import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../src/common/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DonorsService } from './donors.service';
import { UpdateDonorsDto } from './dto/updateDonors.dto';
import { Roles } from '../../common/guards/roles.decorator';
import { RespondDonorDto } from '../hospital/dto/respond-donor.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('/donors')
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) { }

  @Patch('update-donor/:id')
  async updateDonor(@Param('id') id: number, @Body() body: UpdateDonorsDto) {
    return await this.donorsService.updateDonor(id, body);
  }

  @Get('get-donor/:id')
  async getDonorById(@Param('id') id: number) {
    return await this.donorsService.getDonorById(id);
  }
  
  @Post('/respond-donor')
  @Roles('DONOR')
  async respondDonor(@Body() dto: RespondDonorDto) {
    return this.donorsService.respondDonor(dto);
  }
}

