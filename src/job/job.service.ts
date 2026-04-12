import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/service';
import { Prisma } from '@prisma/client';
import { PostJobDto, GetAllJobsDto } from './dto/job.dto';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(private readonly prisma: PrismaService) {}

  async postJob(userId: string, postJobDto: PostJobDto) {
    const { title, description, requirements, salary, location, jobType, experienceLevel, position, companyId } =
      postJobDto;

    try {
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        this.logger.warn(`Company not found: ${companyId}`);
        throw new NotFoundException('Company not found');
      }

      const job = await this.prisma.job.create({
        data: {
          title,
          description,
          requirements,
          salary,
          location,
          jobType,
          experienceLevel,
          position,
          companyId,
          createdById: userId,
        },
      });

      this.logger.log(`Job created successfully: ${job.id}`);
      return job;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to post job: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to post job');
    }
  }

  async getAllJobs(query: GetAllJobsDto) {
    const { keyword, location, jobType, salary } = query;

    try {
      const where: Prisma.JobWhereInput = {};

      if (keyword) {
        where.OR = [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ];
      }

      if (location) {
        where.location = { contains: location, mode: 'insensitive' };
      }

      if (jobType) {
        where.jobType = { equals: jobType, mode: 'insensitive' };
      }

      if (salary) {
        const salaryRange = salary.split('-').map((s) => Number(s));
        if (salaryRange.length !== 2 || salaryRange.some((s) => Number.isNaN(s))) {
          throw new BadRequestException('Invalid salary range format. Use min-max');
        }
        where.salary = { gte: salaryRange[0], lte: salaryRange[1] };
      }

      const jobs = await this.prisma.job.findMany({
        where,
        include: { company: true },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(`Found ${jobs.length} jobs`);
      return jobs;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to fetch jobs: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to retrieve jobs');
    }
  }

  async getJobById(id: string) {
    try {
      const job = await this.prisma.job.findUnique({
        where: { id },
        include: { company: true, applications: true },
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      return job;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to retrieve job');
    }
  }

  async getJobByUserId(createdById: string) {
    try {
      const jobs = await this.prisma.job.findMany({
        where: { createdById },
        include: { company: true },
        orderBy: { createdAt: 'desc' },
      });

      return jobs;
    } catch (error) {
      this.logger.error(`Failed to fetch jobs for user ${createdById}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to retrieve jobs');
    }
  }

  async createFavorite(jobId: string, userId: string) {
    try {
      const existingFav = await this.prisma.favorite.findFirst({
        where: { jobId, userId },
      });

      if (existingFav) {
        throw new BadRequestException('This job is already in favorites');
      }

      const newFav = await this.prisma.favorite.create({
        data: { userId, jobId },
      });

      return newFav;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to create favorite: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to add job to favorites');
    }
  }

  async getFavorites(userId: string) {
    try {
      const getJobs = await this.prisma.favorite.findMany({
        where: { userId },
        include: { job: { include: { company: true } } },
      });

      if (!getJobs?.length) {
        throw new NotFoundException('Job not found');
      }
      return getJobs;
    } catch (error) {
      this.logger.error(`Failed to fetch favorites for user ${userId}: ${error.message}`, error.stack);

      throw new NotFoundException('Job not found');
    }
  }

  async deleteJob(jobId: string, userId: string) {
    try {
      return await this.prisma.job.delete({
        where: {
          id: jobId,
          createdById: userId,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      throw new NotFoundException('Job not found or not authorized');
    }
  }

  async updateJob(jobId: string, userId: string, updateJobDto: PostJobDto) {
    const { title, description, requirements, salary, location, jobType, experienceLevel, position, companyId } =
      updateJobDto;

    try {
      // Small verification to ensure job exists and belongs to user
      const existingJob = await this.prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!existingJob) {
        throw new NotFoundException('Job not found');
      }

      if (existingJob.createdById !== userId) {
        throw new BadRequestException('Not authorized to update this job');
      }

      const job = await this.prisma.job.update({
        where: { id: jobId },
        data: {
          title,
          description,
          requirements,
          salary,
          location,
          jobType,
          experienceLevel,
          position,
          companyId,
        },
      });

      this.logger.log(`Job updated successfully: ${job.id}`);
      return job;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update job: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update job');
    }
  }
}
