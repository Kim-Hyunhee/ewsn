import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportRepository {
  constructor(private prisma: PrismaService) {}

  async insertReport(data: {
    postingId?: number;
    replyId?: number;
    reason: string;
    userId: number;
  }) {
    return await this.prisma.report.create({ data });
  }

  async findReport(where: {
    userId: number;
    postingId?: number;
    replyId?: number;
  }) {
    return await this.prisma.report.findFirst({ where });
  }
}
