import {
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
  Controller,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { JobService } from './job.service';
import { JwtAuthGuard } from '@auth/jwt.auth.guard';
import { PostJobDto, GetAllJobsDto } from './dto/job.dto';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { jobControllerDocs } from '@config/docs/job.docs';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@ApiTags('Job')
@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(jobControllerDocs.postJob)
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async postJob(@Req() req: AuthenticatedRequest, @Body() postJobDto: PostJobDto) {
    const userId: string = req.user.id;
    const job = await this.jobService.postJob(userId, postJobDto);

    return {
      message: 'Job posted successfully',
      data: job,
      success: true,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation(jobControllerDocs.getAllJobs)
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  async getAllJobs(@Query() query: GetAllJobsDto) {
    const jobs = await this.jobService.getAllJobs(query);

    return {
      data: jobs,
      success: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(jobControllerDocs.getJobByUserId)
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getJobByUserId(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const jobs = await this.jobService.getJobByUserId(userId);
    return { data: jobs, success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(jobControllerDocs.getFavorites)
  @ApiResponse({ status: 200, description: 'Favorites retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFavorites(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const result = await this.jobService.getFavorites(userId);
    return { data: result, success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorite/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(jobControllerDocs.createFavorite)
  @ApiResponse({ status: 200, description: 'Job added to favorites' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Job already in favorites' })
  async createFavorite(@Req() req: AuthenticatedRequest, @Param('id') jobId: string) {
    const userId = req.user.id;
    const result = await this.jobService.createFavorite(jobId, userId);
    return { data: result, success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(jobControllerDocs.deleteJob)
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this job' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async deleteJob(@Req() req: AuthenticatedRequest, @Param('id') jobId: string) {
    const userId = req.user.id;
    const result = await this.jobService.deleteJob(jobId, userId);
    return {
      data: result,
      success: true,
      message: 'Job deleted successfully',
    };
  }
  
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a job listing' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async updateJob(
    @Req() req: AuthenticatedRequest,
    @Param('id') jobId: string,
    @Body() updateJobDto: PostJobDto,
  ) {
    const userId = req.user.id;
    const job = await this.jobService.updateJob(jobId, userId, updateJobDto);
    return {
      message: 'Job updated successfully',
      data: job,
      success: true,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation(jobControllerDocs.getJobById)
  @ApiResponse({ status: 200, description: 'Job retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJobById(@Param('id') jobId: string) {
    const job = await this.jobService.getJobById(jobId);
    return { data: job, success: true };
  }
}
