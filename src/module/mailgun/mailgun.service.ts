import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailgun from 'mailgun.js';
import * as FormData from 'form-data';

@Injectable()
export class MailgunService {
  private MAILGUN_API_KEY: string;
  private MAILGUN_DOMAIN: string;

  constructor(private configService: ConfigService) {
    this.MAILGUN_API_KEY = this.configService.get('MAILGUN_API_KEY');
    this.MAILGUN_DOMAIN = this.configService.get('MAILGUN_DOMAIN');
  }

  async sendVerificationCodeByEmail({ email }: { email: string }) {
    try {
      const mailgun = new Mailgun(FormData);
      const mg = mailgun.client({
        username: 'api',
        key: this.MAILGUN_API_KEY,
      });

      const RANDOM_CODE = Math.floor(Math.random() * 10000000000).toString();

      const messageData = {
        from: `동서남북 Master <동서남북@${this.MAILGUN_DOMAIN}>`,
        to: [email],
        subject: '회원 가입 인증 코드입니다.',
        text: `${RANDOM_CODE}`,
      };

      await mg.messages.create(this.MAILGUN_DOMAIN, messageData);

      return RANDOM_CODE;
    } catch (err) {
      throw err;
    }
  }
}
