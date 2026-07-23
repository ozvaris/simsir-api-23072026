import { Body, Controller, Param, Patch } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import type { CurrentUser as CurrentUserType } from '../../common/types/current-user.type';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { AdminResetPasswordByEmailDto } from './dto/admin-reset-password-by-email.dto';
import { UsersService } from './users.service';

@Controller('admin/users')
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':userId/password')
  @Permissions('user.update')
  resetPassword(
    @Param('userId') userId: string,
    @Body() dto: AdminResetPasswordDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.usersService.adminResetPassword(userId, dto, user);
  }

  @Patch('password/by-email')
  @Permissions('user.update')
  resetPasswordByEmail(
    @Body() dto: AdminResetPasswordByEmailDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.usersService.adminResetPasswordByEmail(dto, user);
  }
}
