import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterUserDto, LoginUserDto, UpdateUserDto } from './dto/user.dto';
import { AuthService } from '../auth/auth.service';
import { BruteForceService } from './brute-force.service';
import { EmailService } from './email.service';
import { Role, User } from '@prisma/client';
import { IApiResponse, IRegisterResponse, ILoginResponse, IUserResponse } from '../common/types/api-response.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly bruteForceService: BruteForceService,
    private readonly emailService: EmailService,
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
    const verificationToken: string = this.authService.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
        verificationToken,
        verificationExpires,
      },
    });

    this.emailService.sendVerificationEmail(email, verificationToken);

    this.logger.log(`User registered successfully: ${user.email}. Verification email sent.`);

    return {
      success: true,
      message: 'User registered successfully. Please verify your email.',
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

    if (this.bruteForceService.isBlocked(email)) {
      throw new UnauthorizedException(`Too many login attempts. Try again later.`);
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      this.bruteForceService.recordFailure(email);
      const remainingAttempts = this.bruteForceService.getRemainingAttempts(email);
      throw new UnauthorizedException(`Invalid credentials. ${remainingAttempts} attempts remaining.`);
    }

    if (!user.isVerified && process.env.SKIP_EMAIL_VERIFICATION !== 'true') {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const isPasswordMatch = await this.authService.comparePassword(password, user.password);
    if (!isPasswordMatch) {
      this.bruteForceService.recordFailure(email);
      const remainingAttempts = this.bruteForceService.getRemainingAttempts(email);
      throw new UnauthorizedException(`Invalid credentials. ${remainingAttempts} attempts remaining.`);
    }

    if (role !== user.role) {
      throw new BadRequestException("Account doesn't exist with current role");
    }

    this.bruteForceService.recordSuccess(email);

    const accessToken = this.authService.generateToken(user.id, user.email, user.role);
    const refreshToken = this.authService.generateRefreshToken(user.id);

    this.logger.log(`User logged in successfully: ${user.email}`);

    return {
      success: true,
      message: 'Login successful',
      data: {
        ...this.mapToUserResponse(user),
        accessToken,
        refreshToken,
      },
    };
  }

  async verifyEmail(token: string): Promise<IApiResponse<{ verified: boolean }>> {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    this.logger.log(`Email verified successfully: ${user.email}`);

    return {
      success: true,
      message: 'Email verified successfully',
      data: { verified: true },
    };
  }

  async resendVerificationEmail(email: string): Promise<IApiResponse<{ resent: boolean }>> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken: string = this.authService.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires,
      },
    });

    this.emailService.sendVerificationEmail(email, verificationToken);

    this.logger.log(`Verification email resent to: ${email}`);

    return {
      success: true,
      message: 'Verification email sent successfully',
      data: { resent: true },
    };
  }

  async refreshToken(refreshToken?: string): Promise<{ accessToken: string } | null> {
    if (!refreshToken) {
      return null;
    }

    const payload = await this.authService.verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return null;
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return null;
    }

    const accessToken = this.authService.generateToken(user.id, user.email, user.role);
    return { accessToken };
  }

  async updateProfile(id: string, updateUserDto: UpdateUserDto): Promise<IApiResponse<IUserResponse>> {
    const { email, phoneNumber } = updateUserDto;

    if (email) {
      const existingUser = await this.prisma.user.findFirst({
        where: { email, NOT: { id } },
      });

      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (phoneNumber) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phoneNumber, NOT: { id } },
      });
      if (existingPhone) {
        throw new BadRequestException('Phone number already in use');
      }
    }

    const updateData: any = { ...updateUserDto };
    delete updateData.password;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      data: this.mapToUserResponse(updatedUser),
    };
  }
}
