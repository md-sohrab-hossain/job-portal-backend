import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const passwordRequirements = {
  message:
    'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
};

export class LoginUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: "User's registered email address. Must be a valid email format.",
    type: String,
    format: 'email',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      "User's password. Must meet password requirements (8+ chars, uppercase, lowercase, number, special char).",
    type: String,
    minLength: 8,
  })
  @IsString()
  password!: string;

  @ApiProperty({
    enum: Role,
    example: Role.student,
    description: 'User role. Determines user type: student (job seeker) or company (recruiter).',
    enumName: 'Role',
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role!: Role;
}

export class RegisterUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user. Required field. Must be 1-100 characters.',
    type: String,
    minLength: 1,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  fullname!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Valid email address. Must be unique - cannot be used by another user.',
    type: String,
    format: 'email',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number with country code. Format: +[country code][number]. Required.',
    type: String,
    pattern: '^[+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]*$',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, { message: 'Invalid phone number format' })
  phoneNumber!: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      'Password meeting security requirements: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (@$!%*?&). Required.',
    type: String,
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, passwordRequirements)
  password!: string;

  @ApiPropertyOptional({
    example: 'I am a developer',
    description: 'Short bio/description about the user. Optional field.',
    type: String,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  profileBio?: string;

  @ApiPropertyOptional({
    example: ['JavaScript', 'React', 'Node.js'],
    description: 'Array of user skills/tags. Optional field. Used for job matching.',
    type: [String],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  profileSkills?: string[];

  @ApiPropertyOptional({
    example: 'https://example.com/resume.pdf',
    description: "URL to user's resume/CV. Optional field. Must be a valid URL.",
    type: String,
    format: 'uri',
  })
  @IsOptional()
  @IsUrl()
  profileResume?: string;

  @ApiPropertyOptional({
    example: 'resume.pdf',
    description: 'Original filename of the uploaded resume. Optional.',
    type: String,
  })
  @IsOptional()
  @IsString()
  profileResumeOriginalName?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/photo.jpg',
    description: "URL to user's profile photo. Optional field.",
    type: String,
    format: 'uri',
  })
  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.student,
    description:
      'User role. Optional - defaults to student if not specified. Use Role.student for job seekers, Role.company for recruiters.',
    enumName: 'Role',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Updated full name. Optional - only include if updating.',
    type: String,
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  fullname?: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'Updated email address. Optional - only include if changing. Must be unique.',
    type: String,
    format: 'email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Updated phone number. Optional - only include if changing. Must be unique.',
    type: String,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'NewPassword123!',
    description: 'New password. Optional - only include if changing password. Must meet password requirements.',
    type: String,
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    example: 'I am a senior developer with 5 years experience',
    description: 'Updated bio/description. Optional - only include if updating.',
    type: String,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  profileBio?: string;

  @ApiPropertyOptional({
    example: ['JavaScript', 'React', 'Node.js', 'Python'],
    description: 'Updated skills array. Optional - replaces entire existing skills array.',
    type: [String],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  profileSkills?: string[];

  @ApiPropertyOptional({
    example: 'https://example.com/new-resume.pdf',
    description: 'Updated resume URL. Optional - only include if changing resume.',
    type: String,
    format: 'uri',
  })
  @IsOptional()
  @IsUrl()
  profileResume?: string;

  @ApiPropertyOptional({
    example: 'new-resume.pdf',
    description: 'Updated resume filename. Optional.',
    type: String,
  })
  @IsOptional()
  @IsString()
  profileResumeOriginalName?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/new-photo.jpg',
    description: 'Updated profile photo URL. Optional - only include if changing photo.',
    type: String,
    format: 'uri',
  })
  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.recruiter,
    description: 'Updated role. Optional - use with caution. Role change may affect user permissions.',
    enumName: 'Role',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UserResponseDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Unique user ID (MongoDB ObjectId)',
    type: String,
  })
  id!: string;

  @ApiProperty({
    example: 'John Doe',
    description: "User's full name",
    type: String,
  })
  fullname!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: "User's email address",
    type: String,
    format: 'email',
  })
  email!: string;

  @ApiProperty({
    example: '+1234567890',
    description: "User's phone number with country code",
    type: String,
  })
  phoneNumber!: string;

  @ApiProperty({
    enum: Role,
    example: Role.student,
    description: 'User role: student (job seeker) or recruiter (employer)',
    enumName: 'Role',
  })
  role!: Role;

  @ApiPropertyOptional({
    example: 'I am a passionate developer...',
    description: "User's bio/description",
    type: String,
  })
  profileBio?: string;

  @ApiPropertyOptional({
    example: ['JavaScript', 'React'],
    description: 'Array of user skills',
    type: [String],
    isArray: true,
  })
  profileSkills?: string[];

  @ApiPropertyOptional({
    example: 'https://example.com/resume.pdf',
    description: "URL to user's resume",
    type: String,
  })
  profileResume?: string;

  @ApiPropertyOptional({
    example: 'resume.pdf',
    description: 'Original filename of resume',
    type: String,
  })
  profileResumeOriginalName?: string;

  @ApiPropertyOptional({
    example: '507f1f77bcf86cd799439011',
    description: 'Associated company ID (only for recruiter role)',
    type: String,
  })
  profileCompanyId?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/photo.jpg',
    description: "URL to user's profile photo",
    type: String,
  })
  profilePhoto?: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'User account creation timestamp',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-20T14:45:00.000Z',
    description: 'Last profile update timestamp',
    type: String,
    format: 'date-time',
  })
  updatedAt!: Date;
}
