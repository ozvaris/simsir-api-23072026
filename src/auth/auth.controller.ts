// src/auth/auth.controller.ts

import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { CurrentUser as CurrentUserType } from '../common/types/current-user.type';
import { RbacQueryService } from '../modules/rbac/services/rbac-query.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rbacQueryService: RbacQueryService,
  ) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Get('me')
  me(@CurrentUser() user: CurrentUserType) {
    return this.authService.getCurrentUser(user);
  }

  @Get('me/access')
  getMyAccess(@CurrentUser() user: CurrentUserType) {
    return this.rbacQueryService.getAuthorizationSummary(user.userId, {
      email: user.email,
      userName: user.userName,
    });
  }

  @Get('me/access-summary')
  getMyAccessSummary(@CurrentUser() user: CurrentUserType) {
    return this.rbacQueryService.getAuthorizationSummary(user.userId, {
      email: user.email,
      userName: user.userName,
    });
  }

  @Post('logout')
  logout() {
    return this.authService.logout();
  }
}
