import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

const passwordRequirements = {
  message:
    'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
};

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role!: Role;
}

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  fullname!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, { message: 'Invalid phone number format' })
  phoneNumber!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, passwordRequirements)
  password!: string;

  @IsOptional()
  @IsString()
  profileBio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  profileSkills?: string[];

  @IsOptional()
  @IsUrl()
  profileResume?: string;

  @IsOptional()
  @IsString()
  profileResumeOriginalName?: string;

  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  profileBio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  profileSkills?: string[];

  @IsOptional()
  @IsUrl()
  profileResume?: string;

  @IsOptional()
  @IsString()
  profileResumeOriginalName?: string;

  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UserResponseDto {
  id!: string;
  fullname!: string;
  email!: string;
  phoneNumber!: string;
  role!: Role;
  profileBio?: string;
  profileSkills?: string[];
  profileResume?: string;
  profileResumeOriginalName?: string;
  profileCompanyId?: string;
  profilePhoto?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
