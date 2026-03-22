import { Controller, Param, Post, Req, UseGuards, HttpCode, HttpStatus, Get, Body, Put } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { JwtAuthGuard } from '@auth/jwt.auth.guard';
import { Request } from 'express';
import { UpdateStatusDto } from './dto/application.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { applicationControllerDocs } from '@config/docs/application.docs';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('Application')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(applicationControllerDocs.applyJob)
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid job ID format' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 409, description: 'Already applied for this job' })
  async applyJob(@Req() req: AuthenticatedRequest, @Param('id') jobId: string) {
    const applicantId = req.user.id;

    const application = await this.applicationService.applyJob(applicantId, jobId);

    return {
      success: true,
      message: 'Job applied successfully',
      data: application,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(applicationControllerDocs.getAppliedJobs)
  @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAppliedJobs(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;

    const applications = await this.applicationService.getAppliedJobs(userId);

    return {
      success: true,
      message: applications.length > 0 ? 'Applications retrieved successfully' : 'No applications found',
      data: applications,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/applicants')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(applicationControllerDocs.getApplicants)
  @ApiResponse({ status: 200, description: 'Applicants retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not authorized to view applicants' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getApplicants(@Req() req: AuthenticatedRequest, @Param('id') jobId: string) {
    const userId = req.user.id;
    const userRole = req.user.role;

    const job = await this.applicationService.getApplicants(jobId, userId, userRole);

    return {
      success: true,
      message: 'Applicants retrieved successfully',
      data: job,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-status/:applicationId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(applicationControllerDocs.updateStatus)
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this application' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 400, description: 'Invalid status value' })
  async updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('applicationId') applicationId: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;

    const updatedApplication = await this.applicationService.updateStatus(
      applicationId,
      updateStatusDto,
      userId,
      userRole,
    );

    return {
      success: true,
      message: 'Application status updated successfully',
      data: updatedApplication,
    };
  }
}
