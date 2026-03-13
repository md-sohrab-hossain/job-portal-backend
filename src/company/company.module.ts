import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { PrismaModule } from '@prisma';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
