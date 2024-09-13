import { Injectable, BadRequestException } from '@nestjs/common';
import { ReportRepository } from './report.repository';
import { PostingService } from '../posting/posting.service';
import { ReplyService } from '../reply/reply.service';
import { CENTER } from 'src/constants/word';

@Injectable()
export class ReportService {
  constructor(
    private repository: ReportRepository,
    private postingService: PostingService,
    private replyService: ReplyService,
  ) {}

  async createReport({
    postingId,
    replyId,
    reason,
    politicalOrientationId,
    userId,
  }: {
    postingId?: number;
    replyId?: number;
    reason: string;
    politicalOrientationId: number;
    userId: number;
  }) {
    if (postingId) {
      const { posting } = await this.postingService.fetchPosting({
        postingId,
      });

      if (posting.politicalOrientation.name !== CENTER) {
        if (posting.politicalOrientationId !== politicalOrientationId) {
          throw new BadRequestException(
            '본인 진영 또는 중 진영에서만 신고할 수 있습니다.',
          );
        }
      }
    } else if (replyId) {
      const reply = await this.replyService.fetchReply({ replyId });

      if (reply.posting.politicalOrientation.name !== CENTER) {
        if (reply.posting.politicalOrientationId !== politicalOrientationId) {
          throw new BadRequestException(
            '본인 진영 또는 중 진영에서만 신고할 수 있습니다.',
          );
        }
      }
    }

    const report = await this.fetchReport({ userId, postingId, replyId });
    if (report) {
      throw new BadRequestException('이미 신고한 글/댓글 입니다.');
    }

    return await this.repository.insertReport({
      postingId,
      replyId,
      reason,
      userId,
    });
  }

  async fetchManyReport({ type, page }: { type?: string; page?: number }) {
    if (type === 'posting') {
      return await this.postingService.fetchManyPostingByReport({
        page,
      });
    } else if (type === 'reply') {
      return await this.replyService.fetchManyReplyByReport({
        page,
      });
    }
  }

  async fetchReportCount({ userId }: { userId: number }) {
    const postingReport = await this.postingService.fetchPostingReportCount({
      userId,
    });
    const replyReport = await this.replyService.fetchReplyReportCount({
      userId,
    });

    return { postingReport, replyReport };
  }

  async fetchReport({
    userId,
    postingId,
    replyId,
  }: {
    userId: number;
    postingId?: number;
    replyId?: number;
  }) {
    return await this.repository.findReport({ userId, postingId, replyId });
  }
}
