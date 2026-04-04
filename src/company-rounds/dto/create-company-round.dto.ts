import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { normalizeRoundType, ROUND_TYPES } from '../schemas/company-round.schema';

export class CreateCompanyRoundDto {
  @IsString()
  company: string;

  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? normalizeRoundType(value) : value))
  @IsIn(ROUND_TYPES)
  roundType: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map((tag) => tag.trim()).filter(Boolean);
      }
    }
    return value;
  })
  tags?: string[];

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isPublished?: boolean;
}
