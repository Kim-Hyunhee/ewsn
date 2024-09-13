import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdvertisementRepository {
  constructor(private prisma: PrismaService) {}

  async findManyAdvertisement() {
    return await this.prisma.advertisement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAdvertisement(where: { id: number }) {
    return await this.prisma.advertisement.findUnique({ where });
  }

  async updateAdvertisement({
    where,
    data,
  }: {
    where: { id: number };
    data: UpdateAdvertisement;
  }) {
    return await this.prisma.advertisement.update({ where, data });
  }
}

export type UpdateAdvertisement = {
  title: string;
  link: string;
  image: string;
};
