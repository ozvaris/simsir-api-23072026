import { Injectable } from '@nestjs/common';
import { RbacStatus } from '../enums/rbac-status.enum';
import { AuthorizationSummaryResponse } from '../responses/authorization-summary.response';
import { UserRolesRepository } from '../repositories/user-roles.repository';

type UserIdentity = {
  email?: string;
  userName?: string;
};

@Injectable()
export class RbacQueryService {
  constructor(private readonly userRolesRepository: UserRolesRepository) {}

  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.userRolesRepository.findByUserId(userId);

    return userRoles
      .map((userRole) => userRole.role)
      .filter((role) => role?.status === RbacStatus.ACTIVE)
      .map((role) => role.code);
  }

  async getEffectivePermissions(userId: string): Promise<string[]> {
    const userRoles = await this.userRolesRepository.findByUserId(userId);

    const permissionCodes = new Set<string>();

    for (const userRole of userRoles) {
      if (userRole.role?.status !== RbacStatus.ACTIVE) {
        continue;
      }

      for (const rolePermission of userRole.role.rolePermissions ?? []) {
        const permission = rolePermission.permission;

        if (permission?.status === RbacStatus.ACTIVE) {
          permissionCodes.add(permission.code);
        }
      }
    }

    return [...permissionCodes].sort();
  }

  async getAuthorizationSummary(
    userId: string,
    identity: UserIdentity = {},
  ): Promise<AuthorizationSummaryResponse> {
    const userRoles = await this.userRolesRepository.findByUserId(userId);
    const roles: string[] = [];
    const permissionCodes = new Set<string>();

    for (const userRole of userRoles) {
      const role = userRole.role;

      if (!role || role.status !== RbacStatus.ACTIVE) {
        continue;
      }

      roles.push(role.code);

      for (const rolePermission of role.rolePermissions ?? []) {
        const permission = rolePermission.permission;

        if (permission?.status === RbacStatus.ACTIVE) {
          permissionCodes.add(permission.code);
        }
      }
    }

    roles.sort();

    return new AuthorizationSummaryResponse({
      userId,
      email: identity.email,
      userName: identity.userName,
      roles,
      permissions: [...permissionCodes].sort(),
      isAdmin: roles.includes('SUPER_ADMIN'),
    });
  }
}
