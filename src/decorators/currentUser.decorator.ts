import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User, PoliticalOrientation } from '@prisma/client';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);

export type CurrentUserPoliticalType = User & {
  politicalOrientation: PoliticalOrientation;
};
