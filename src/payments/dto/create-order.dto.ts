import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsEnum } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  receipt?: string;

  @IsOptional()
  notes?: Record<string, any>;
}