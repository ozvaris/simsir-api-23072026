import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ListRolesQueryDto } from '../dto/list-roles-query.dto';
import { Role } from '../entities/role.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  findById(roleId: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id: roleId },
    });
  }

  findByIdWithPermissions(roleId: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id: roleId },
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
      order: {
        rolePermissions: {
          permission: {
            code: 'ASC',
          },
        },
      },
    });
  }

  findByCode(code: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { code },
    });
  }

  findAnotherByCode(roleId: string, code: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: {
        id: Not(roleId),
        code,
      },
    });
  }

  findByCodes(codes: string[]): Promise<Role[]> {
    if (codes.length === 0) {
      return Promise.resolve([]);
    }

    return this.roleRepository
      .createQueryBuilder('role')
      .where('role.code IN (:...codes)', { codes })
      .getMany();
  }

  async list(query: ListRolesQueryDto): Promise<[Role[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const builder = this.roleRepository
      .createQueryBuilder('role')
      .orderBy('role.code', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      builder.andWhere('role.status = :status', { status: query.status });
    }

    if (query.isSystem !== undefined) {
      builder.andWhere('role.isSystem = :isSystem', {
        isSystem: query.isSystem,
      });
    }

    if (query.search?.trim()) {
      builder.andWhere(
        '(role.code ILIKE :search OR role.name ILIKE :search OR role.description ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    return builder.getManyAndCount();
  }

  countAssignedUsers(roleId: string): Promise<number> {
    return this.roleRepository
      .createQueryBuilder('role')
      .leftJoin('role.userRoles', 'userRole')
      .where('role.id = :roleId', { roleId })
      .select('COUNT(userRole.id)', 'count')
      .getRawOne<{ count: string }>()
      .then((row) => Number(row?.count ?? 0));
  }

  create(data: Partial<Role>): Role {
    return this.roleRepository.create(data);
  }

  save(role: Role): Promise<Role> {
    return this.roleRepository.save(role);
  }

  async remove(role: Role): Promise<void> {
    await this.roleRepository.remove(role);
  }
}
