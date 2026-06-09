// src/common/guards/admin.guard.ts

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CurrentUser } from '../types/current-user.type';

type RequestWithUser = {
  user?: CurrentUser;
};

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user?.isAdmin) {
      throw new ForbiddenException({
        code: 'INVALID_ROLE',
        message: 'Yetkiniz bulunmamaktadır.',
      });
    }

    return true;
  }
}
