import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { ListPermissionsQueryDto } from '../dto/list-permissions-query.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { RbacStatus } from '../enums/rbac-status.enum';
import { ListResponse } from '../responses/list-response';
import { OperationResultResponse } from '../responses/operation-result.response';
import { PaginationResponse } from '../responses/pagination.response';
import { PermissionResponse } from '../responses/permission.response';
import { PermissionsRepository } from '../repositories/permissions.repository';
import { RbacMapper } from './rbac.mapper';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async listPermissions(
    query: ListPermissionsQueryDto,
  ): Promise<ListResponse<PermissionResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [permissions, totalItems] =
      await this.permissionsRepository.list(query);

    return new ListResponse({
      items: permissions.map((permission) =>
        RbacMapper.toPermissionResponse(permission),
      ),
      pagination: new PaginationResponse({
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      }),
    });
  }

  async getPermission(permissionId: string): Promise<PermissionResponse> {
    const permission = await this.permissionsRepository.findById(permissionId);

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return RbacMapper.toPermissionResponse(permission);
  }

  async createPermission(
    dto: CreatePermissionDto,
  ): Promise<PermissionResponse> {
    const code = this.normalizeCode(dto.code);
    const existingPermission =
      await this.permissionsRepository.findByCode(code);

    if (existingPermission) {
      throw new ConflictException('Permission code already exists');
    }

    const permission = this.permissionsRepository.create({
      code,
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      resource: dto.resource.trim(),
      action: dto.action.trim(),
      status: dto.status ?? RbacStatus.ACTIVE,
      isSystem: false,
    });

    const savedPermission = await this.permissionsRepository.save(permission);

    return RbacMapper.toPermissionResponse(savedPermission);
  }

  async updatePermission(
    permissionId: string,
    dto: UpdatePermissionDto,
  ): Promise<PermissionResponse> {
    const permission = await this.permissionsRepository.findById(permissionId);

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (dto.name !== undefined) {
      permission.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      permission.description = dto.description?.trim() || null;
    }

    if (dto.resource !== undefined) {
      permission.resource = dto.resource.trim();
    }

    if (dto.action !== undefined) {
      permission.action = dto.action.trim();
    }

    if (dto.status !== undefined) {
      permission.status = dto.status;
    }

    const savedPermission = await this.permissionsRepository.save(permission);

    return RbacMapper.toPermissionResponse(savedPermission);
  }

  async deletePermission(
    permissionId: string,
  ): Promise<OperationResultResponse> {
    const permission = await this.permissionsRepository.findById(permissionId);

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (permission.isSystem) {
      throw new BadRequestException('System permission cannot be deleted');
    }

    const assignedRoleCount =
      await this.permissionsRepository.countAssignedRoles(permissionId);

    if (assignedRoleCount > 0) {
      throw new BadRequestException(
        'Permission assigned to roles cannot be deleted',
      );
    }

    await this.permissionsRepository.remove(permission);

    return new OperationResultResponse({ success: true });
  }

  private normalizeCode(code: string): string {
    return code.trim().toLowerCase();
  }
}
