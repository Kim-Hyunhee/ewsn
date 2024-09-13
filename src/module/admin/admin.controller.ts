import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  Post,
  Put,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  GetDashBoardQuery,
  GetFlagQuery,
  GetReportQuery,
  GetUserQuery,
  PatchFlagStatusBody,
  PatchUserStopDateBody,
  PostAdminLoginBody,
  PutAdvertisementBody,
} from './type';
import { FlagService } from '../flag/flag.service';
import { AdvertisementService } from '../advertisement/advertisement.service';
import { ReportService } from '../report/report.service';
import { PostingService } from '../posting/posting.service';
import { ReplyService } from '../reply/reply.service';
import { AuthService } from '../auth/auth.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
export class AdminController {
  constructor(
    private userService: UserService,
    private flagService: FlagService,
    private advertisementService: AdvertisementService,
    private reportService: ReportService,
    private postingService: PostingService,
    private replyService: ReplyService,
    private authService: AuthService,
  ) {}

  @Post('/logIn')
  async postLogin(@Body() { email, password }: PostAdminLoginBody) {
    const user = await this.userService.fetchUserWithPassword({ email });
    if (!user) {
      throw new BadRequestException('존재하지 않는 회원입니다.');
    }
    if (!user.isAdmin) {
      throw new UnauthorizedException('관리자만 로그인 가능합니다.');
    }

    await this.authService.checkUserPassword({ user, password: password });

    const token = await this.authService.generateToken({
      userId: user.id,
      isAdmin: user.isAdmin,
    });

    return { token };
  }

  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @Get('/user')
  async getManyUser(@Query() query: GetUserQuery) {
    return await this.userService.fetchManyUser({ ...query });
  }

  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @Get('/flag')
  async getManyFlag(@Query() { page }: GetFlagQuery) {
    return await this.flagService.fetchManyFlag({ page });
  }

  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('/flag/:id/status')
  async patchFlagStatus(
    @Param('id', ParseIntPipe) flagId: number,
    @Body() { status }: PatchFlagStatusBody,
  ) {
    return await this.flagService.modifyFlagStatus({ flagId, status });
  }

  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @Get('/ad')
  async getManyAdvertisement() {
    return await this.advertisementService.fetchManyAdvertisement();
  }

  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @Put('/ad/:id')
  async putAdvertisement(
    @Body() body: PutAdvertisementBody,
    @Param('id', ParseIntPipe) advertisementId: number,
  ) {
    return await this.advertisementService.modifyAdvertisement({
      ...body,
      advertisementId,
    });
  }

  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @Get('/report')
  async getManyReport(@Query() query: GetReportQuery) {
    return await this.reportService.fetchManyReport(query);
  }

  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('/user/:id/stopDate')
  async patchUserStopDate(
    @Body() body: PatchUserStopDateBody,
    @Param('id', ParseIntPipe) userId: number,
  ) {
    return await this.userService.modifyUserStopDate({ userId, ...body });
  }

  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @Get('/user/:id')
  async getUser(@Param('id', ParseIntPipe) userId: number) {
    const user = await this.userService.fetchUser({ userId });
    if (!user) {
      throw new BadRequestException('존재하지 않는 회원입니다.');
    }
    if (user.deletedAt) {
      throw new BadRequestException('탈퇴한 회원입니다.');
    }

    const reportCount = await this.reportService.fetchReportCount({
      userId,
    });

    return { user, ...reportCount };
  }

  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @Get('/dashBoard')
  async getDashBoard(@Query() { today }: GetDashBoardQuery) {
    const [userCount, postingCount, replyCount, userLogCount] =
      await Promise.all([
        await this.userService.fetchUserCount(),
        await this.postingService.fetchOneWeekPostingCount({ today }),
        await this.replyService.fetchOneWeekReplyCount({ today }),
        await this.userService.fetchOneWeekUserLogCount({ today }),
      ]);

    return { userCount, postingCount, replyCount, userLogCount };
  }
}
