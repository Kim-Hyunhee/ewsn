import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PAGE_SIZE } from 'src/constants/pagination';
import { Gender } from './type';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async insertUser(data: InsertUser) {
    return await this.prisma.user.create({ data });
  }

  async findUser({
    id,
    email,
    nickName,
  }: {
    id?: number;
    email?: string;
    nickName?: string;
  }) {
    return await this.prisma.user.findFirst({
      where: { id, email, nickName },
    });
  }

  async updateUser({
    where,
    data,
  }: {
    where: { id: number };
    data: UpdateUser;
  }) {
    return await this.prisma.user.update({ where, data });
  }

  async findManyUser({
    searchOption,
    page,
  }: {
    searchOption?: {
      name?: string;
      nickName?: string;
      email?: string;
    };
    page?: number;
  }) {
    const skipAmount = page ? (page - 1) * PAGE_SIZE : 0;

    const whereCondition = {
      name: { contains: searchOption.name },
      nickName: { contains: searchOption.nickName },
      email: { contains: searchOption.email },
    };

    const users = await this.prisma.user.findMany({
      skip: skipAmount,
      take: PAGE_SIZE,
      where: { ...whereCondition, isAdmin: false },
      include: { politicalOrientation: true },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.user.count({
      where: { ...whereCondition, isAdmin: false },
    });
    const currentPage = page;
    const lastPage = +Math.ceil(total / PAGE_SIZE);

    return { users, total, currentPage, lastPage };
  }

  async insertUserLog(data: { ip: string }) {
    return await this.prisma.userLog.create({ data });
  }

  async findUserPOCount(where?: { politicalOrientationId?: number }) {
    return await this.prisma.user.count({
      where: { ...where, isAdmin: false, deletedAt: null },
    });
  }

  async findManyUserLogCount({
    ip,
    startDate,
    endDate,
  }: {
    ip?: string;
    startDate: Date;
    endDate: Date;
  }) {
    return await this.prisma.userLog.findMany({
      where: {
        ip,
        createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
      },
    });
  }
}

export type InsertUser = {
  email: string;
  password: string;
  nickName: string;
  name?: string;
  phoneNumber?: string;
  gender: Gender;
  politicalOrientationId: number;
};

export type UpdateUser = {
  nickName?: string;
  phoneNumber?: string;
  gender?: Gender;
  stopStartDate?: Date;
  stopEndDate?: Date;
  password?: string;
  deletedAt?: Date;
};
