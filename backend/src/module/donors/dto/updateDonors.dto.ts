import { PartialType } from '@nestjs/swagger';
import { CreateDonorsDto } from './createDonors.dto';

export class UpdateDonorsDto extends PartialType(CreateDonorsDto) {}
