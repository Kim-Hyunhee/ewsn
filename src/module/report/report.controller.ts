import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPoliticalType,
} from 'src/decorators/currentUser.decorator';
import { PostReportBody } from './type';

@ApiTags('report')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('report')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Post()
  async postReport(
    @CurrentUser() user: CurrentUserPoliticalType,
    @Body() body: PostReportBody,
  ) {
    return await this.reportService.createReport({
      ...body,
      politicalOrientationId: user.politicalOrientationId,
      userId: user.id,
    });
  }
}
