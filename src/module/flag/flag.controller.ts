import { Body, Controller, Post } from '@nestjs/common';
import { FlagService } from './flag.service';
import { ApiTags } from '@nestjs/swagger';
import { PostFlagBody } from './type';

@ApiTags('flag')
@Controller('flag')
export class FlagController {
  constructor(private flagService: FlagService) {}

  @Post()
  async postFlag(@Body() body: PostFlagBody) {
    return await this.flagService.createFlag(body);
  }
}
