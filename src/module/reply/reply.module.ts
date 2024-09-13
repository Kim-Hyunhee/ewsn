import { Module, forwardRef } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { ReplyController } from './reply.controller';
import { ReplyRepository } from './reply.repository';
import { PostingModule } from '../posting/posting.module';
import { UserModule } from '../user/user.module';
import { PoliticalOrientationModule } from '../political-orientation/political-orientation.module';

@Module({
  providers: [ReplyService, ReplyRepository],
  controllers: [ReplyController],
  imports: [
    forwardRef(() => PostingModule),
    UserModule,
    PoliticalOrientationModule,
  ],
  exports: [ReplyService],
})
export class ReplyModule {}
