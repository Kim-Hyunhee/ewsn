import * as path from 'path';
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private awsS3: S3;
  private S3_BUCKET_NAME: string;

  constructor(private readonly configService: ConfigService) {
    this.awsS3 = new S3({
      region: this.configService.get('AWS_S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
      },
    });
    this.S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME');
  }

  async uploadFileToS3(file: Express.Multer.File) {
    try {
      const fileName = Buffer.from(file.originalname, 'latin1')
        .toString('utf8')
        .replaceAll(' ', '');
      const key = `${Date.now()}/${path.basename(fileName)}`;

      const putObjectCommand = new PutObjectCommand({
        Bucket: this.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
      });

      await this.awsS3.send(putObjectCommand);

      const url = `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;

      return url;
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error}`);
    }
  }
}
