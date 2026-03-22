import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyJobDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Job ID' })
  @IsNotEmpty()
  @IsString()
  jobId: string;
}

export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export class UpdateStatusDto {
  @ApiProperty({
    enum: ApplicationStatus,
    example: 'pending',
    description: 'Application status',
    enumName: 'ApplicationStatus',
  })
  @IsNotEmpty()
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}
