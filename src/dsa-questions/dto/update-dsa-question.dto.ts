import { PartialType } from '@nestjs/swagger';
import { CreateDsaQuestionDto } from './create-dsa-question.dto';

export class UpdateDsaQuestionDto extends PartialType(CreateDsaQuestionDto) {}
