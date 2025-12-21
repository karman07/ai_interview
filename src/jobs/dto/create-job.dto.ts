import { IsString, IsArray, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @IsNumber()
  salary: number;

  @IsString()
  @IsNotEmpty()
  location: string;
}