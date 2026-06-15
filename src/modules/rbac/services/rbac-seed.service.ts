import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { Role } from '../entities/role.entity';
import { RbacStatus } from '../enums/rbac-status.enum';
import {
  RBAC_SEED_PERMISSIONS,
  RBAC_SEED_ROLES,
  RBAC_SEED_ROLE_PERMISSIONS,
} from '../seed/rbac-seed.data';
import { DemoUsersSeedService } from '../seed/demo-users-seed.service';

@Injectable()
export class RbacSeedService implements OnModuleInit {
  private readonly logger = new Logger(RbacSeedService.name);

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,

    private readonly demoUsersSeedService: DemoUsersSeedService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'system')) {
      this.logger.log('Skipping RBAC system seed.');
    } else {
      await this.seedPermissions();
      await this.seedRoles();
      await this.seedRolePermissions();
    }

    await this.demoUsersSeedService.seedDemoUsers();
  }

  private async seedPermissions(): Promise<void> {
    for (const permissionSeed of RBAC_SEED_PERMISSIONS) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { code: permissionSeed.code },
      });

      if (existingPermission) {
        continue;
      }

      await this.permissionRepository.save(
        this.permissionRepository.create({
          ...permissionSeed,
          isSystem: true,
          status: RbacStatus.ACTIVE,
        }),
      );
    }
  }

  private async seedRoles(): Promise<void> {
    for (const roleSeed of RBAC_SEED_ROLES) {
      const existingRole = await this.roleRepository.findOne({
        where: { code: roleSeed.code },
      });

      if (existingRole) {
        continue;
      }

      await this.roleRepository.save(
        this.roleRepository.create({
          ...roleSeed,
          isSystem: true,
          status: RbacStatus.ACTIVE,
        }),
      );
    }
  }

  private async seedRolePermissions(): Promise<void> {
    const roles = await this.roleRepository.find();
    const permissions = await this.permissionRepository.find();
    const roleByCode = new Map(roles.map((role) => [role.code, role]));
    const permissionByCode = new Map(
      permissions.map((permission) => [permission.code, permission]),
    );

    for (const [roleCode, permissionCodes] of Object.entries(
      RBAC_SEED_ROLE_PERMISSIONS,
    )) {
      const role = roleByCode.get(roleCode);

      if (!role) {
        continue;
      }

      for (const permissionCode of permissionCodes) {
        const permission = permissionByCode.get(permissionCode);

        if (!permission) {
          continue;
        }

        const existingRolePermission =
          await this.rolePermissionRepository.findOne({
            where: {
              roleId: role.id,
              permissionId: permission.id,
            },
          });

        if (existingRolePermission) {
          continue;
        }

        await this.rolePermissionRepository.save(
          this.rolePermissionRepository.create({
            roleId: role.id,
            permissionId: permission.id,
            assignedAt: new Date(),
            assignedBy: null,
          }),
        );
      }
    }
  }
}
