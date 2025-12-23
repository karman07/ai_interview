import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { RequestStatus } from '../schemas/employer-request.schema';

export class CreateEmployerRequestDto {
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsOptional()
  @IsString()
  message?: string;
}

export class RespondToRequestDto {
  @IsEnum(RequestStatus)
  status: RequestStatus.ACCEPTED | RequestStatus.REJECTED;

  @IsOptional()
  @IsString()
  employeeResponse?: string;
}