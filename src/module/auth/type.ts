import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Gender } from '../user/type';

export type Payload = {
  userId: number;
  isAdmin: boolean;
};

export class PostLoginBody {
  @ApiProperty({ required: true, example: 'test@test.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true, example: 'Test!123' })
  @IsNotEmpty()
  password: string;
}

export class PostSendCode extends OmitType(PostLoginBody, [
  'password',
] as const) {}

export class PostCompareCode {
  @ApiProperty({ required: true, example: 'test@test.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class PostCheckOverlapNickName {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  nickName: string;
}

export class PostSignUpBody {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  nickName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  politicalOrientationId: number;
}
