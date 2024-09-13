import { Module, forwardRef } from '@nestjs/common';
import { PostingService } from './posting.service';
import { PostingController } from './posting.controller';
import { UserModule } from '../user/user.module';
import { PoliticalOrientationModule } from '../political-orientation/political-orientation.module';
import { PostingRepository } from './posting.repository';
import { ReplyModule } from '../reply/reply.module';
import { CategoryModule } from '../category/category.module';

@Module({
  providers: [PostingService, PostingRepository],
  controllers: [PostingController],
  imports: [
    UserModule,
    PoliticalOrientationModule,
    forwardRef(() => ReplyModule),
    CategoryModule,
  ],
  exports: [PostingService],
})
export class PostingModule {}
