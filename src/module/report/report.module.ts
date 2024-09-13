import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ReportRepository } from './report.repository';
import { PostingModule } from '../posting/posting.module';
import { ReplyModule } from '../reply/reply.module';

@Module({
  providers: [ReportService, ReportRepository],
  controllers: [ReportController],
  imports: [PostingModule, ReplyModule],
  exports: [ReportService],
})
export class ReportModule {}
