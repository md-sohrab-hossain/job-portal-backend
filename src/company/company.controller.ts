import { Body, Get, Req, Post, Param, Delete, HttpCode, UseGuards, HttpStatus, Controller, Put } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '@auth/jwt.auth.guard';
import { RegisterCompanyDto, UpdateCompanyDto } from './dto/company.dto';
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

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  async getCompany(@Param('userId') userId: string) {
    const company = await this.companyService.getCompany(userId);

    return {
      data: company,
      success: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getCompanies(@Req() req: AuthenticatedRequest) {
    const userId: string = req.user.id;
    const companies = await this.companyService.getCompanies(userId);

    return {
      data: companies,
      success: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCompany(@Param('id') id: string) {
    await this.companyService.deleteCompany(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateCompany(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    const company = await this.companyService.updateCompany(id, updateCompanyDto);

    return {
      data: company,
      success: true,
      message: 'Company updated successfully',
    };
  }
}
