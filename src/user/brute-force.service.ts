import { Injectable, Logger } from '@nestjs/common';

interface FailedAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

@Injectable()
export class BruteForceService {
  private readonly logger = new Logger(BruteForceService.name);
  private readonly attempts: Map<string, FailedAttempt> = new Map();
  private readonly maxAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000;

  isBlocked(identifier: string): boolean {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return false;

    if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
      return true;
    }

    if (attempt.lockedUntil && Date.now() >= attempt.lockedUntil) {
      this.attempts.delete(identifier);
      return false;
    }

    return false;
  }

  recordFailure(identifier: string): void {
    const attempt = this.attempts.get(identifier) || { count: 0, lastAttempt: Date.now() };
    attempt.count += 1;
    attempt.lastAttempt = Date.now();

    if (attempt.count >= this.maxAttempts) {
      attempt.lockedUntil = Date.now() + this.lockoutDuration;
      this.logger.warn(`Account locked for: ${identifier}`);
    }

    this.attempts.set(identifier, attempt);
  }

  recordSuccess(identifier: string): void {
    this.attempts.delete(identifier);
  }

  getRemainingAttempts(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - attempt.count);
  }
}
