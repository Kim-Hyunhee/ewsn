import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { FlagModule } from '../flag/flag.module';
import { AdvertisementModule } from '../advertisement/advertisement.module';
import { ReportModule } from '../report/report.module';
import { PostingModule } from '../posting/posting.module';
import { ReplyModule } from '../reply/reply.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [AdminController],
  imports: [
    UserModule,
    FlagModule,
    AdvertisementModule,
    ReportModule,
    PostingModule,
    ReplyModule,
    AuthModule,
  ],
})
export class AdminModule {}
