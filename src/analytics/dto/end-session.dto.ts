import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class EndSessionDto {
  @ApiProperty({ example: 'session_1759377952761_aozn7jswc' })
  @IsString()
  sessionId: string;

  @ApiProperty({ required: false, description: 'Exit page URL' })
  @IsOptional()
  @IsString()
  exitPage?: string;
}
