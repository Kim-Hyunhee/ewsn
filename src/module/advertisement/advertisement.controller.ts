import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('advertisement')
@ApiBearerAuth('access-token')
@Controller('ad')
export class AdvertisementController {
  constructor(private advertisementService: AdvertisementService) {}

  @Get()
  async getManyAdvertisement() {
    return await this.advertisementService.fetchManyAdvertisement();
  }

  @Get('/:id')
  async getAdvertisement(@Param('id', ParseIntPipe) advertisementId: number) {
    return await this.advertisementService.fetchAdvertisement({
      advertisementId,
    });
  }
}
