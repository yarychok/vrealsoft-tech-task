import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest<T>(err: Error | null, user: T): T | null {
    if (err) throw err;
    return user || null;
  }

  canActivate(context: ExecutionContext) {
    try {
      return super.canActivate(context);
    } catch {
      return true;
    }
  }
}
