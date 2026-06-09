import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from '../entities/role-permission.entity';

@Injectable()
export class RolePermissionsRepository {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  findByRoleId(roleId: string): Promise<RolePermission[]> {
    return this.rolePermissionRepository.find({
      where: { roleId },
      relations: {
        permission: true,
      },
      order: {
        permission: {
          code: 'ASC',
        },
      },
    });
  }

  findByRoleAndPermission(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission | null> {
    return this.rolePermissionRepository.findOne({
      where: {
        roleId,
        permissionId,
      },
    });
  }

  create(data: Partial<RolePermission>): RolePermission {
    return this.rolePermissionRepository.create(data);
  }

  saveMany(rolePermissions: RolePermission[]): Promise<RolePermission[]> {
    return this.rolePermissionRepository.save(rolePermissions);
  }

  async remove(rolePermission: RolePermission): Promise<void> {
    await this.rolePermissionRepository.remove(rolePermission);
  }

  async removeByRoleId(roleId: string): Promise<void> {
    await this.rolePermissionRepository.delete({ roleId });
  }
}
