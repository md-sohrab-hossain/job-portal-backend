import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PostJobDto {
  @ApiProperty({ example: 'Software Engineer' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'We are looking for a skilled software engineer...' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: ['JavaScript', 'React', 'Node.js'] })
  @IsNotEmpty()
  @IsArray()
  requirements: string[];

  @ApiProperty({ example: 50000 })
  @IsNotEmpty()
  @IsNumber()
  salary: number;

  @ApiProperty({ example: 'Remote' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ example: 'Full-time' })
  @IsNotEmpty()
  @IsString()
  jobType: string;

  @ApiProperty({ example: 'Mid-Level' })
  @IsNotEmpty()
  @IsString()
  experienceLevel: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  position: number;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsString()
  companyId: string;
}

export class GetAllJobsDto {
  @ApiPropertyOptional({ example: 'engineer', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Full-time', required: false })
  @IsOptional()
  @IsString()
  jobType?: string;

  @ApiPropertyOptional({ example: '30000-80000', required: false })
  @IsOptional()
  @IsString()
  salary?: string;
}
