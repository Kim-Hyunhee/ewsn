import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PoliticalOrientationRepository {
  constructor(private prisma: PrismaService) {}

  async findPoliticalOrientation(where: { id: number }) {
    return await this.prisma.politicalOrientation.findUnique({ where });
  }

  async findManyPoliticalOrientation() {
    return await this.prisma.politicalOrientation.findMany();
  }
}
