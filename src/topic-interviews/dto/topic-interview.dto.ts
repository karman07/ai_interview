import { IsArray, IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateTopicInterviewDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  links?: string[];

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateTopicInterviewDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  links?: string[];

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
