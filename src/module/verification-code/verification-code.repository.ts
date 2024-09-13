import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VerificationCodeRepository {
  constructor(private prisma: PrismaService) {}

  async insertVerificationCode(data: { email: string; code: string }) {
    return await this.prisma.verificationCode.create({ data });
  }

  async findVerificationCode(where: { email: string }) {
    return await this.prisma.verificationCode.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
