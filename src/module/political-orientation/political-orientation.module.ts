import { Module } from '@nestjs/common';
import { PoliticalOrientationService } from './political-orientation.service';
import { PoliticalOrientationController } from './political-orientation.controller';
import { PoliticalOrientationRepository } from './political-orientation.repository';

@Module({
  providers: [PoliticalOrientationService, PoliticalOrientationRepository],
  controllers: [PoliticalOrientationController],
  exports: [PoliticalOrientationService],
})
export class PoliticalOrientationModule {}
