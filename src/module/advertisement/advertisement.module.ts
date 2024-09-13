import { Module } from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { AdvertisementRepository } from './advertisement.repository';
import { AdvertisementController } from './advertisement.controller';

@Module({
  providers: [AdvertisementService, AdvertisementRepository],
  controllers: [AdvertisementController],
  exports: [AdvertisementService],
})
export class AdvertisementModule {}
