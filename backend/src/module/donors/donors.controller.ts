import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DonorsService } from './donors.service';
import { UpdateDonorsDto } from './dto/updateDonors.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('/donors')
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) { }

  @Patch('update-donor/:id')
  async updateDonor(@Param('id') id: number, @Body() body: UpdateDonorsDto) {
    return await this.donorsService.updateDonor(id, body);
  }
}

