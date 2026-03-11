import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/service';
import { RegisterCompanyDto } from './dto/company.dto';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(private prisma: PrismaService) {}

  async registerCompany(userId: string, registerCompanyDto: RegisterCompanyDto) {
    const { name, description, website, location, logo } = registerCompanyDto;

    const [existingCompany, existingUserCompany] = await Promise.all([
      this.prisma.company.findUnique({
        where: { name },
      }),
      this.prisma.company.findFirst({
        where: { userId },
      }),
    ]);

    if (existingCompany) {
      this.logger.warn(`Company name already exists: ${name}`);
      throw new BadRequestException('A company with this name already exists');
    }

    if (existingUserCompany) {
      this.logger.warn(`User ${userId} already has a company`);
      throw new BadRequestException('You have already registered a company');
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
  }
}
