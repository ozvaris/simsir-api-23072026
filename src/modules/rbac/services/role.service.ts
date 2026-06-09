import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssignPermissionsToRoleDto } from '../dto/assign-permissions-to-role.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { ListRolesQueryDto } from '../dto/list-roles-query.dto';
import { ReplaceRolePermissionsDto } from '../dto/replace-role-permissions.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RbacStatus } from '../enums/rbac-status.enum';
import { ListResponse } from '../responses/list-response';
import { OperationResultResponse } from '../responses/operation-result.response';
import { PaginationResponse } from '../responses/pagination.response';
import { RoleDetailResponse } from '../responses/role-detail.response';
import { RolePermissionsResponse } from '../responses/role-permissions.response';
import { RoleResponse } from '../responses/role.response';
import { PermissionsRepository } from '../repositories/permissions.repository';
import { RolePermissionsRepository } from '../repositories/role-permissions.repository';
import { RolesRepository } from '../repositories/roles.repository';
import { RbacMapper } from './rbac.mapper';

@Injectable()
export class RoleService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
    private readonly rolePermissionsRepository: RolePermissionsRepository,
  ) {}

  async listRoles(
    query: ListRolesQueryDto,
  ): Promise<ListResponse<RoleResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [roles, totalItems] = await this.rolesRepository.list(query);

    return new ListResponse({
      items: roles.map((role) => RbacMapper.toRoleResponse(role)),
      pagination: new PaginationResponse({
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      }),
    });
  }

  async getRole(roleId: string): Promise<RoleDetailResponse> {
    const role = await this.rolesRepository.findByIdWithPermissions(roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const assignedUserCount =
      await this.rolesRepository.countAssignedUsers(roleId);

    return RbacMapper.toRoleDetailResponse(role, assignedUserCount);
  }

  async createRole(dto: CreateRoleDto): Promise<RoleResponse> {
    const code = this.normalizeCode(dto.code);
    const existingRole = await this.rolesRepository.findByCode(code);

    if (existingRole) {
      throw new ConflictException('Role code already exists');
    }

    const role = this.rolesRepository.create({
      code,
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      status: dto.status ?? RbacStatus.ACTIVE,
      isSystem: false,
    });

    const savedRole = await this.rolesRepository.save(role);

    return RbacMapper.toRoleResponse(savedRole);
  }

  async updateRole(roleId: string, dto: UpdateRoleDto): Promise<RoleResponse> {
    const role = await this.rolesRepository.findById(roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (dto.name !== undefined) {
      role.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      role.description = dto.description?.trim() || null;
    }

    if (dto.status !== undefined) {
      role.status = dto.status;
    }

    const savedRole = await this.rolesRepository.save(role);

    return RbacMapper.toRoleResponse(savedRole);
  }

  async deleteRole(roleId: string): Promise<OperationResultResponse> {
    const role = await this.rolesRepository.findById(roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('System role cannot be deleted');
    }

    const assignedUserCount =
      await this.rolesRepository.countAssignedUsers(roleId);

    if (assignedUserCount > 0) {
      throw new BadRequestException('Role assigned to users cannot be deleted');
    }

    await this.rolesRepository.remove(role);

    return new OperationResultResponse({ success: true });
  }

  async assignPermissions(
    roleId: string,
    dto: AssignPermissionsToRoleDto,
    assignedBy: string | null,
  ): Promise<RolePermissionsResponse> {
    const role = await this.rolesRepository.findById(roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions = await this.resolvePermissions(dto.permissionCodes);
    const existingRolePermissions =
      await this.rolePermissionsRepository.findByRoleId(roleId);
    const existingPermissionIds = new Set(
      existingRolePermissions.map(
        (rolePermission) => rolePermission.permissionId,
      ),
    );

    const newRolePermissions = permissions
      .filter((permission) => !existingPermissionIds.has(permission.id))
      .map((permission) =>
        this.rolePermissionsRepository.create({
          roleId,
          permissionId: permission.id,
          assignedAt: new Date(),
          assignedBy,
        }),
      );

    if (newRolePermissions.length > 0) {
      await this.rolePermissionsRepository.saveMany(newRolePermissions);
    }

    return this.getRolePermissionsResponse(roleId);
  }

  async replacePermissions(
    roleId: string,
    dto: ReplaceRolePermissionsDto,
    assignedBy: string | null,
  ): Promise<RolePermissionsResponse> {
    const role = await this.rolesRepository.findById(roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions = await this.resolvePermissions(dto.permissionCodes);
    const rolePermissions = permissions.map((permission) =>
      this.rolePermissionsRepository.create({
        roleId,
        permissionId: permission.id,
        assignedAt: new Date(),
        assignedBy,
      }),
    );

    await this.rolePermissionsRepository.removeByRoleId(roleId);

    if (rolePermissions.length > 0) {
      await this.rolePermissionsRepository.saveMany(rolePermissions);
    }

    return this.getRolePermissionsResponse(roleId);
  }

  async removePermission(
    roleId: string,
    permissionId: string,
  ): Promise<OperationResultResponse> {
    const rolePermission =
      await this.rolePermissionsRepository.findByRoleAndPermission(
        roleId,
        permissionId,
      );

    if (!rolePermission) {
      throw new NotFoundException('Role permission assignment not found');
    }

    await this.rolePermissionsRepository.remove(rolePermission);

    return new OperationResultResponse({ success: true });
  }

  private async getRolePermissionsResponse(
    roleId: string,
  ): Promise<RolePermissionsResponse> {
    const rolePermissions =
      await this.rolePermissionsRepository.findByRoleId(roleId);

    return new RolePermissionsResponse({
      roleId,
      permissionCodes: rolePermissions
        .map((rolePermission) => rolePermission.permission.code)
        .sort(),
    });
  }

  private async resolvePermissions(permissionCodes: string[]) {
    const normalizedCodes = this.uniqueCodes(
      permissionCodes.map((code) => code.trim().toLowerCase()),
    );
    const permissions =
      await this.permissionsRepository.findByCodes(normalizedCodes);
    const foundCodes = new Set(
      permissions.map((permission) => permission.code),
    );
    const missingCodes = normalizedCodes.filter(
      (code) => !foundCodes.has(code),
    );

    if (missingCodes.length > 0) {
      throw new NotFoundException(
        `Permission not found: ${missingCodes.join(', ')}`,
      );
    }

    return permissions;
  }

  private uniqueCodes(codes: string[]): string[] {
    return [...new Set(codes.filter(Boolean))];
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }
}
