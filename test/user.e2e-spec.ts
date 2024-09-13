import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaModule } from 'src/module/prisma/prisma.module';
import { Gender } from 'src/module/user/type';

const loginParams = { email: 'test@test.com', password: 'Test!123' };

describe('PUT User (e2e)', () => {
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

  type UpdateUser = {
    nickName?: string;
    phoneNumber?: string;
    gender?: Gender;
    politicalOrientationId?: number;
    politicalOrientationChangeDate?: Date;
  };

  it('/user/me (PUT) 정치 성향 변경 X', async () => {
    // 현재 User 정보
    const { body: currentUser } = await request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', `Bearer ${token}`);

    const updateUser: UpdateUser = {
      nickName: '변경 닉네임',
      phoneNumber: '010-1111-2222',
      gender: 'female',
    };

    // 정치 성향 변경 X, 다른 정보만 변경
    const { body: updatedUser } = await request(app.getHttpServer())
      .put('/user/me')
      .set('Authorization', `Bearer ${token}`)
      .send(updateUser);

    // 이전 정보와 새로운 정보 비교
    expect(updatedUser.nickName).toBe(updateUser.nickName);
    expect(updatedUser.phoneNumber).toBe(updateUser.phoneNumber);

    expect(updatedUser.nickName).not.toBe(currentUser.nickName);
    expect(updatedUser.phoneNumber).not.toBe(currentUser.phoneNumber);

    // 다른 정보 외에는 변하지 않았음을 확인
    expect(updatedUser.politicalOrientationId).toBe(
      currentUser.politicalOrientationId,
    );
    expect(updatedUser.politicalOrientationChangeDate).toBe(
      currentUser.politicalOrientationChangeDate,
    );
  });

  it('/user/me (PUT) 정치 성향 변경 O - 2달 경과 X', async () => {
    // 현재 User 정보
    const { body: currentUser } = await request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const updateUserData: UpdateUser = {
      nickName: '다시 한 번 더 수정된 닉네임',
      phoneNumber: '010-8888-7777',
      politicalOrientationId: 3,
    };

    const { body: updatedUser } = await request(app.getHttpServer())
      .put('/user/me')
      .set('Authorization', `Bearer ${token}`)
      .send(updateUserData);

    expect(updatedUser.message).toBe(
      '정치 성향 변경 후 두 달이 경과되지 않았습니다.',
    );

    const { body: nonUpdatedUser } = await request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // 정보 수정 실패 후 변경 전과 변경 후 정보 같은지 판단
    expect(nonUpdatedUser).toEqual(currentUser);
  });

  it('/user/me (PUT) 정치 성향 변경 O - 2달 경과 O', async () => {
    // 현재 User 정보
    const { body: currentUser } = await request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const updateUserData: UpdateUser = {
      nickName: '다시 한 번 더 수정된 닉네임',
      phoneNumber: '010-8888-7777',
      politicalOrientationId: 2,
    };

    const { body: updatedUser } = await request(app.getHttpServer())
      .put('/user/me')
      .set('Authorization', `Bearer ${token}`)
      .send(updateUserData);

    const updatedDate = new Date(updatedUser.politicalOrientationChangeDate);
    const today = new Date();

    const msInTwoMonths = 1000 * 60 * 60 * 24 * 30 * 2;
    const twoMonthsAgo = new Date(today.getTime() - msInTwoMonths);

    expect(updatedUser).not.toEqual(currentUser);
    // getTime()으로 숫자 값으로 변환 후 비교
    expect(updatedDate.getTime()).toBeCloseTo(today.getTime(), -1000);
    expect(updatedDate.getTime()).toBeGreaterThan(twoMonthsAgo.getTime());
  });
});
