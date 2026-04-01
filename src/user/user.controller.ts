import {
  Get,
  Put,
  Res,
  Req,
  Post,
  Body,
  Query,
  HttpCode,
  UseGuards,
  HttpStatus,
  Controller,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { UserService } from './user.service';
import { RegisterUserDto, LoginUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@auth/jwt.auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { userControllerDocs } from '@config/docs/user.docs';
import type { AuthenticatedRequest } from '@common/interfaces/auth.interface';
import { setAuthCookies, clearAuthCookies } from '@common/helpers/cookie.helper';

@ApiTags('User')
@Controller('user')
@UseGuards(ThrottlerGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation(userControllerDocs.register)
  @ApiResponse({ status: 201, description: 'User registered successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or user already exists' })
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.registerUser(registerUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @ApiOperation(userControllerDocs.login)
  @ApiResponse({ status: 200, description: 'Login successful', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials or email not verified' })
  @ApiResponse({ status: 429, description: 'Too many requests - rate limited' })
  async login(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.userService.login(loginUserDto);

    if (!result.success || !result.data) {
      return result;
    }

    const { accessToken, refreshToken, ...userInfo } = result.data;
    setAuthCookies(res, accessToken, refreshToken);

    return { success: result.success, message: result.message, data: userInfo };
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation(userControllerDocs.logout)
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res);
    return { success: true, message: 'Logged out successfully' };
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation(userControllerDocs.verifyEmail)
  @ApiQuery({ name: 'token', description: 'Verification token from email', required: true })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Query('token') token: string) {
    return this.userService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation(userControllerDocs.resendVerification)
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 400, description: 'User not found or already verified' })
  async resendVerification(@Body('email') email: string) {
    return this.userService.resendVerificationEmail(email);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation(userControllerDocs.refreshToken)
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(HttpStatus.UNAUTHORIZED);
      return { success: false, message: 'Refresh token not found' };
    }

    const newTokens = await this.userService.refreshToken(refreshToken);

    if (!newTokens) {
      res.status(HttpStatus.UNAUTHORIZED);
      return { success: false, message: 'Invalid or expired refresh token' };
    }

    setAuthCookies(res, newTokens.accessToken, newTokens.refreshToken);
    return { success: true, message: 'Token refreshed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Put('updateProfile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(userControllerDocs.updateProfile)
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or duplicate email/phone' })
  async updateProfile(@Req() req: AuthenticatedRequest, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Invalid token');
    }

    return this.userService.updateProfile(userId, updateUserDto);
  }
}
