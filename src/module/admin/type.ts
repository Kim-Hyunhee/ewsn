import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetUserQuery {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  option: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  keyword: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number;
}

export class GetFlagQuery {
  @ApiProperty({ required: false })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page: number;
}

export class PatchFlagStatusBody {
  @ApiProperty({ enum: ['제작중', '제작완료'] })
  @IsString()
  @IsNotEmpty()
  status: string;
}

export class PutAdvertisementBody {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  link: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  image: string;
}

export class GetReportQuery {
  @ApiProperty({ enum: ['posting', 'reply'] })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page: number;
}

export class PatchUserStopDateBody {
  @ApiProperty({ example: '2023-11-13T08:30:00Z' })
  @IsDateString()
  @IsNotEmpty()
  stopStartDate: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  stopEndDate: Date;
}

export class GetDashBoardQuery {
  @ApiProperty({ example: '2023-11-29' })
  @IsDateString()
  @IsNotEmpty()
  today: Date;
}

export class PostAdminLoginBody {
  @ApiProperty({ required: true, example: 'admin@test.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true, example: 'Test!123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
