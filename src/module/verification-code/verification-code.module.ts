import { Module } from '@nestjs/common';
import { VerificationCodeService } from './verification-code.service';
import { VerificationCodeRepository } from './verification-code.repository';

@Module({
  providers: [VerificationCodeService, VerificationCodeRepository],
  exports: [VerificationCodeService],
})
export class VerificationCodeModule {}
