import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import {
  PostSendCode,
  PostCheckOverlapNickName,
  PostLoginBody,
  PostSignUpBody,
  PostCompareCode,
} from './type';
import { UserService } from '../user/user.service';
import { MailgunService } from '../mailgun/mailgun.service';
import { VerificationCodeService } from '../verification-code/verification-code.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private mailgunService: MailgunService,
    private verificationService: VerificationCodeService,
  ) {}

  @Post('/sendCode')
  async postSendCode(@Body() { email }: PostSendCode) {
    const user = await this.userService.fetchUser({ email });
    if (user) {
      throw new BadRequestException('이메일이 중복됩니다.');
    }

    try {
      const code = await this.mailgunService.sendVerificationCodeByEmail({
        email,
      });

      await this.verificationService.createVerificationCode({ email, code });

      return '인증 번호가 발송 되었습니다.';
    } catch (error) {
      return error;
    }
  }

  @Post('/sendCode/forgotPassword')
  async postSendCodeByForgotPassword(@Body() { email }: PostSendCode) {
    const user = await this.userService.fetchUser({ email });
    if (user.deletedAt) {
      throw new BadRequestException('탈퇴한 회원입니다.');
    }
    if (!user) {
      throw new BadRequestException('존재 하지 않는 회원입니다.');
    }

    try {
      const code = await this.mailgunService.sendVerificationCodeByEmail({
        email,
      });

      await this.verificationService.createVerificationCode({ email, code });

      return '인증 번호가 발송 되었습니다.';
    } catch (error) {
      return error;
    }
  }

  @Post('/compareCode')
  async postCompareCode(@Body() { email, code }: PostCompareCode) {
    return await this.verificationService.fetchVerificationCode({
      email,
      code,
    });
  }

  @Post('/checkNickName')
  async postCheckedNickName(@Body() { nickName }: PostCheckOverlapNickName) {
    if (nickName.length > 15) {
      throw new BadRequestException('닉네임은 최대 15글자까지 가능합니다.');
    }

    const user = await this.userService.fetchUser({ nickName });
    if (user) {
      throw new BadRequestException('닉네임이 중복됩니다.');
    }

    return true;
  }

  @Post('/signUp')
  async postSignUp(@Body() body: PostSignUpBody) {
    if (body.nickName.length > 15) {
      throw new BadRequestException('닉네임은 최대 15글자까지 가능합니다.');
    }
    const user = await this.userService.createUser(body);

    return { userId: user.id };
  }

  @Post('/logIn')
  async postLogin(@Body() { email, password }: PostLoginBody) {
    const user = await this.userService.fetchUserWithPassword({ email });
    if (!user) {
      throw new BadRequestException('존재하지 않는 회원입니다.');
    }
    if (user.deletedAt) {
      throw new BadRequestException('탈퇴한 회원입니다.');
    }

    const today = new Date();
    if (user.stopEndDate > today) {
      throw new BadRequestException(
        `${user.stopStartDate.toLocaleDateString()} ~ ${user.stopEndDate.toLocaleDateString()} 정지된 계정입니다.`,
      );
    }

    await this.userService.modifyUserStopDate({
      userId: user.id,
      stopStartDate: null,
      stopEndDate: null,
    });

    await this.authService.checkUserPassword({ user, password: password });

    const token = await this.authService.generateToken({
      userId: user.id,
      isAdmin: user.isAdmin,
    });

    return { token };
  }
}
