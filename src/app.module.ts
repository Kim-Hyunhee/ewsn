import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './module/prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { PoliticalOrientationModule } from './module/political-orientation/political-orientation.module';
import { PostingModule } from './module/posting/posting.module';
import { ReplyModule } from './module/reply/reply.module';
import { CategoryModule } from './module/category/category.module';
import { FlagModule } from './module/flag/flag.module';
import { AdminModule } from './module/admin/admin.module';
import { MailgunModule } from './module/mailgun/mailgun.module';
import { VerificationCodeModule } from './module/verification-code/verification-code.module';
import { ReportModule } from './module/report/report.module';
import { AdvertisementModule } from './module/advertisement/advertisement.module';
import { UploadModule } from './module/upload/upload.module';
import { CookieParserMiddleware } from './middle-ware/cookie-parser.middleware';
import * as cookieParser from 'cookie-parser';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    PoliticalOrientationModule,
    PostingModule,
    ReplyModule,
    CategoryModule,
    FlagModule,
    AdminModule,
    MailgunModule,
    VerificationCodeModule,
    ReportModule,
    AdvertisementModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
    consumer.apply(CookieParserMiddleware).forRoutes('*');
  }
}
