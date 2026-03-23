import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsArray,
} from 'class-validator';

export class CreateClassDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  semester?: string;
}

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  semester?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class EnrollStudentsDto {
  @IsArray()
  @IsString({ each: true })
  studentIds: string[];
}
