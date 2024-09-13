import {
  Body,
  Controller,
  Post,
  UseGuards,
  Param,
  ParseIntPipe,
  Put,
  Delete,
  Patch,
  Get,
} from '@nestjs/common';
import { ReplyService } from './reply.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPoliticalType,
} from 'src/decorators/currentUser.decorator';
import { PostReplyBody, PutReplyBody, ReplyLikeTypeBody } from './type';

@ApiTags('reply')
@ApiBearerAuth('access-token')
@Controller('reply')
export class ReplyController {
  constructor(private replyService: ReplyService) {}

  @Get('/:id')
  async getReply(@Param('id', ParseIntPipe) replyId: number) {
    return await this.replyService.fetchReply({ replyId });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async postReply(
    @CurrentUser() user: CurrentUserPoliticalType,
    @Body() body: PostReplyBody,
  ) {
    return await this.replyService.createReply({
      userId: user.id,
      politicalOrientationId: user.politicalOrientationId,
      ...body,
      isAdmin: user.isAdmin,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async putReply(
    @CurrentUser() user: CurrentUserPoliticalType,
    @Param('id', ParseIntPipe) replyId: number,
    @Body() { content }: PutReplyBody,
  ) {
    return await this.replyService.modifyReply({
      userId: user.id,
      replyId,
      content,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteReply(
    @CurrentUser() user: CurrentUserPoliticalType,
    @Param('id', ParseIntPipe) replyId: number,
  ) {
    return await this.replyService.removeReply({
      userId: user.id,
      replyId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/likeType')
  async postReplyLikeType(
    @CurrentUser() user: CurrentUserPoliticalType,
    @Body() { likeType }: ReplyLikeTypeBody,
    @Param('id', ParseIntPipe) replyId: number,
  ) {
    return await this.replyService.createReplyLikeType({
      userId: user.id,
      likeType,
      replyId,
      politicalOrientationId: user.politicalOrientationId,
      isAdmin: user.isAdmin,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id/likeType')
  async patchReplyLikeType(
    @CurrentUser() user: CurrentUserPoliticalType,
    @Body() { likeType }: ReplyLikeTypeBody,
    @Param('id', ParseIntPipe) replyId: number,
  ) {
    return await this.replyService.modifyReplyLikeType({
      userId: user.id,
      likeType,
      replyId,
    });
  }
}
