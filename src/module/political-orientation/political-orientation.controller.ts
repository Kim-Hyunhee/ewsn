import { Controller, ParseIntPipe, Get, Param } from '@nestjs/common';
import { PoliticalOrientationService } from './political-orientation.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('politicalOrientation')
@Controller('politicalOrientation')
export class PoliticalOrientationController {
  constructor(
    private politicalOrientationService: PoliticalOrientationService,
  ) {}

  @Get()
  async getManyPoliticalOrientationService() {
    return await this.politicalOrientationService.fetchManyPoliticalOrientation();
  }

  @Get('/:id')
  async getPoliticalOrientation(
    @Param('id', ParseIntPipe) politicalOrientationId: number,
  ) {
    return await this.politicalOrientationService.fetchPoliticalOrientation({
      politicalOrientationId,
    });
  }
}
