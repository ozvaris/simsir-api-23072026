import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssignRolesToUserDto } from '../dto/assign-roles-to-user.dto';
import { ListUserRolesQueryDto } from '../dto/list-user-roles-query.dto';
import { ReplaceUserRolesDto } from '../dto/replace-user-roles.dto';
import { RbacStatus } from '../enums/rbac-status.enum';
import { AuthorizationSummaryResponse } from '../responses/authorization-summary.response';
import { OperationResultResponse } from '../responses/operation-result.response';
import { UserRoleResponse } from '../responses/user-role.response';
import { UserRolesMutationResponse } from '../responses/user-roles-mutation.response';
import { RolesRepository } from '../repositories/roles.repository';
import { UserRolesRepository } from '../repositories/user-roles.repository';
import { User } from '../../users/entities/user.entity';
import { RbacMapper } from './rbac.mapper';
import { RbacQueryService } from './rbac-query.service';

@Injectable()
export class UserRoleService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly userRolesRepository: UserRolesRepository,
    private readonly rbacQueryService: RbacQueryService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async listUserRoles(
    userId: string,
    query: ListUserRolesQueryDto,
  ): Promise<UserRoleResponse> {
    await this.ensureUserExists(userId);

    const userRoles = await this.userRolesRepository.findByUserId(userId);
    const activeRoles = userRoles
      .map((userRole) => userRole.role)
      .filter((role) => role?.status === RbacStatus.ACTIVE)
      .map((role) => RbacMapper.toRoleResponse(role));

    const response = new UserRoleResponse({
      userId,
      roles: activeRoles,
    });

    if (query.includePermissions) {
      response.permissions =
        await this.rbacQueryService.getEffectivePermissions(userId);
    }

    return response;
  }

  async assignRoles(
    userId: string,
    dto: AssignRolesToUserDto,
    assignedBy: string | null,
  ): Promise<UserRolesMutationResponse> {
    await this.ensureUserExists(userId);

    const roles = await this.resolveRoles(dto.roleCodes);
    const existingUserRoles =
      await this.userRolesRepository.findByUserId(userId);
    const existingRoleIds = new Set(
      existingUserRoles.map((userRole) => userRole.roleId),
    );

    const newUserRoles = roles
      .filter((role) => !existingRoleIds.has(role.id))
      .map((role) =>
        this.userRolesRepository.create({
          userId,
          roleId: role.id,
          assignedAt: new Date(),
          assignedBy,
        }),
      );

    if (newUserRoles.length > 0) {
      await this.userRolesRepository.saveMany(newUserRoles);
    }

    return this.getUserRolesMutationResponse(userId);
  }

  async replaceRoles(
    userId: string,
    dto: ReplaceUserRolesDto,
    assignedBy: string | null,
  ): Promise<UserRolesMutationResponse> {
    await this.ensureUserExists(userId);

    const roles = await this.resolveRoles(dto.roleCodes);
    const userRoles = roles.map((role) =>
      this.userRolesRepository.create({
        userId,
        roleId: role.id,
        assignedAt: new Date(),
        assignedBy,
      }),
    );

    await this.userRolesRepository.removeByUserId(userId);

    if (userRoles.length > 0) {
      await this.userRolesRepository.saveMany(userRoles);
    }

    return this.getUserRolesMutationResponse(userId);
  }

  async removeRole(
    userId: string,
    roleId: string,
  ): Promise<OperationResultResponse> {
    const userRole = await this.userRolesRepository.findByUserAndRole(
      userId,
      roleId,
    );

    if (!userRole) {
      throw new NotFoundException('User role assignment not found');
    }

    await this.userRolesRepository.remove(userRole);

    return new OperationResultResponse({ success: true });
  }

  getAuthorizationSummary(
    userId: string,
  ): Promise<AuthorizationSummaryResponse> {
    return this.rbacQueryService.getAuthorizationSummary(userId);
  }

  private async getUserRolesMutationResponse(
    userId: string,
  ): Promise<UserRolesMutationResponse> {
    const userRoles = await this.userRolesRepository.findByUserId(userId);

    return new UserRolesMutationResponse({
      userId,
      roleCodes: userRoles.map((userRole) => userRole.role.code).sort(),
    });
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private async resolveRoles(roleCodes: string[]) {
    const normalizedCodes = this.uniqueCodes(
      roleCodes.map((code) => code.trim().toUpperCase()),
    );
    const roles = await this.rolesRepository.findByCodes(normalizedCodes);
    const foundCodes = new Set(roles.map((role) => role.code));
    const missingCodes = normalizedCodes.filter(
      (code) => !foundCodes.has(code),
    );

    if (missingCodes.length > 0) {
      throw new NotFoundException(`Role not found: ${missingCodes.join(', ')}`);
    }

    return roles;
  }

  private uniqueCodes(codes: string[]): string[] {
    return [...new Set(codes.filter(Boolean))];
  }
}
