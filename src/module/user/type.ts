import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum GenderEnum {
  male = 'male',
  female = 'female',
}
export type Gender = 'male' | 'female';

export class PutUserBody {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(15)
  nickName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ enum: GenderEnum, type: 'enum' })
  @IsEnum(GenderEnum)
  @IsOptional()
  gender: Gender;
}

export class PatchUserPasswordBody {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  updatePassword: string;
}

export class PatchForgotPassword {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
