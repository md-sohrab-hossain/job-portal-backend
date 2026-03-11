import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { ITokenPayload } from '@common/types/api-response.interface';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(userId: string, email: string, role: Role, expiresIn: string = '1h'): string {
    const options: JwtSignOptions = {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: expiresIn as any,
    };

    return this.jwtService.sign({ sub: userId, email, role }, options);
  }

  generateRefreshToken(userId: string, expiresIn: string = '7d'): string {
    const options: JwtSignOptions = {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: expiresIn as any,
    };

    return this.jwtService.sign({ sub: userId, type: 'refresh' }, options);
  }

  async verifyToken(token: string): Promise<ITokenPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync<ITokenPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return payload;
    } catch {
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = Number(this.configService.get<string>('BCRYPT_ROUNDS')) || 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string | null): Promise<boolean> {
    if (!hashedPassword) {
      return false;
    }
    return await bcrypt.compare(password, hashedPassword);
  }

  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async hashVerificationToken(token: string): Promise<string> {
    return await bcrypt.hash(token, 10);
  }
}
