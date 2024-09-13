import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private prisma: PrismaService) {}

  async findManyCategory(where: { onlyAdmin?: boolean }) {
    return await this.prisma.category.findMany({ where });
  }

  async findCategory(where: { id: number; onlyAdmin?: boolean }) {
    return await this.prisma.category.findFirst({ where });
  }
}
