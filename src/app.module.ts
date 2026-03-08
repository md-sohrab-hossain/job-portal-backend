import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user/user.service';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { JobModule } from './job/job.module';
import { ApplicationModule } from './application/application.module';
import { ApplicationService } from './application/application.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    CompanyModule,
    UserModule,
    JobModule,
    ApplicationModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserService, ApplicationService, PrismaService],
})
export class AppModule {}
