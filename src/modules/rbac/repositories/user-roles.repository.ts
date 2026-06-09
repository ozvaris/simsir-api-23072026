import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../entities/user-role.entity';

@Injectable()
export class UserRolesRepository {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  findByUserId(userId: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { userId },
      relations: {
        role: {
          rolePermissions: {
            permission: true,
          },
        },
      },
      order: {
        role: {
          code: 'ASC',
        },
      },
    });
  }

  findByUserAndRole(userId: string, roleId: string): Promise<UserRole | null> {
    return this.userRoleRepository.findOne({
      where: {
        userId,
        roleId,
      },
    });
  }

  create(data: Partial<UserRole>): UserRole {
    return this.userRoleRepository.create(data);
  }

  saveMany(userRoles: UserRole[]): Promise<UserRole[]> {
    return this.userRoleRepository.save(userRoles);
  }

  async remove(userRole: UserRole): Promise<void> {
    await this.userRoleRepository.remove(userRole);
  }

  async removeByUserId(userId: string): Promise<void> {
    await this.userRoleRepository.delete({ userId });
  }
}
