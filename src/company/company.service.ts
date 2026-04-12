import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/service';
import { RegisterCompanyDto, UpdateCompanyDto } from './dto/company.dto';


@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(private prisma: PrismaService) { }


  async registerCompany(userId: string, registerCompanyDto: RegisterCompanyDto) {
    const { name, description, website, location, logo } = registerCompanyDto;

    try {
      const existingCompany = await this.prisma.company.findUnique({
        where: { name },
      })

      if (existingCompany) {
        this.logger.warn(`Company name already exists: ${name}`);
        throw new BadRequestException('A company with this name already exists');
      }

      const company = await this.prisma.company.create({
        data: {
          name,
          description,
          website,
          location,
          logo,
          userId,
        },
      });

      this.logger.log(`Company created successfully: ${company.id}`);
      return company;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to register company`);
      throw new BadRequestException('Failed to register company');
    }
  }

  async getCompanies(userId: string) {
    try {
      const companies = await this.prisma.company.findMany({
        where: { userId },
      });

      if (!companies || companies.length === 0) {
        this.logger.warn(`No companies found for user ${userId}`);
        throw new NotFoundException('No companies found for this user');
      }

      return companies;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get companies`);
      throw new BadRequestException('Failed to retrieve companies');
    }
  }

  async getCompany(userId: string) {
    try {
      const company = await this.prisma.company.findFirst({
        where: { userId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      return company;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get company`);
      throw new BadRequestException('Failed to retrieve company');
    }
  }

  async deleteCompany(id: string) {
    try {
      const company = await this.prisma.company.delete({
        where: { id },
      });

      this.logger.log(`Company deleted successfully: ${id}`);
      return company;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete company`);
      throw new BadRequestException('Failed to delete company');
    }
  }

  async updateCompany(id: string, updateCompanyDto: UpdateCompanyDto) {
    try {
      const company = await this.prisma.company.update({
        where: { id },
        data: updateCompanyDto,
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      return company;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update company`);
      throw new BadRequestException('Failed to update company');
    }
  }
}
