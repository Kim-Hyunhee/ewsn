import {
  Controller,
  UseInterceptors,
  UploadedFile,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('upload')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async postUploadImage(@UploadedFile() file: Express.Multer.File) {
    return await this.uploadService.uploadFileToS3(file);
  }
}
