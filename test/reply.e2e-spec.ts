import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaModule } from 'src/module/prisma/prisma.module';

const loginParams = { email: 'test@test.com', password: 'Test!123' };

describe('GET Reply List (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginParams);

    token = res.body.token;
  });

  it('/posting/:id/reply (GET)', async () => {
    const postingId = 1;
    const { body } = await request(app.getHttpServer())
      .get(`/posting/${postingId}/reply`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    for (const reply of body) {
      if (reply.isRestrict) {
        // isRestrict가 true인 댓글인 경우 "관리자에 의해 규제된 글입니다." 확인
        expect(reply.content).toBe('관리자에 의해 규제된 글입니다.');
      }
      // isRestrict가 true인 대댓글의 경우
      for (const comment of reply.comments) {
        if (comment.isRestrict) {
          expect(comment.content).toBe('관리자에 의해 규제된 글입니다.');
        }
      }

      if (reply.isDelete) {
        if (reply.comments.length > 0) {
          // isDelete가 true인 댓글인데 대댓글이 있는 경우 "삭제된 댓글입니다" 확인
          expect(reply.content).toBe('삭제된 댓글입니다.');
          // 대댓글이 있는 경우 대댓글에 대해서도 확인
          for (const comment of reply.comments) {
            if (!comment.isDelete) {
              // isDelete가 false인 대댓글인 경우만 확인 가능
              expect(reply.content).toBeDefined();
            }
          }
        }
      }
    }
  });
});
