import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { CurrentUser } from '../types/current-user.type';

type RequestWithUser = {
  user?: CurrentUser;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Missing authenticated user');
    }

    if (user.isAdmin) {
      return true;
    }

    const userRoles = new Set(user.roles ?? []);
    const hasRole = requiredRoles.some((role) => userRoles.has(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Missing required role: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
