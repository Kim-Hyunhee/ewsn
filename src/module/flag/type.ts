import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostFlagBody {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  term: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  numberOfPeople: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  materials: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  isPermitted: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;
}
