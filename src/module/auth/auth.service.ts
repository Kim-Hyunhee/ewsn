import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Payload } from './type';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async checkUserPassword({
    user,
    password,
  }: {
    user: User;
    password: string;
  }) {
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new BadRequestException('PW 오류입니다. 다시 시도해주세요.');
    }

    return isValid;
  }

  async generateToken({
    userId,
    isAdmin,
  }: {
    userId?: number;
    isAdmin?: boolean;
  }) {
    const payload: Payload = {
      userId,
      isAdmin,
    };

    return this.jwtService.sign(payload);
  }
}
