import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyRoundDto } from './create-company-round.dto';

export class UpdateCompanyRoundDto extends PartialType(CreateCompanyRoundDto) {}
