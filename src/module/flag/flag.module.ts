import { Module } from '@nestjs/common';
import { FlagService } from './flag.service';
import { FlagController } from './flag.controller';
import { FlagRepository } from './flag.repository';

@Module({
  providers: [FlagService, FlagRepository],
  controllers: [FlagController],
  exports: [FlagService],
})
export class FlagModule {}
