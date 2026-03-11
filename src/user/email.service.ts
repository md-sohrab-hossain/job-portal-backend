import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  sendVerificationEmail(email: string, token: string): void {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;

    this.logger.log(`Sending verification email to: ${email}`);
    this.logger.log(`Verification URL: ${verificationUrl}`);

    console.log(`
      ╔══════════════════════════════════════════════════════════╗
      ║                    EMAIL VERIFICATION                      ║
      ╠══════════════════════════════════════════════════════════╣
      ║  To: ${email.padEnd(55)}║
      ║  Verification Link: ${verificationUrl}
      ╚══════════════════════════════════════════════════════════╝
    `);
  }

  sendPasswordResetEmail(email: string, token: string): void {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

    this.logger.log(`Sending password reset email to: ${email}`);
    console.log(`
      ╔══════════════════════════════════════════════════════════╗
      ║                  PASSWORD RESET EMAIL                     ║
      ╠══════════════════════════════════════════════════════════╣
      ║  To: ${email.padEnd(55)}║
      ║  Reset Link: ${resetUrl}
      ╚══════════════════════════════════════════════════════════╝
    `);
  }
}
