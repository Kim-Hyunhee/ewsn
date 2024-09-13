import {
  IsDateString,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PostPostingBody {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  politicalOrientationId: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isFixed: boolean;
}

export class GetManyPostingQuery {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  politicalOrientationId: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  categoryId: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  keyword: string;
}

export class GetManyHotPostingQuery {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  politicalOrientationId: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  categoryId: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  keyword: string;

  @ApiProperty({ required: false, example: '2023-11-13T08:30:00Z' })
  @IsDateString()
  @IsOptional()
  startDate: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate: Date;
}

export class PutPostingBody {
  @ApiProperty()
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  content: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  categoryId: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isFixed: boolean;
}

export class PostingLikeTypeBody {
  @ApiProperty({
    enum: ['LIKE', 'DISLIKE'],
  })
  @IsString()
  @IsNotEmpty()
  likeType: string;
}

export class GetFixedPostingQuery {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  // @IsOptional() // 전체 글 보기 시 'politicalOrientationId=null&categoryId=null' 로 요청됨
  @Type(() => Number)
  politicalOrientationId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  // @IsOptional() // 전체 글 보기 시 'politicalOrientationId=null&categoryId=null' 로 요청됨
  @Type(() => Number)
  categoryId: number;
}
