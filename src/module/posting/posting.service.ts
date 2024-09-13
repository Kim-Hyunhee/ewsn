import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PostingRepository } from './posting.repository';
import { UserService } from '../user/user.service';
import { PoliticalOrientationService } from '../political-orientation/political-orientation.service';
import { ReplyService } from '../reply/reply.service';
import { CENTER, DISCUSSION, NOTICE } from 'src/constants/word';
import { CategoryService } from '../category/category.service';
import { REPORT_TIMES } from 'src/constants/frequency';
import { exclude } from 'src/helper/exclude';

@Injectable()
export class PostingService {
  constructor(
    private repository: PostingRepository,
    private userService: UserService,
    private politicalOrientationService: PoliticalOrientationService,
    @Inject(forwardRef(() => ReplyService))
    private replyService: ReplyService,
    private categoryService: CategoryService,
  ) {}

  async createPosting({
    userId,
    title,
    content,
    categoryId,
    politicalOrientationId,
    isFixed,
    isAdmin,
    userPoliticalOrientationId,
  }: {
    userId: number;
    title: string;
    content: string;
    categoryId: number;
    politicalOrientationId: number;
    isFixed?: boolean;
    isAdmin: boolean;
    userPoliticalOrientationId?: number;
  }) {
    const user = await this.userService.fetchUser({ userId });

    const category = await this.categoryService.fetchCategory({
      categoryId,
      isAdmin,
    });

    const politicalOrientation =
      await this.politicalOrientationService.fetchPoliticalOrientation({
        politicalOrientationId,
      });

    if (!isAdmin && politicalOrientation.name !== CENTER) {
      if (user.politicalOrientationId !== politicalOrientationId) {
        throw new BadRequestException(
          '본인 진영 또는 중 진영에서만 작성할 수 있습니다.',
        );
      }
    }

    // 관리자가 공지글 작성할 때만 isFixed 파라미터 받기
    if (isAdmin && (category.name === NOTICE || category.name === DISCUSSION)) {
      return await this.repository.insertPosting({
        userId,
        title,
        content,
        categoryId,
        politicalOrientationId,
        isFixed,
      });
    }

    return await this.repository.insertPosting({
      userId,
      title,
      content,
      categoryId,
      politicalOrientationId,
      userPoliticalOrientationId,
    });
  }

  async fetchManyPosting({
    politicalOrientationId,
    categoryId,
    page,
    keyword,
  }: {
    politicalOrientationId?: number;
    categoryId?: number;
    page?: number;
    keyword?: string;
  }) {
    const { postings, total, currentPage, lastPage } =
      await this.repository.findManyPosting({
        where: {
          categoryId,
          politicalOrientationId,
        },
        searchOption: { keyword },
        page,
      });

    const restrictedPosting = postings.map((posting) => {
      let isRestrict = false;
      if (posting.reports.length >= REPORT_TIMES) {
        isRestrict = true;
      }

      const userWithoutPassword = exclude(posting.user, ['password']);

      return { ...posting, user: userWithoutPassword, isRestrict };
    });

    return { postings: restrictedPosting, total, currentPage, lastPage };
  }

  async fetchManyHotPosting({
    politicalOrientationId,
    categoryId,
    page,
    keyword,
    startDate,
    endDate,
  }: {
    politicalOrientationId?: number;
    categoryId?: number;
    page?: number;
    keyword?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { postings, total, currentPage, lastPage } =
      await this.repository.findManyHotPosting({
        where: {
          categoryId,
          politicalOrientationId,
        },
        searchOption: { keyword, startDate, endDate },
        page,
      });

    const restrictedPosting = postings.map((posting) => {
      let isRestrict = false;
      if (posting.reports.length >= REPORT_TIMES) {
        isRestrict = true;
      }

      const userWithoutPassword = exclude(posting.user, ['password']);

      return { ...posting, user: userWithoutPassword, isRestrict };
    });

    return { postings: restrictedPosting, total, currentPage, lastPage };
  }

  async fetchManyPostingByReport({ page }: { page: number }) {
    const { postings, ...others } =
      await this.repository.findManyPostingByReport({ page });

    const postingsWithoutPassword = postings.map((posting) => {
      const userWithoutPassword = exclude(posting.user, ['password']);
      return { ...posting, user: userWithoutPassword };
    });

    return { postings: postingsWithoutPassword, ...others };
  }

  async fetchPostingReportCount({ userId }: { userId: number }) {
    return await this.repository.findPostingReportCount({ userId });
  }

  async fetchPosting({ postingId }: { postingId: number }) {
    const { posting, ...others } = await this.repository.findPosting({
      id: postingId,
    });
    if (!posting) {
      throw new BadRequestException('해당 게시물은 존재하지 않습니다.');
    }
    if (posting.isDelete) {
      throw new BadRequestException('삭제된 게시글 입니다.');
    }

    const postingWithoutPassword = {
      ...posting,
      user: exclude(posting.user, ['password']),
    };

    return { posting: postingWithoutPassword, ...others };
  }

  async modifyPostingHits({ postingId }: { postingId: number }) {
    const { posting } = await this.fetchPosting({ postingId });

    return await this.repository.updatePosting({
      where: { id: postingId },
      data: { hits: posting.hits + 1 },
    });
  }

  async modifyPostingScore({
    postingId,
    score,
  }: {
    postingId: number;
    score: number;
  }) {
    return await this.repository.updatePosting({
      where: { id: postingId },
      data: { score },
    });
  }

  async modifyPosting({
    postingId,
    userId,
    isAdmin,
    title,
    content,
    categoryId,
    isFixed,
  }: {
    postingId: number;
    userId: number;
    isAdmin: boolean;
    title?: string;
    content?: string;
    categoryId?: number;
    isFixed?: boolean;
  }) {
    const { posting } = await this.fetchPosting({ postingId });
    if (posting.userId !== userId) {
      throw new ForbiddenException('Forbidden error...');
    }

    const category = await this.categoryService.fetchCategory({
      categoryId,
      isAdmin,
    });
    if (isAdmin && (category.name === NOTICE || category.name === DISCUSSION)) {
      return await this.repository.updatePosting({
        where: { id: postingId },
        data: { title, content, categoryId, isFixed },
      });
    }

    return await this.repository.updatePosting({
      where: { id: postingId },
      data: { title, content, categoryId },
    });
  }

  async removePosting({
    userId,
    isAdmin,
    postingId,
  }: {
    userId: number;
    postingId: number;
    isAdmin?: boolean;
  }) {
    const { posting } = await this.fetchPosting({ postingId });
    if (!isAdmin && posting.userId !== userId) {
      throw new ForbiddenException('Forbidden error...');
    }

    return await this.repository.updatePosting({
      where: { id: postingId },
      data: { isDelete: true },
    });
  }

  async fetchManyReply({ postingId }: { postingId: number }) {
    return await this.replyService.fetchManyReply({ postingId });
  }

  async createPostingLikeType({
    userId,
    postingId,
    likeType,
    politicalOrientationId,
    isAdmin,
  }: {
    userId: number;
    postingId: number;
    likeType: string;
    politicalOrientationId: number;
    isAdmin: boolean;
  }) {
    const { posting } = await this.fetchPosting({ postingId });

    if (posting.userId === userId) {
      throw new BadRequestException('본인 글에는 누를 수 없습니다.');
    }

    if (!isAdmin && posting.politicalOrientation.name !== CENTER) {
      if (posting.politicalOrientationId !== politicalOrientationId) {
        throw new BadRequestException(
          '본인 진영 또는 중 진영에서만 할 수 있습니다.',
        );
      }
    }

    if (likeType === 'LIKE') {
      await this.modifyPostingScore({ postingId, score: posting.score + 1 });
    } else if (likeType === 'DISLIKE') {
      await this.modifyPostingScore({ postingId, score: posting.score - 1 });
    }

    return await this.repository.insertPostingLikeType({
      likeType,
      userId,
      postingId,
    });
  }

  async modifyPostingLikeType({
    userId,
    postingId,
    likeType,
  }: {
    userId: number;
    postingId: number;
    likeType: string;
  }) {
    const postingLikeType = await this.repository.findPostingLikeType({
      postingId,
      userId,
    });
    const { posting } = await this.fetchPosting({ postingId });

    // 좋아요 / 싫어요 선택한 후에 똑같은 타입 선택 시 삭제
    if (postingLikeType && postingLikeType.likeType === likeType) {
      if (likeType === 'LIKE') {
        await this.modifyPostingScore({ postingId, score: posting.score - 1 });
      } else if (likeType === 'DISLIKE') {
        await this.modifyPostingScore({ postingId, score: posting.score + 1 });
      }

      return await this.repository.deletePostingLikeType({
        id: postingLikeType.id,
      });
    }

    if (likeType === 'LIKE') {
      await this.modifyPostingScore({ postingId, score: posting.score + 2 });
    } else if (likeType === 'DISLIKE') {
      await this.modifyPostingScore({ postingId, score: posting.score - 2 });
    }
    // 좋아요 / 싫어요 반대 타입 눌렀을 때 업데이트
    return await this.repository.updatePostingLikeType({
      where: { id: postingLikeType.id },
      data: { likeType },
    });
  }

  async fetchOneWeekPostingCount({ today }: { today: Date }) {
    // 오늘 ~ 6일 전까지 날짜 (한국 기준)
    const options = { timeZone: 'Asia/Seoul' };

    const startDate = new Date(today.toLocaleString('en-US', options));
    startDate.setUTCDate(startDate.getDate() - 6);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(today.toLocaleString('en-US', options));
    endDate.setUTCHours(23, 59, 59, 999);

    // 일주일에 해당하는 게시글
    const { postings } = await this.repository.findManyPosting({
      searchOption: { startDate, endDate },
    });

    const results = [];

    for (let i = 6; i >= 0; i--) {
      const loopDate = new Date(startDate);
      loopDate.setDate(startDate.getDate() + i);

      const date = loopDate.toLocaleDateString();

      const postingCount = postings.filter((posting) => {
        const postingDate = new Date(posting.createdAt).toLocaleDateString();
        return postingDate === date;
      }).length;

      results.push({ date, postingCount });
    }

    return results;
  }

  async fetchManyFixedPosting({
    politicalOrientationId,
    categoryId,
  }: {
    politicalOrientationId: number;
    categoryId: number;
    // 전체 글 보기 시 'politicalOrientationId=null&categoryId=null' 로 요청됨
    // politicalOrientationId?: number;
    // categoryId?: number;
  }) {
    return await this.repository.findManyPostingIsFixed({
      politicalOrientationId,
      categoryId,
    });
  }
}
