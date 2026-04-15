import { Body, Controller, HttpCode, Param, Post } from "@nestjs/common";
import { HospitalService } from "./hospital.service";
import { RequestDto } from "./dto/request.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { ApiTags } from "@nestjs/swagger";
import { Roles } from "../../common/guards/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

@UseGuards(AuthGuard, RolesGuard)
@Roles('REQUESTER')
@ApiBearerAuth()
@ApiTags('hospital')
@Controller('/hospital')
export class HospitalController {
    constructor(private readonly hospitalService: HospitalService) { }

    @Post('/request/:id')
    async requestBlood(@Param('id') id: number, @Body() requestDto: RequestDto) {
        return this.hospitalService.requestBlood(id, requestDto);
    }
}
