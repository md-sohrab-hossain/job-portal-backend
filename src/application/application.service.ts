import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/service';
import { UpdateStatusDto } from './dto/application.dto';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(private prisma: PrismaService) {}

  private isValidObjectId(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    return /^[a-fA-F0-9]{24}$/.test(id);
  }

  async applyJob(applicantId: string, jobId: string) {
    this.logger.log(`User ${applicantId} applying for job ${jobId}`);

    try {
      const application = await this.prisma.$transaction(async (tx) => {
        const job = await tx.job.findUnique({
          where: { id: jobId },
        });

        if (!job) {
          this.logger.warn(`Job not found: ${jobId}`);
          throw new NotFoundException({
            success: false,
            message: 'Job not found',
            errors: [{ field: 'jobId', message: 'The requested job does not exist' }],
          });
        }

        const existingApplication = await tx.application.findFirst({
          where: {
            jobId,
            applicantId,
          },
        });

        if (existingApplication) {
          this.logger.warn(`User ${applicantId} already applied for job ${jobId}`);
          throw new ConflictException({
            success: false,
            message: 'You have already applied for this job',
            errors: [
              {
                field: 'application',
                message: 'Duplicate application not allowed',
              },
            ],
          });
        }

        const newApplication = await tx.application.create({
          data: {
            jobId,
            applicantId,
          },
        });

        return newApplication;
      });

      this.logger.log(`Application created successfully: ${application.id}`);
      return application;
    } catch (error) {
      this.logger.error(`Failed to apply for job ${jobId}`, error.stack);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to submit application',
        errors: [{ field: 'application', message: 'Please try again later' }],
      });
    }
  }

  async getAppliedJobs(applicantId: string) {
    try {
      this.logger.log(`Fetching applications for user: ${applicantId}`);

      const applications = await this.prisma.application.findMany({
        where: { applicantId },
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            include: { company: true },
          },
        },
      });

      this.logger.log(`Found ${applications.length} applications for user ${applicantId}`);

      return applications;
    } catch (error) {
      this.logger.error(`Failed to fetch applications for user ${applicantId}`, error.stack);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to retrieve applications',
      });
    }
  }

  async getApplicants(jobId: string, userId: string, userRole: string) {
    if (!jobId || jobId.trim() === '') {
      this.logger.warn(`Invalid job ID provided`);
      throw new BadRequestException({
        success: false,
        message: 'Job ID is required',
      });
    }

    if (!this.isValidObjectId(jobId)) {
      this.logger.warn(`Malformed ObjectID provided: ${jobId}`);
      throw new BadRequestException({
        success: false,
        message: 'Invalid job ID format',
        errors: [{ field: 'jobId', message: 'Job ID must be a valid MongoDB ObjectID (24 hex characters)' }],
      });
    }

    try {
      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
        include: {
          applications: {
            orderBy: { createdAt: 'desc' },
            include: { applicant: true },
          },
        },
      });

      if (!job) {
        this.logger.warn(`Job not found: ${jobId}`);
        throw new NotFoundException({
          success: false,
          message: 'Job not found',
        });
      }

      if (userRole !== 'admin' && job.createdById !== userId) {
        this.logger.warn(`User ${userId} unauthorized to view applicants for job ${jobId}`);
        throw new ForbiddenException({
          success: false,
          message: 'You are not authorized to view applicants for this job',
        });
      }

      this.logger.log(`Applicants retrieved for job ${jobId} by user ${userId}`);
      return job;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error(`Failed to fetch applicants for job ${jobId}`, error.stack);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to retrieve applicants',
      });
    }
  }

  async updateStatus(applicationId: string, updateStatusDto: UpdateStatusDto, userId: string, userRole: string) {
    if (!applicationId || applicationId.trim() === '') {
      this.logger.warn(`Invalid application ID provided`);
      throw new BadRequestException({
        success: false,
        message: 'Application ID is required',
      });
    }

    if (!this.isValidObjectId(applicationId)) {
      this.logger.warn(`Malformed ObjectID provided: ${applicationId}`);
      throw new BadRequestException({
        success: false,
        message: 'Invalid application ID format',
        errors: [
          { field: 'applicationId', message: 'Application ID must be a valid MongoDB ObjectID (24 hex characters)' },
        ],
      });
    }

    try {
      const application = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: { job: true },
      });

      if (!application) {
        this.logger.warn(`Application not found: ${applicationId}`);
        throw new NotFoundException({
          success: false,
          message: 'Application not found',
        });
      }

      if (userRole !== 'admin' && application.job.createdById !== userId) {
        this.logger.warn(`User ${userId} unauthorized to update application ${applicationId}`);
        throw new ForbiddenException({
          success: false,
          message: 'You are not authorized to update this application',
        });
      }

      const { status } = updateStatusDto;
      const updatedApplication = await this.prisma.application.update({
        where: { id: applicationId },
        data: { status: status.toLowerCase() as any },
      });

      this.logger.log(`Application ${applicationId} status updated to ${status} by user ${userId}`);
      return updatedApplication;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error(`Failed to update status for application ${applicationId}`, error.stack);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to update application status',
      });
    }
  }
}
