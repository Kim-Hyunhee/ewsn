import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ReplyRepository } from './reply.repository';
import { PostingService } from '../posting/posting.service';
import { CENTER } from 'src/constants/word';
import { BEST_TIMES, REPORT_TIMES } from 'src/constants/frequency';
import { exclude } from 'src/helper/exclude';

@Injectable()
export class ReplyService {
  constructor(
    private repository: ReplyRepository,
    @Inject(forwardRef(() => PostingService))
    private postingService: PostingService,
  ) {}

  async createReply({
    userId,
    politicalOrientationId,
    content,
    postingId,
    replyId,
    isAdmin,
  }: {
    userId: number;
    politicalOrientationId: number;
    content: string;
    postingId: number;
    replyId: number;
    isAdmin: boolean;
  }) {
    const { posting } = await this.postingService.fetchPosting({ postingId });

    if (!isAdmin && posting.politicalOrientation.name !== CENTER) {
      if (posting.politicalOrientationId !== politicalOrientationId) {
        throw new BadRequestException(
          '본인 진영 또는 중 진영에서만 작성할 수 있습니다.',
        );
      }
    }

    return await this.repository.insertReply({
      userId,
      content,
      postingId,
      replyId,
      userPoliticalOrientationId: politicalOrientationId,
    });
  }

  async fetchReply({ replyId }: { replyId: number }) {
    const reply = await this.repository.findReply({ id: replyId });
    if (!reply) {
      throw new BadRequestException('해당 댓글이 존재하지 않습니다.');
    }
    if (reply.isDelete) {
      throw new BadRequestException('삭제된 댓글입니다.');
    }

    const replyWithoutPassword = {
      ...reply,
      user: exclude(reply.user, ['password']),
    };

    return replyWithoutPassword;
  }

  async modifyReply({
    userId,
    replyId,
    content,
  }: {
    userId: number;
    replyId: number;
    content: string;
  }) {
    const reply = await this.fetchReply({ replyId });
    if (reply.userId !== userId) {
      throw new BadRequestException('본인 댓글만 수정 가능합니다.');
    }

    return await this.repository.updateReply({
      where: { id: replyId },
      data: { content },
    });
  }

  async removeReply({ userId, replyId }: { userId: number; replyId: number }) {
    const reply = await this.fetchReply({ replyId });
    if (reply.userId !== userId) {
      throw new BadRequestException('본인 댓글만 삭제 가능합니다.');
    }

    return await this.repository.updateReply({
      where: { id: replyId },
      data: { isDelete: true },
    });
  }

  async fetchManyReply({ postingId }: { postingId: number }) {
    const replies = await this.repository.findManyReply({ postingId });
    // 삭제 되지 않은 모든 댓글(대댓글 상관없이)
    const allReply = await this.repository.findAllReply({
      where: { postingId },
    });

    const restrictedReplies = replies.map((reply) => {
      let isRestrict = false;
      if (reply.reports.length >= REPORT_TIMES) {
        isRestrict = true;
      }

      const updatedComments = reply.comments.map((comment) => {
        let commentIsRestrict = false;
        if (comment.reports.length >= REPORT_TIMES) {
          commentIsRestrict = true;
        }

        const userWithoutPassword = exclude(comment.user, ['password']);

        return {
          ...comment,
          user: userWithoutPassword,
          isRestrict: commentIsRestrict,
        };
      });

      const userWithoutPassword = exclude(reply.user, ['password']);

      return {
        ...reply,
        isRestrict,
        user: userWithoutPassword,
        comments: updatedComments,
      };
    });

    const restrictedAllReplies = allReply.map((reply) => {
      let isRestrict = false;
      if (reply.reports.length >= REPORT_TIMES) {
        isRestrict = true;
      }

      const userWithoutPassword = exclude(reply.user, ['password']);

      return { ...reply, user: userWithoutPassword, isRestrict };
    });

    const repliesWithHottest = restrictedAllReplies.map((reply) => {
      let likes = 0;
      let disLikes = 0;

      reply.userReplyLikes.forEach((like) => {
        if (like.likeType === 'LIKE') {
          likes++;
        } else if (like.likeType === 'DISLIKE') {
          disLikes++;
        }
      });

      const hottest = likes - disLikes;
      return { ...reply, hottest };
    });

    // 좋아요수 - 싫어요수 >= 5 이면서 규제되지 않은 댓글 최대 3개까지
    const filteredAndLimitedReplies = repliesWithHottest
      .filter((reply) => reply.hottest >= BEST_TIMES)
      .filter((reply) => !reply.isRestrict)
      .slice(0, 3);

    // 좋아요수 - 싫어요수가 같다면 최근에 올린 댓글 순서대로
    const bestReplies = filteredAndLimitedReplies.sort(
      (a, b) =>
        b.hottest - a.hottest ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const filteredReplies = restrictedReplies
      .filter((reply) => !reply.isDelete || reply.comments.length !== 0)
      .map((reply) => {
        if (reply.isRestrict) {
          reply.content = '관리자에 의해 규제된 글입니다.';
        }
        reply.comments.forEach((comment) => {
          if (comment.isRestrict) {
            comment.content = '관리자에 의해 규제된 글입니다.';
          }
        });

        if (reply.isDelete) {
          reply.content = '삭제된 댓글입니다.';
        }

        return reply;
      });

    return { bestReplies, replies: filteredReplies };
  }

  async createReplyLikeType({
    userId,
    replyId,
    likeType,
    politicalOrientationId,
    isAdmin,
  }: {
    userId: number;
    replyId: number;
    likeType: string;
    politicalOrientationId: number;
    isAdmin: boolean;
  }) {
    const reply = await this.fetchReply({ replyId });

    if (reply.userId === userId) {
      throw new BadRequestException('본인 댓글에는 누를 수 없습니다.');
    }

    if (!isAdmin && reply.posting.politicalOrientation.name !== CENTER) {
      if (reply.posting.politicalOrientationId !== politicalOrientationId) {
        throw new BadRequestException(
          '본인 진영 또는 중 진영에서만 할 수 있습니다.',
        );
      }
    }

    return await this.repository.insertReplyLikeType({
      likeType,
      userId,
      replyId,
    });
  }

  async modifyReplyLikeType({
    userId,
    replyId,
    likeType,
  }: {
    userId: number;
    replyId: number;
    likeType: string;
  }) {
    const replyLikeType = await this.repository.findReplyLikeType({
      replyId,
      userId,
    });
    // 좋아요 / 싫어요 선택한 후에 똑같은 타입 선택 시 삭제
    if (replyLikeType.likeType === likeType) {
      return await this.repository.deleteReplyLikeType({
        id: replyLikeType.id,
      });
    }

    // 좋아요 / 싫어요 반대 타입 눌렀을 때 업데이트
    return await this.repository.updateReplyLikeType({
      where: { id: replyLikeType.id },
      data: { likeType },
    });
  }

  async fetchManyReplyByReport({ page }: { page: number }) {
    const { replies, ...others } = await this.repository.findManyReplyByReport({
      page,
    });

    const repliesWithoutPassword = replies.map((reply) => {
      const userWithoutPassword = exclude(reply.user, ['password']);
      return { ...reply, user: userWithoutPassword };
    });

    return { replies: repliesWithoutPassword, ...others };
  }

  async fetchReplyReportCount({ userId }: { userId: number }) {
    return await this.repository.findReplyReportCount({ userId });
  }

  async fetchOneWeekReplyCount({ today }: { today: Date }) {
    // 오늘 ~ 6일 전까지 날짜
    const options = { timeZone: 'Asia/Seoul' };

    const startDate = new Date(today.toLocaleString('en-US', options));
    startDate.setUTCDate(startDate.getDate() - 6);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(today.toLocaleString('en-US', options));
    endDate.setUTCHours(23, 59, 59, 999);

    // 일주일에 해당하는 댓글
    const replies = await this.repository.findAllReply({
      searchOption: { startDate, endDate },
    });

    const results = [];

    for (let i = 6; i >= 0; i--) {
      const loopDate = new Date(startDate);
      loopDate.setDate(startDate.getDate() + i);

      const date = loopDate.toLocaleDateString();

      const replyCount = replies.filter((reply) => {
        const replyDate = new Date(reply.createdAt).toLocaleDateString();
        return replyDate === date;
      }).length;

      results.push({ date, replyCount });
    }

    return results;
  }
}
