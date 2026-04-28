import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
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
  @Roles('REQUESTER')
  async requestBlood(@Param('id') id: number, @Body() requestDto: RequestDto) {
    return this.hospitalService.requestBlood(id, requestDto);
  }

  @Post('/select-donor/:id')
  @Roles('REQUESTER')
  async selectDonor(@Param('id') id: number, @Body() dto: SelectDonorDto) {
    return this.hospitalService.selectDonor(id, dto);
  }
}
