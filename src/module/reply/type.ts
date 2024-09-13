import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostReplyBody {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  postingId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  replyId: number;
}

export class PutReplyBody {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ReplyLikeTypeBody {
  @ApiProperty({
    enum: ['LIKE', 'DISLIKE'],
  })
  @IsString()
  @IsNotEmpty()
  likeType: string;
}
