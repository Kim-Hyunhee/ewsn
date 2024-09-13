import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PAGE_SIZE } from 'src/constants/pagination';

@Injectable()
export class FlagRepository {
  constructor(private prisma: PrismaService) {}

  async insertFlag(data: InsertFlag) {
    return await this.prisma.flag.create({ data });
  }

  async findFlag(where: { id: number }) {
    return await this.prisma.flag.findUnique({ where });
  }

  async findManyFlag({ page }: { page?: number }) {
    const skipAmount = page ? (page - 1) * PAGE_SIZE : 0;

    const flags = await this.prisma.flag.findMany({
      skip: skipAmount,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.flag.count();
    const currentPage = page;
    const lastPage = +Math.ceil(total / PAGE_SIZE);

    return { flags, total, currentPage, lastPage };
  }

  async updateFlag({
    where,
    data,
  }: {
    where: { id: number };
    data: { status: string };
  }) {
    return await this.prisma.flag.update({ where, data });
  }
}

export type InsertFlag = {
  purpose: string;
  name: string;
  term: string;
  numberOfPeople: number;
  content: string;
  materials: string;
  isPermitted: string;
  phoneNumber: string;
  email: string;
  status: string;
};
