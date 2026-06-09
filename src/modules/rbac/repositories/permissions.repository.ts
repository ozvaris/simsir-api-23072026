import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ListPermissionsQueryDto } from '../dto/list-permissions-query.dto';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionsRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  findById(permissionId: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { id: permissionId },
    });
  }

  findByCode(code: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { code },
    });
  }

  findAnotherByCode(
    permissionId: string,
    code: string,
  ): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: {
        id: Not(permissionId),
        code,
      },
    });
  }

  findByCodes(codes: string[]): Promise<Permission[]> {
    if (codes.length === 0) {
      return Promise.resolve([]);
    }

    return this.permissionRepository
      .createQueryBuilder('permission')
      .where('permission.code IN (:...codes)', { codes })
      .getMany();
  }

  async list(query: ListPermissionsQueryDto): Promise<[Permission[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const builder = this.permissionRepository
      .createQueryBuilder('permission')
      .orderBy('permission.resource', 'ASC')
      .addOrderBy('permission.action', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      builder.andWhere('permission.status = :status', {
        status: query.status,
      });
    }

    if (query.resource?.trim()) {
      builder.andWhere('permission.resource = :resource', {
        resource: query.resource.trim(),
      });
    }

    if (query.action?.trim()) {
      builder.andWhere('permission.action = :action', {
        action: query.action.trim(),
      });
    }

    if (query.search?.trim()) {
      builder.andWhere(
        '(permission.code ILIKE :search OR permission.name ILIKE :search OR permission.description ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    return builder.getManyAndCount();
  }

  countAssignedRoles(permissionId: string): Promise<number> {
    return this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoin('permission.rolePermissions', 'rolePermission')
      .where('permission.id = :permissionId', { permissionId })
      .select('COUNT(rolePermission.id)', 'count')
      .getRawOne<{ count: string }>()
      .then((row) => Number(row?.count ?? 0));
  }

  create(data: Partial<Permission>): Permission {
    return this.permissionRepository.create(data);
  }

  save(permission: Permission): Promise<Permission> {
    return this.permissionRepository.save(permission);
  }

  async remove(permission: Permission): Promise<void> {
    await this.permissionRepository.remove(permission);
  }
}
