import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostReportBody {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  postingId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  replyId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}
