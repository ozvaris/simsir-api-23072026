import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { PermissionResponse } from '../responses/permission.response';
import { RoleDetailResponse } from '../responses/role-detail.response';
import { RoleResponse } from '../responses/role.response';

export class RbacMapper {
  static toRoleResponse(role: Role): RoleResponse {
    return new RoleResponse({
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      status: role.status,
    });
  }

  static toRoleDetailResponse(
    role: Role,
    assignedUserCount: number,
  ): RoleDetailResponse {
    const permissions =
      role.rolePermissions
        ?.map((rolePermission) => rolePermission.permission)
        .filter(Boolean)
        .map((permission) => this.toPermissionResponse(permission)) ?? [];

    return new RoleDetailResponse({
      ...this.toRoleResponse(role),
      permissions,
      assignedUserCount,
    });
  }

  static toPermissionResponse(permission: Permission): PermissionResponse {
    return new PermissionResponse({
      id: permission.id,
      code: permission.code,
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
      isSystem: permission.isSystem,
      status: permission.status,
    });
  }
}
