import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PAGE_SIZE } from 'src/constants/pagination';

@Injectable()
export class PostingRepository {
  constructor(private prisma: PrismaService) {}

  async insertPosting(data: InsertPosting) {
    return await this.prisma.posting.create({ data });
  }

  async findManyPosting({
    where,
    searchOption,
    page,
  }: {
    where?: {
      categoryId?: number;
      politicalOrientationId?: number;
    };
    searchOption?: {
      keyword?: string;
      startDate?: Date;
      endDate?: Date;
    };
    page?: number;
  }) {
    const PAGE_SIZE = page ? 20 : undefined;
    const skipAmount = page ? (page - 1) * PAGE_SIZE : 0;
    const NOT = where?.politicalOrientationId
      ? {}
      : { user: { isAdmin: true } };

    const or = searchOption
      ? {
          OR: [
            { title: { contains: searchOption.keyword as string } },
            { content: { contains: searchOption.keyword as string } },
            {
              user: { nickName: { contains: searchOption.keyword as string } },
            },
          ],
        }
      : {};

    const and =
      searchOption.startDate && searchOption.endDate
        ? {
            AND: {
              createdAt: {
                gte: new Date(searchOption.startDate),
                lte: new Date(searchOption.endDate),
              },
            },
          }
        : {};

    const postings = await this.prisma.posting.findMany({
      skip: skipAmount,
      take: PAGE_SIZE,
      where: { ...where, ...or, ...and, isDelete: false, isFixed: false, NOT },
      include: {
        politicalOrientation: true,
        category: true,
        user: { include: { politicalOrientation: true } },
        replies: { where: { isDelete: false } },
        reports: true,
        userPoliticalOrientation: true,
      },
      orderBy: [{ isFixed: 'desc' }, { createdAt: 'desc' }],
    });

    const total = await this.prisma.posting.count({
      where: { ...where, ...or, ...and, isDelete: false, isFixed: false, NOT },
    });
    const currentPage = page;
    const lastPage = +Math.ceil(total / PAGE_SIZE);

    return { postings, total, currentPage, lastPage };
  }

  async findManyHotPosting({
    where,
    searchOption,
    page,
  }: {
    where: {
      categoryId?: number;
      politicalOrientationId?: number;
    };
    searchOption?: {
      keyword?: string;
      startDate?: Date;
      endDate?: Date;
    };
    page?: number;
  }) {
    const skipAmount = page ? (page - 1) * PAGE_SIZE : 0;
    const NOT = where.politicalOrientationId ? {} : { user: { isAdmin: true } };

    const or = searchOption.keyword
      ? {
          OR: [
            { title: { contains: searchOption.keyword as string } },
            { content: { contains: searchOption.keyword as string } },
            {
              user: { nickName: { contains: searchOption.keyword as string } },
            },
          ],
        }
      : {};

    const and =
      searchOption.startDate && searchOption.endDate
        ? {
            AND: {
              createdAt: {
                gte: new Date(searchOption.startDate),
                lte: new Date(searchOption.endDate),
              },
            },
          }
        : {};

    const postings = await this.prisma.posting.findMany({
      skip: skipAmount,
      take: PAGE_SIZE,
      where: { ...where, ...or, ...and, isDelete: false, isFixed: false, NOT },
      include: {
        userPostLikes: true,
        politicalOrientation: true,
        category: true,
        user: { include: { politicalOrientation: true } },
        replies: { where: { isDelete: false } },
        reports: true,
        userPoliticalOrientation: true,
      },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
    });

    const total = await this.prisma.posting.count({
      where: { ...where, ...or, ...and, isDelete: false, isFixed: false, NOT },
    });
    const currentPage = page;
    const lastPage = +Math.ceil(total / PAGE_SIZE);

    return { postings, total, currentPage, lastPage };
  }

  async findManyPostingByReport({ page }: { page?: number }) {
    const skipAmount = page ? (page - 1) * PAGE_SIZE : 0;

    const postings = await this.prisma.posting.findMany({
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

    return { postings, total, currentPage, lastPage };
  }

  async findPostingReportCount({ userId }: { userId?: number }) {
    return await this.prisma.posting.count({
      where: { reports: { some: {} }, userId },
    });
  }

  async findPosting(where: { id: number }) {
    const posting = await this.prisma.posting.findUnique({
      where,
      include: {
        replies: { where: { isDelete: false } },
        userPostLikes: { include: { user: true } },
        user: { include: { politicalOrientation: true } },
        category: true,
        politicalOrientation: true,
        userPoliticalOrientation: true,
      },
    });

    const likeCounts = posting?.userPostLikes.reduce(
      (counts, like) => {
        if (like.likeType === 'LIKE') {
          counts.likes++;
        } else if (like.likeType === 'DISLIKE') {
          counts.disLikes++;
        }
        return counts;
      },
      { likes: 0, disLikes: 0 },
    );

    return { posting, likeCounts };
  }

  async updatePosting({
    where,
    data,
  }: {
    where: { id: number };
    data: UpdatePosting;
  }) {
    return await this.prisma.posting.update({ where, data });
  }

  async deletePosting(where: { id: number }) {
    return await this.prisma.posting.delete({ where });
  }

  async insertPostingLikeType(data: InsertPostingLikeType) {
    return await this.prisma.userPostLike.create({ data });
  }

  async updatePostingLikeType({
    where,
    data,
  }: {
    where: { id: number };
    data: {
      likeType: string;
    };
  }) {
    return await this.prisma.userPostLike.update({ where, data });
  }

  async findPostingLikeType(where: { postingId: number; userId: number }) {
    return await this.prisma.userPostLike.findFirst({ where });
  }

  async deletePostingLikeType(where: { id: number }) {
    return await this.prisma.userPostLike.delete({ where });
  }

  async findManyPostingIsFixed(where: {
    politicalOrientationId: number;
    categoryId: number;
    // 전체 글 보기 시 'politicalOrientationId=null&categoryId=null' 로 요청됨
    // politicalOrientationId?: number;
    // categoryId?: number;
  }) {
    return await this.prisma.posting.findMany({
      where: { ...where, isFixed: true, isDelete: false },
      include: {
        category: true,
        politicalOrientation: true,
        replies: { where: { isDelete: false } },
        user: true,
        userPostLikes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export type InsertPosting = {
  userId: number;
  title: string;
  content: string;
  categoryId: number;
  politicalOrientationId: number;
  isFixed?: boolean;
  userPoliticalOrientationId?: number;
};

export type UpdatePosting = {
  title?: string;
  content?: string;
  hits?: number;
  isDelete?: boolean;
  score?: number;
  categoryId?: number;
  isFixed?: boolean;
};

type InsertPostingLikeType = {
  likeType: string;
  userId: number;
  postingId: number;
};
