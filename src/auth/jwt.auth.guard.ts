import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser extends User = User>(
    err: Error | null,
    user: TUser,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
