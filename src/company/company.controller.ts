import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '@auth/jwt.auth.guard';
import { RegisterCompanyDto } from './dto/company.dto';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @UseGuards(JwtAuthGuard)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerCompany(@Req() req: AuthenticatedRequest, @Body() registerCompanyDto: RegisterCompanyDto) {
    const userId: string = req.user.id;
    const company = await this.companyService.registerCompany(userId, registerCompanyDto);

    return {
      message: 'Company created successfully',
      data: company,
      success: true,
    };
  }
}
