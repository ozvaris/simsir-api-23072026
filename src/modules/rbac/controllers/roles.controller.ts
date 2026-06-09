import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import type { CurrentUser as CurrentUserType } from '../../../common/types/current-user.type';
import { AssignPermissionsToRoleDto } from '../dto/assign-permissions-to-role.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { ListRolesQueryDto } from '../dto/list-roles-query.dto';
import { ReplaceRolePermissionsDto } from '../dto/replace-role-permissions.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleService } from '../services/role.service';

@Controller('admin/rbac/roles')
export class RolesController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @Permissions('rbac.role.read')
  listRoles(@Query() query: ListRolesQueryDto) {
    return this.roleService.listRoles(query);
  }

  @Get(':roleId')
  @Permissions('rbac.role.read')
  getRole(@Param('roleId') roleId: string) {
    return this.roleService.getRole(roleId);
  }

  @Post()
  @Permissions('rbac.role.create')
  createRole(@Body() dto: CreateRoleDto) {
    return this.roleService.createRole(dto);
  }

  @Patch(':roleId')
  @Permissions('rbac.role.update')
  updateRole(@Param('roleId') roleId: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.updateRole(roleId, dto);
  }

  @Delete(':roleId')
  @Permissions('rbac.role.delete')
  deleteRole(@Param('roleId') roleId: string) {
    return this.roleService.deleteRole(roleId);
  }

  @Post(':roleId/permissions')
  @Permissions('rbac.role.assign_permission')
  assignPermissions(
    @Param('roleId') roleId: string,
    @Body() dto: AssignPermissionsToRoleDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.roleService.assignPermissions(roleId, dto, user.userId);
  }

  @Put(':roleId/permissions')
  @Permissions('rbac.role.replace_permissions')
  replacePermissions(
    @Param('roleId') roleId: string,
    @Body() dto: ReplaceRolePermissionsDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.roleService.replacePermissions(roleId, dto, user.userId);
  }

  @Delete(':roleId/permissions/:permissionId')
  @Permissions('rbac.role.remove_permission')
  removePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.roleService.removePermission(roleId, permissionId);
  }
}
