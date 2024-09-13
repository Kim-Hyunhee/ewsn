import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PAGE_SIZE } from 'src/constants/pagination';

@Injectable()
export class ReplyRepository {
  constructor(private prisma: PrismaService) {}

  async insertReply(data: InsertReply) {
    return await this.prisma.reply.create({ data });
  }

  async updateReply({
    where,
    data,
  }: {
    where: { id: number };
    data: {
      content?: string;
      isDelete?: boolean;
    };
  }) {
    return await this.prisma.reply.update({ where, data });
  }

  async findReply(where: { id: number }) {
    return await this.prisma.reply.findUnique({
      where,
      include: {
        posting: { include: { politicalOrientation: true } },
        comments: true,
        userpoliticalOrientation: true,
        user: true,
      },
    });
  }

  async findManyReply(where: { postingId: number }) {
    return await this.prisma.reply.findMany({
      where: { ...where, AND: { replyId: null } },
      include: {
        user: { include: { politicalOrientation: true } },
        userReplyLikes: { include: { user: true } },
        comments: {
          include: {
            user: { include: { politicalOrientation: true } },
            userReplyLikes: { include: { user: true } },
            reports: true,
          },
          where: { isDelete: false },
        },
        reports: true,
        userpoliticalOrientation: true,
      },
    });
  }

  async findManyReplyByReport({ page }: { page?: number }) {
    const skipAmount = page ? (page - 1) * PAGE_SIZE : 0;

    const replies = await this.prisma.reply.findMany({
      skip: skipAmount,
      take: PAGE_SIZE,
      where: { reports: { some: {} } },
      include: {
        user: true,
        reports: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.posting.count({
      where: { reports: { some: {} } },
    });
    const currentPage = page;
    const lastPage = +Math.ceil(total / PAGE_SIZE);

    return { replies, total, currentPage, lastPage };
  }

  async findReplyReportCount({ userId }: { userId?: number }) {
    return await this.prisma.reply.count({
      where: { reports: { some: {} }, userId },
    });
  }

  async insertReplyLikeType(data: InsertReplyLikeType) {
    return await this.prisma.userReplyLike.create({ data });
  }

  async updateReplyLikeType({
    where,
    data,
  }: {
    where: { id: number };
    data: {
      likeType: string;
    };
  }) {
    return await this.prisma.userReplyLike.update({ where, data });
  }

  async findReplyLikeType(where: { replyId: number; userId: number }) {
    return await this.prisma.userReplyLike.findFirst({ where });
  }

  async deleteReplyLikeType(where: { id: number }) {
    return await this.prisma.userReplyLike.delete({ where });
  }

  async findAllReply({
    where,
    searchOption,
  }: {
    where?: { postingId: number };
    searchOption?: {
      startDate?: Date;
      endDate?: Date;
    };
  }) {
    const and =
      searchOption?.startDate !== undefined &&
      searchOption?.endDate !== undefined
        ? {
            AND: {
              createdAt: {
                gte: new Date(searchOption.startDate),
                lte: new Date(searchOption.endDate),
              },
            },
          }
        : {};

    return await this.prisma.reply.findMany({
      where: { ...where, isDelete: false, ...and },
      include: {
        user: { include: { politicalOrientation: true } },
        userReplyLikes: { include: { user: true } },
        reports: true,
        userpoliticalOrientation: true,
      },
    });
  }
}

export type InsertReply = {
  postingId: number;
  content: string;
  userId: number;
  replyId?: number;
  userPoliticalOrientationId?: number;
};

type InsertReplyLikeType = {
  likeType: string;
  userId: number;
  replyId: number;
};
