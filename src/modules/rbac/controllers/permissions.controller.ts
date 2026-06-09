import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { ListPermissionsQueryDto } from '../dto/list-permissions-query.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionService } from '../services/permission.service';

@Controller('admin/rbac/permissions')
export class PermissionsController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @Permissions('rbac.permission.read')
  listPermissions(@Query() query: ListPermissionsQueryDto) {
    return this.permissionService.listPermissions(query);
  }

  @Get(':permissionId')
  @Permissions('rbac.permission.read')
  getPermission(@Param('permissionId') permissionId: string) {
    return this.permissionService.getPermission(permissionId);
  }

  @Post()
  @Permissions('rbac.permission.create')
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.permissionService.createPermission(dto);
  }

  @Patch(':permissionId')
  @Permissions('rbac.permission.update')
  updatePermission(
    @Param('permissionId') permissionId: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.permissionService.updatePermission(permissionId, dto);
  }

  @Delete(':permissionId')
  @Permissions('rbac.permission.delete')
  deletePermission(@Param('permissionId') permissionId: string) {
    return this.permissionService.deletePermission(permissionId);
  }
}
