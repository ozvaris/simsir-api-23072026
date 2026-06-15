// src/cli/bootstrap-super-admin.ts

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { Role } from '../modules/rbac/entities/role.entity';
import { UserRole } from '../modules/rbac/entities/user-role.entity';
import { UserCredential } from '../modules/users/entities/user-credential.entity';
import { User } from '../modules/users/entities/user.entity';

type SuperAdminBootstrapConfig = {
  email: string;
  userName: string;
  password: string;
  name: string;
  surname: string;
  phone: string | null;
};

const logger = new Logger('BootstrapSuperAdmin');

async function bootstrap(): Promise<void> {
  const config = getBootstrapConfig();
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const dataSource = app.get(DataSource);

    await createOrUpdateSuperAdmin(dataSource, config);
  } finally {
    await app.close();
  }
}

function getBootstrapConfig(): SuperAdminBootstrapConfig {
  const email = normalizeEmail(
    process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL ?? 'admin@example.com',
  );
  const userName = (
    process.env.BOOTSTRAP_SUPER_ADMIN_USERNAME ?? 'super.admin'
  ).trim();
  const password = process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD;
  const name = (process.env.BOOTSTRAP_SUPER_ADMIN_NAME ?? 'Super').trim();
  const surname = (
    process.env.BOOTSTRAP_SUPER_ADMIN_SURNAME ?? 'Admin'
  ).trim();
  const phone = process.env.BOOTSTRAP_SUPER_ADMIN_PHONE?.trim() || null;

  if (!email) {
    throw new Error('BOOTSTRAP_SUPER_ADMIN_EMAIL must not be empty.');
  }

  if (!userName) {
    throw new Error('BOOTSTRAP_SUPER_ADMIN_USERNAME must not be empty.');
  }

  if (!password) {
    throw new Error('BOOTSTRAP_SUPER_ADMIN_PASSWORD is required.');
  }

  if (!name) {
    throw new Error('BOOTSTRAP_SUPER_ADMIN_NAME must not be empty.');
  }

  if (!surname) {
    throw new Error('BOOTSTRAP_SUPER_ADMIN_SURNAME must not be empty.');
  }

  return {
    email,
    userName,
    password,
    name,
    surname,
    phone,
  };
}

async function createOrUpdateSuperAdmin(
  dataSource: DataSource,
  config: SuperAdminBootstrapConfig,
): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const credentialRepository = dataSource.getRepository(UserCredential);
  const roleRepository = dataSource.getRepository(Role);
  const userRoleRepository = dataSource.getRepository(UserRole);

  const superAdminRole = await roleRepository.findOne({
    where: { code: 'SUPER_ADMIN' },
  });

  if (!superAdminRole) {
    throw new Error(
      'SUPER_ADMIN role was not found. Run RBAC system seed before bootstrapping the first super admin.',
    );
  }

  const existingUser = await findUserByEmailOrUserName(
    userRepository,
    config.email,
    config.userName,
  );

  const passwordHash = await bcrypt.hash(config.password, 10);

  const user =
    existingUser ??
    (await createSuperAdminUser(dataSource, config, passwordHash));

  if (existingUser) {
    await ensureCredential(credentialRepository, user, passwordHash);
  }

  await ensureSuperAdminRoleAssignment(userRoleRepository, user, superAdminRole);

  logger.log(`Super admin bootstrap completed for ${user.email}.`);
}

async function findUserByEmailOrUserName(
  userRepository: Repository<User>,
  email: string,
  userName: string,
): Promise<User | null> {
  const existingUsers = await userRepository.find({
    where: [{ email }, { userName }],
  });

  if (existingUsers.length > 1) {
    throw new Error(
      'BOOTSTRAP_SUPER_ADMIN_EMAIL and BOOTSTRAP_SUPER_ADMIN_USERNAME match different users.',
    );
  }

  return existingUsers[0] ?? null;
}

async function createSuperAdminUser(
  dataSource: DataSource,
  config: SuperAdminBootstrapConfig,
  passwordHash: string,
): Promise<User> {
  return dataSource.transaction(async (manager) => {
    const user = manager.create(User, {
      email: config.email,
      userName: config.userName,
      name: config.name,
      surname: config.surname,
      phone: config.phone,
    });

    const savedUser = await manager.save(User, user);

    await manager.save(
      UserCredential,
      manager.create(UserCredential, {
        userId: savedUser.id,
        email: config.email,
        passwordHash,
      }),
    );

    logger.log(`Created super admin user ${config.email}.`);

    return savedUser;
  });
}

async function ensureCredential(
  credentialRepository: Repository<UserCredential>,
  user: User,
  passwordHash: string,
): Promise<void> {
  const existingCredential = await credentialRepository.findOne({
    where: [{ userId: user.id }, { email: user.email }],
  });

  if (existingCredential) {
    logger.log(
      `Super admin credential already exists for ${user.email}; password was not overwritten.`,
    );
    return;
  }

  await credentialRepository.save(
    credentialRepository.create({
      userId: user.id,
      email: user.email,
      passwordHash,
    }),
  );

  logger.log(`Created super admin credential for ${user.email}.`);
}

async function ensureSuperAdminRoleAssignment(
  userRoleRepository: Repository<UserRole>,
  user: User,
  role: Role,
): Promise<void> {
  const existingUserRole = await userRoleRepository.findOne({
    where: {
      userId: user.id,
      roleId: role.id,
    },
  });

  if (existingUserRole) {
    logger.log(`SUPER_ADMIN role is already assigned to ${user.email}.`);
    return;
  }

  await userRoleRepository.save(
    userRoleRepository.create({
      userId: user.id,
      roleId: role.id,
      assignedAt: new Date(),
      assignedBy: user.id,
    }),
  );

  logger.log(`Assigned SUPER_ADMIN role to ${user.email}.`);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  logger.error(`Super admin bootstrap failed: ${message}`);
  process.exitCode = 1;
});
