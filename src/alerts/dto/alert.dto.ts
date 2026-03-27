import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateAlertDto {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
