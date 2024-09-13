import { BadRequestException, Injectable } from '@nestjs/common';
import { InsertUser, UpdateUser, UserRepository } from './user.repository';
import { PoliticalOrientationService } from '../political-orientation/political-orientation.service';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { Gender } from './type';
import { exclude } from 'src/helper/exclude';

@Injectable()
export class UserService {
  constructor(
    private repository: UserRepository,
    private politicalOrientationService: PoliticalOrientationService,
    private authService: AuthService,
  ) {}

  async createUser(data: InsertUser) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    await this.politicalOrientationService.fetchPoliticalOrientation({
      politicalOrientationId: data.politicalOrientationId,
    });

    const user = await this.repository.insertUser({
      ...data,
      password: hashedPassword,
    });

    return exclude(user, ['password']);
  }

  async fetchUserWithPassword({
    userId,
    email,
    nickName,
  }: {
    userId?: number;
    email?: string;
    nickName?: string;
  }) {
    return await this.repository.findUser({
      id: userId,
      nickName,
      email,
    });
  }

  async fetchUser({
    userId,
    email,
    nickName,
  }: {
    userId?: number;
    email?: string;
    nickName?: string;
  }) {
    const user = await this.repository.findUser({
      id: userId,
      nickName,
      email,
    });
    return exclude(user, ['password']);
  }

  async modifyUser({
    userId,
    nickName,
    phoneNumber,
    gender,
  }: {
    userId: number;
    nickName?: string;
    phoneNumber?: string;
    gender?: Gender;
  }) {
    const user = await this.repository.updateUser({
      where: { id: userId },
      data: { nickName, phoneNumber, gender },
    });
    return exclude(user, ['password']);
  }

  async modifyUserPassword({
    userId,
    currentPassword,
    updatePassword,
  }: {
    userId: number;
    currentPassword: string;
    updatePassword: string;
  }) {
    const user = await this.fetchUserWithPassword({ userId });
    await this.authService.checkUserPassword({
      user,
      password: currentPassword,
    });

    const hashedPassword = await bcrypt.hash(updatePassword, 10);

    const updatedUser = await this.repository.updateUser({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return exclude(updatedUser, ['password']);
  }

  async resetPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const user = await this.fetchUser({ email });
    if (!user) {
      throw new BadRequestException('존재하지 않는 회원입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await this.repository.updateUser({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    return exclude(updatedUser, ['password']);
  }

  async fetchManyUser({
    option,
    keyword,
    page,
  }: {
    option?: string;
    keyword?: string;
    page?: number;
  }) {
    let searchOption: { name?: string; nickName?: string; email?: string } = {};

    if (option === 'name' && keyword) {
      searchOption.name = keyword;
    } else if (option === 'nickName' && keyword) {
      searchOption.nickName = keyword;
    } else if (option === 'email') {
      searchOption.email = keyword;
    }

    const { users, ...others } = await this.repository.findManyUser({
      searchOption,
      page,
    });
    const usersWithoutPassword = users.map((user) =>
      exclude(user, ['password']),
    );
    return { users: usersWithoutPassword, ...others };
  }

  async removeUser({ userId }: { userId: number }) {
    const today = new Date();

    const user = await this.repository.updateUser({
      where: { id: userId },
      data: { deletedAt: today },
    });
    return exclude(user, ['password']);
  }

  async modifyUserStopDate({
    userId,
    stopStartDate,
    stopEndDate,
  }: {
    userId: number;
    stopStartDate: Date;
    stopEndDate: Date;
  }) {
    const user = await this.fetchUser({ userId });
    if (!user) {
      throw new BadRequestException('존재하지 않는 회원입니다.');
    }
    if (user.deletedAt) {
      throw new BadRequestException('탈퇴한 회원입니다.');
    }

    const updatedUser = await this.repository.updateUser({
      where: { id: userId },
      data: { stopStartDate, stopEndDate },
    });
    return exclude(updatedUser, ['password']);
  }

  async createUserLog({ ip }: { ip: string }) {
    return await this.repository.insertUserLog({ ip });
  }

  async fetchUserCount() {
    const politicalOrientations =
      await this.politicalOrientationService.fetchManyPoliticalOrientation();

    const userCountByPoliticalOrientation = await Promise.all(
      politicalOrientations.map(async (politicalOrientation) => {
        const userCount = await this.repository.findUserPOCount({
          politicalOrientationId: politicalOrientation.id,
        });

        return { politicalOrientation, userCount };
      }),
    );
    const userTotal = await this.repository.findUserPOCount({});

    return { userCountByPoliticalOrientation, userTotal };
  }

  async fetchOneWeekUserLogCount({ today }: { today: Date }) {
    // 오늘 ~ 6일 전까지 날짜
    const options = { timeZone: 'Asia/Seoul' };

    const startDate = new Date(today.toLocaleString('en-US', options));
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 6);

    const endDate = new Date(today.toLocaleString('en-US', options));
    endDate.setHours(23, 59, 59, 999);

    // 일주일 방문자 수
    const userLogs = await this.repository.findManyUserLogCount({
      startDate,
      endDate,
    });

    const results = [];

    for (let i = 6; i >= 0; i--) {
      const loopDate = new Date(startDate);
      loopDate.setDate(startDate.getDate() + i);

      const date = loopDate.toLocaleDateString();

      const userLogSet = new Set(
        userLogs
          .filter((reply) => {
            const userLogDate = new Date(reply.createdAt).toLocaleDateString();
            return userLogDate === date;
          })
          .map(({ ip }) => ip),
      );
      const userLogCount = [...userLogSet].length;
      results.push({ date, userLogCount });
    }

    return results;
  }

  async fetchUserLogs({
    startDate,
    endDate,
    ip,
  }: {
    startDate: Date;
    endDate: Date;
    ip: string;
  }) {
    const userLogs = await this.repository.findManyUserLogCount({
      ip,
      startDate,
      endDate,
    });
    return userLogs;
  }
}
