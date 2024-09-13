import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { PoliticalOrientationModule } from '../political-orientation/political-orientation.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [UserService, UserRepository],
  controllers: [UserController],
  exports: [UserService],
  imports: [PoliticalOrientationModule, forwardRef(() => AuthModule)],
})
export class UserModule {}
