import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaModule } from 'src/module/prisma/prisma.module';
import { PrismaService } from 'src/module/prisma/prisma.service';

const loginParams = { email: 'admin@test.com', password: 'Test!123' };

describe('GET DashBoard By Posting (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    const { body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginParams);

    token = body.token;

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  it('/admin/dashBoard (GET)', async () => {
    const postingMockData = Array.from({ length: 10 }, (_, index) => ({
      id: 1,
      userId: 1,
      categoryId: 1,
      politicalOrientationId: 1,
      title: `포스트 ${index + 1}`,
      content: 'alksdjfoisasdcMSdgxvzr',
      hits: 0,
      isDelete: false,
      isFixed: false,
      score: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // posting.findMany 모의 객체 설정
    const findManyPostingMock = jest
      .spyOn(prismaService.posting, 'findMany')
      .mockResolvedValue(postingMockData);

    const replyMockData = Array.from({ length: 10 }, (_, index) => ({
      id: 1,
      userId: 1,
      postingId: 1,
      content: `점점 늘어나는 댓글 +${index}`,
      isDelete: false,
      replyId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // reply.findMany 모의 객체 설정
    const findManyReplyMock = jest
      .spyOn(prismaService.reply, 'findMany')
      .mockResolvedValue(replyMockData);

    const { body: dashBoard } = await request(app.getHttpServer())
      .get('/admin/dashBoard')
      .set('Authorization', `Bearer ${token}`);

    // posting.findMany, reply.findMany가 실제로 호출되었는지 확인
    expect(findManyPostingMock).toHaveBeenCalled();
    expect(findManyReplyMock).toHaveBeenCalled();

    // 한국 시간 기준으로 날짜 포맷팅

    const today = new Date();
    const todayFormatted = formatDate(today);

    // 오늘 날짜에 해당하는 postingCount가 10인지 확인
    const todayPostingCount = dashBoard.postingCount.find(
      ({ postingCount, date }) => formatDate(new Date(date)) === todayFormatted,
    );

    expect(todayPostingCount.postingCount).toBe(10);

    // 오늘 날짜에 해당하는 replyCount가 10인지 확인
    const todayReplyCount = dashBoard.replyCount.find(
      ({ replyCount, date }) => formatDate(new Date(date)) === todayFormatted,
    );

    expect(todayReplyCount.replyCount).toBe(10);

    const startDate = new Date(today.toLocaleString('en-US'));
    startDate.setUTCDate(startDate.getDate() - 6);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(today.toLocaleString('en-US'));
    endDate.setUTCHours(23, 59, 59, 999);

    //일주일(7개 맞는 지)
    expect(dashBoard.postingCount).toHaveLength(7);
    expect(dashBoard.replyCount).toHaveLength(7);

    dashBoard.postingCount.forEach(({ date, postingCount }) => {
      const postingDate = formatDate(new Date(date));

      // 모의 데이터를 기반으로 한 검증
      const countInMockPostingData = postingMockData.filter((posting) => {
        const mockDate = formatDate(new Date(posting.createdAt));
        return mockDate === postingDate;
      }).length;

      expect(postingCount).toBe(countInMockPostingData);
    });

    dashBoard.replyCount.forEach(({ date, replyCount }) => {
      const replyDate = formatDate(new Date(date));

      // 모의 데이터를 기반으로 한 검증
      const countInMockReplyData = replyMockData.filter((reply) => {
        const mockDate = formatDate(new Date(reply.createdAt));
        return mockDate === replyDate;
      }).length;

      expect(replyCount).toBe(countInMockReplyData);
    });
  });

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
});
