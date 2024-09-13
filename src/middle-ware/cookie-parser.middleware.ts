import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { oneMinuteInMilliseconds } from 'src/constants/millisecond';
import { UserService } from 'src/module/user/user.service';
import * as uuid from 'uuid';

@Injectable()
export class CookieParserMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const today = new Date();
    const options = { timeZone: 'Asia/Seoul' };
    const startDate = new Date(today.toLocaleString('en-US', options));
    const endDate = new Date(today.toLocaleString('en-US', options));

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const ip = req.ip;

    const userLogs = await this.userService.fetchUserLogs({
      startDate,
      endDate,
      ip,
    });

    if (userLogs.length === 0) {
      await this.userService.createUserLog({ ip });
    }

    next();
  }
}
