import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards, Query, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { UserService } from './user.service';
import { RegisterUserDto, LoginUserDto } from './dto/user.dto';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@Controller('user')
@UseGuards(ThrottlerGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.registerUser(registerUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async login(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.userService.login(loginUserDto);
    const { accessToken, refreshToken, ...userInfo } = result.data!;

    res.cookie('accessToken', accessToken, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    res.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return {
      success: result.success,
      message: result.message,
      data: userInfo,
    };
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('accessToken', '', {
      maxAge: 0,
      httpOnly: true,
      sameSite: 'strict',
    });

    res.cookie('refreshToken', '', {
      maxAge: 0,
      httpOnly: true,
      sameSite: 'strict',
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    return this.userService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body('email') email: string) {
    return this.userService.resendVerificationEmail(email);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req.cookies as Record<string, string>)?.refreshToken;
    const newTokens = await this.userService.refreshToken(refreshToken);

    if (!newTokens) {
      return {
        success: false,
        message: 'Invalid or expired refresh token',
      };
    }

    res.cookie('accessToken', newTokens.accessToken, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return {
      success: true,
      message: 'Token refreshed successfully',
    };
  }
}
