import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { PermissionsController } from './controllers/permissions.controller';
import { RolesController } from './controllers/roles.controller';
import { UserRolesController } from './controllers/user-roles.controller';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { PermissionsRepository } from './repositories/permissions.repository';
import { RolePermissionsRepository } from './repositories/role-permissions.repository';
import { RolesRepository } from './repositories/roles.repository';
import { UserRolesRepository } from './repositories/user-roles.repository';
import { PermissionService } from './services/permission.service';
import { RbacQueryService } from './services/rbac-query.service';
import { RbacSeedService } from './services/rbac-seed.service';
import { RoleService } from './services/role.service';
import { UserRoleService } from './services/user-role.service';
import { UserCredential } from '../users/entities/user-credential.entity';
import { DemoUsersSeedService } from './seed/demo-users-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      UserRole,
      RolePermission,
      UserCredential,
    ]),
  ],
  controllers: [RolesController, PermissionsController, UserRolesController],
  providers: [
    RolesRepository,
    PermissionsRepository,
    RolePermissionsRepository,
    UserRolesRepository,
    RoleService,
    PermissionService,
    UserRoleService,
    RbacQueryService,
    RbacSeedService,
    DemoUsersSeedService,
  ],
  exports: [
    TypeOrmModule,
    RbacQueryService,
    UserRolesRepository,
    RolesRepository,
    PermissionsRepository,
  ],
})
export class RbacModule {}
