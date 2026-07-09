// src/modules/rbac/seed/demo-users-seed.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { UserCredential } from '../../users/entities/user-credential.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';

export const DEMO_USER_SEEDS = [
  {
    roleCode: 'CATALOG_MANAGER',
    email: 'catalog.manager@example.com',
    userName: 'catalog.manager',
    name: 'Catalog',
    surname: 'Manager',
    phone: '+12025550111',
  },
  {
    roleCode: 'ORDER_MANAGER',
    email: 'order.manager@example.com',
    userName: 'order.manager',
    name: 'Order',
    surname: 'Manager',
    phone: '+12025550112',
  },
  {
    roleCode: 'SUPPORT_STAFF',
    email: 'support.staff@example.com',
    userName: 'support.staff',
    name: 'Support',
    surname: 'Staff',
    phone: '+12025550113',
  },
  {
    roleCode: 'CUSTOMER',
    email: 'customer@example.com',
    userName: 'customer',
    name: 'Demo',
    surname: 'Customer',
    phone: '+12025550114',
  },
] as const;

@Injectable()
export class DemoUsersSeedService {
  private readonly logger = new Logger(DemoUsersSeedService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserCredential)
    private readonly credentialRepository: Repository<UserCredential>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async seedDemoUsers(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'demo')) {
      this.logger.log('Skipping demo user seed.');
      return;
    }

    const password = this.configService.get<string>(
      'SEED_DEFAULT_USER_PASSWORD',
    );

    if (!password) {
      this.logger.warn(
        'Skipping demo user seed because SEED_DEFAULT_USER_PASSWORD is not set.',
      );
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    for (const seed of DEMO_USER_SEEDS) {
      const role = await this.roleRepository.findOne({
        where: { code: seed.roleCode },
      });

      if (!role) {
        this.logger.warn(
          `Skipping demo user ${seed.email}; role ${seed.roleCode} was not found.`,
        );
        continue;
      }

      const user = await this.findOrCreateUser(seed, passwordHash);

      if (!user) {
        continue;
      }

      await this.ensureRoleAssignment(user.id, role.id, seed.roleCode);
    }
  }

  private async findOrCreateUser(
    seed: (typeof DEMO_USER_SEEDS)[number],
    passwordHash: string,
  ): Promise<User | null> {
    const existingUsers = await this.userRepository.find({
      where: [{ email: seed.email }, { userName: seed.userName }],
    });

    if (existingUsers.length > 1) {
      this.logger.warn(
        `Skipping demo user ${seed.email}; email and username match different users.`,
      );
      return null;
    }

    const existingUser = existingUsers[0];

    if (existingUser) {
      existingUser.phone = seed.phone;
      await this.userRepository.save(existingUser);
      await this.ensureCredential(existingUser, passwordHash);
      return existingUser;
    }

    return this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        email: seed.email,
        userName: seed.userName,
        name: seed.name,
        surname: seed.surname,
        phone: seed.phone,
      });

      const savedUser = await manager.save(User, user);

      await manager.save(
        UserCredential,
        manager.create(UserCredential, {
          userId: savedUser.id,
          email: seed.email,
          passwordHash,
        }),
      );

      return savedUser;
    });
  }

  private async ensureCredential(
    user: User,
    passwordHash: string,
  ): Promise<void> {
    const existingCredential = await this.credentialRepository.findOne({
      where: [{ userId: user.id }, { email: user.email }],
    });

    if (existingCredential) {
      return;
    }

    await this.credentialRepository.save(
      this.credentialRepository.create({
        userId: user.id,
        email: user.email,
        passwordHash,
      }),
    );
  }

  private async ensureRoleAssignment(
    userId: string,
    roleId: string,
    roleCode: string,
  ): Promise<void> {
    const existingUserRole = await this.userRoleRepository.findOne({
      where: {
        userId,
        roleId,
      },
    });

    if (existingUserRole) {
      return;
    }

    await this.userRoleRepository.save(
      this.userRoleRepository.create({
        userId,
        roleId,
        assignedAt: new Date(),
        assignedBy: null,
      }),
    );

    this.logger.log(`Assigned ${roleCode} to demo user ${userId}.`);
  }
}
