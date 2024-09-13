import { Injectable, BadRequestException } from '@nestjs/common';
import { VerificationCodeRepository } from './verification-code.repository';

@Injectable()
export class VerificationCodeService {
  constructor(private repository: VerificationCodeRepository) {}

  async createVerificationCode({
    email,
    code,
  }: {
    email: string;
    code: string;
  }) {
    return await this.repository.insertVerificationCode({ email, code });
  }

  async fetchVerificationCode({
    email,
    code,
  }: {
    email: string;
    code: string;
  }) {
    const userEmail = await this.repository.findVerificationCode({ email });
    if (userEmail.code !== code) {
      throw new BadRequestException('인증 번호가 다릅니다.');
    }

    return userEmail;
  }
}
