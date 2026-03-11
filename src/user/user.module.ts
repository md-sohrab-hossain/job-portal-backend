import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma.module';
import { AuthModule } from '../auth/auth.module';
import { BruteForceService } from './brute-force.service';
import { EmailService } from './email.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserController],
  providers: [UserService, BruteForceService, EmailService],
  exports: [UserService, BruteForceService, EmailService],
})
export class UserModule {}
