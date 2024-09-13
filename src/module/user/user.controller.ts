import {
  Controller,
  Get,
  UseGuards,
  Put,
  Body,
  Patch,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPoliticalType,
} from 'src/decorators/currentUser.decorator';
import {
  PatchUserPasswordBody,
  PatchForgotPassword,
  PutUserBody,
} from './type';

@ApiTags('user')
@Controller('user')
@ApiBearerAuth('access-token')
export class UserController {
  constructor(private userService: UserService) {}

  @Patch('/forgot/password')
  async postForgotPassword(@Body() body: PatchForgotPassword) {
    return await this.userService.resetPassword(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(@CurrentUser() user: CurrentUserPoliticalType) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('/me')
  async putMe(
    @CurrentUser() user: CurrentUserPoliticalType,
    @Body() body: PutUserBody,
  ) {
    if (body.nickName?.length > 15) {
      throw new BadRequestException('닉네임은 최대 15글자까지 가능합니다.');
    }

    return await this.userService.modifyUser({
      userId: user.id,
      ...body,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/me/password')
  async patchPassword(
    @CurrentUser() user: CurrentUserPoliticalType,
    @Body() body: PatchUserPasswordBody,
  ) {
    return await this.userService.modifyUserPassword({
      userId: user.id,
      ...body,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/me')
  async deleteMe(@CurrentUser() user: CurrentUserPoliticalType) {
    await this.userService.removeUser({ userId: user.id });

    return true;
  }
}
