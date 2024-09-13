import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostingService } from './posting.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPoliticalType,
} from 'src/decorators/currentUser.decorator';
import {
  GetManyPostingQuery,
  PostPostingBody,
  PostingLikeTypeBody,
  PutPostingBody,
  GetManyHotPostingQuery,
  GetFixedPostingQuery,
} from './type';
import { User } from '@prisma/client';

@ApiTags('posting')
@ApiBearerAuth('access-token')
@Controller('posting')
export class PostingController {
  constructor(private postingService: PostingService) {}

  @Get()
  async getManyPosting(@Query() query: GetManyPostingQuery) {
    return await this.postingService.fetchManyPosting({
      ...query,
    });
  }

  @Get('/hot')
  async getManyHotPosting(@Query() query: GetManyHotPostingQuery) {
    return await this.postingService.fetchManyHotPosting({
      ...query,
    });
  }

  @Get('/fix')
  async getManyFixedPosting(@Query() query: GetFixedPostingQuery) {
    return await this.postingService.fetchManyFixedPosting({
      ...query,
    });
  }

  @Get('/:id')
  async getPosting(@Param('id', ParseIntPipe) postingId: number) {
    return await this.postingService.fetchPosting({ postingId });
  }

  @Patch('/:id/hit')
  async patchPostingHit(@Param('id', ParseIntPipe) postingId: number) {
    return await this.postingService.modifyPostingHits({ postingId });
  }

  @Get('/:id/reply')
  async getManyReply(@Param('id', ParseIntPipe) postingId: number) {
    return await this.postingService.fetchManyReply({
      postingId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async postPosting(@CurrentUser() user: User, @Body() body: PostPostingBody) {
    return await this.postingService.createPosting({
      userId: user.id,
      ...body,
      isAdmin: user.isAdmin,
      userPoliticalOrientationId: user.politicalOrientationId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async putPosting(
    @Param('id', ParseIntPipe) postingId: number,
    @Body() body: PutPostingBody,
    @CurrentUser() user: User,
  ) {
    return await this.postingService.modifyPosting({
      postingId,
      userId: user.id,
      isAdmin: user.isAdmin,
      ...body,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deletePosting(
    @Param('id', ParseIntPipe) postingId: number,
    @CurrentUser() user: User,
  ) {
    return await this.postingService.removePosting({
      postingId,
      userId: user.id,
      isAdmin: user.isAdmin,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/likeType')
  async postPostingLikeType(
    @CurrentUser() user: CurrentUserPoliticalType,
    @Body() { likeType }: PostingLikeTypeBody,
    @Param('id', ParseIntPipe) postingId: number,
  ) {
    return await this.postingService.createPostingLikeType({
      userId: user.id,
      likeType,
      postingId,
      politicalOrientationId: user.politicalOrientationId,
      isAdmin: user.isAdmin,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id/likeType')
  async patchPostingLikeType(
    @CurrentUser() user: CurrentUserPoliticalType,
    @Body() { likeType }: PostingLikeTypeBody,
    @Param('id', ParseIntPipe) postingId: number,
  ) {
    return await this.postingService.modifyPostingLikeType({
      userId: user.id,
      likeType,
      postingId,
    });
  }
}
