import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterUserDto } from './dto/user.dto';
import { AuthService } from '../auth/auth.service';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
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

    const token = this.authService.generateToken(user.id, user.email);

    this.logger.log(`User registered successfully: ${user.email}`);

    return {
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      token,
    };
  }
}
