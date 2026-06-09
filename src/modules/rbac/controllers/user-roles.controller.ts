import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import type { CurrentUser as CurrentUserType } from '../../../common/types/current-user.type';
import { AssignRolesToUserDto } from '../dto/assign-roles-to-user.dto';
import { ListUserRolesQueryDto } from '../dto/list-user-roles-query.dto';
import { ReplaceUserRolesDto } from '../dto/replace-user-roles.dto';
import { UserRoleService } from '../services/user-role.service';

@Controller('admin/rbac/users')
export class UserRolesController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Get(':userId/roles')
  @Permissions('rbac.user_role.read')
  listUserRoles(
    @Param('userId') userId: string,
    @Query() query: ListUserRolesQueryDto,
  ) {
    return this.userRoleService.listUserRoles(userId, query);
  }

  @Post(':userId/roles')
  @Permissions('rbac.user_role.assign')
  assignRoles(
    @Param('userId') userId: string,
    @Body() dto: AssignRolesToUserDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.userRoleService.assignRoles(userId, dto, user.userId);
  }

  @Put(':userId/roles')
  @Permissions('rbac.user_role.replace')
  replaceRoles(
    @Param('userId') userId: string,
    @Body() dto: ReplaceUserRolesDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.userRoleService.replaceRoles(userId, dto, user.userId);
  }

  @Delete(':userId/roles/:roleId')
  @Permissions('rbac.user_role.remove')
  removeRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.userRoleService.removeRole(userId, roleId);
  }

  @Get(':userId/access-summary')
  @Permissions('rbac.user_access.read')
  getAuthorizationSummary(@Param('userId') userId: string) {
    return this.userRoleService.getAuthorizationSummary(userId);
  }
}
