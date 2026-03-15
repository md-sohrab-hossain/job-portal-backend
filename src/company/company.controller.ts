import { Body, Get, Req, Post, Param, Delete, HttpCode, UseGuards, HttpStatus, Controller, Put } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '@auth/jwt.auth.guard';
import { RegisterCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { companyControllerDocs } from '@config/docs/company.docs';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @UseGuards(JwtAuthGuard)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(companyControllerDocs.registerCompany)
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
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
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(companyControllerDocs.getCompany)
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Company not found' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(companyControllerDocs.getCompanies)
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(companyControllerDocs.deleteCompany)
  @ApiResponse({ status: 204, description: 'Company deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async deleteCompany(@Param('id') id: string) {
    await this.companyService.deleteCompany(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(companyControllerDocs.updateCompany)
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async updateCompany(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    const company = await this.companyService.updateCompany(id, updateCompanyDto);

    return {
      data: company,
      success: true,
      message: 'Company updated successfully',
    };
  }
}
