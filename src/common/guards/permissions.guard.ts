import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { CurrentUser } from '../types/current-user.type';

type RequestWithUser = {
  user?: CurrentUser;
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
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

    const userPermissions = new Set(user.permissions ?? []);
    const missingPermission = requiredPermissions.find(
      (permission) => !userPermissions.has(permission),
    );

    if (missingPermission) {
      throw new ForbiddenException(
        `Missing required permission: ${missingPermission}`,
      );
    }

    return true;
  }
}
