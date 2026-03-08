import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      { secret: this.configService.get<string>('JWT_SECRET'), expiresIn: '1h' },
    );
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return true;
    } catch {
      return false;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds =
      Number(this.configService.get<string>('BCRYPT_ROUNDS')) || 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
