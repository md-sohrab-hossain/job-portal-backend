import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterUserDto, LoginUserDto } from './dto/user.dto';
import { AuthService } from '../auth/auth.service';
import { Role, User } from '@prisma/client';
import { IApiResponse, IRegisterResponse, ILoginResponse, IUserResponse } from '../common/types/api-response.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  private mapToUserResponse(user: User): IUserResponse {
    return {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profileBio: user.profileBio ?? undefined,
      profileSkills: user.profileSkills ?? undefined,
      profileResume: user.profileResume ?? undefined,
      profileResumeOriginalName: user.profileResumeOriginalName ?? undefined,
      profilePhoto: user.profilePhoto ?? undefined,
    };
  }

  async registerUser(registerUserDto: RegisterUserDto): Promise<IApiResponse<IRegisterResponse>> {
    const {
      fullname,
      email,
      phoneNumber,
      password,
      profileBio,
      profileSkills,
      profileResume,
      profileResumeOriginalName,
      profilePhoto,
      role = Role.student,
    } = registerUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await this.authService.hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        fullname,
        email,
        phoneNumber,
        password: hashedPassword,
        profileBio,
        profileSkills,
        profileResume,
        profileResumeOriginalName,
        profilePhoto,
        role,
      },
    });

    this.logger.log(`User registered successfully: ${user.email}`);

    return {
      success: true,
      message: 'User registered successfully. Please login.',
      data: {
        user: this.mapToUserResponse(user),
      },
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<IApiResponse<ILoginResponse>> {
    const { email, password, role } = loginUserDto;

    if (!email || !password || !role) {
      throw new BadRequestException('Email, password and role are required');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatch = await this.authService.comparePassword(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (role !== user.role) {
      throw new BadRequestException("Account doesn't exist with current role");
    }

    const accessToken = this.authService.generateToken(user.id, user.email);

    this.logger.log(`User logged in successfully: ${user.email}`);

    return {
      success: true,
      message: 'Login successful',
      data: {
        ...this.mapToUserResponse(user),
        accessToken,
      },
    };
  }
}
