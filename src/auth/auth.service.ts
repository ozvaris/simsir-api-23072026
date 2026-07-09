// src/auth/auth.service.ts

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { UserCredential } from '../modules/users/entities/user-credential.entity';
import { User } from '../modules/users/entities/user.entity';
import { CurrentUser } from '../common/types/current-user.type';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

type JwtPayload = {
  sub: string;
  email: string;
};

type AuthUserResponse = {
  id: string;
  email: string;
  userName: string;
  name: string;
  surname: string;
  phone: string;
};

type AuthTokenResponse = {
  user: AuthUserResponse;
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserCredential)
    private readonly credentialRepository: Repository<UserCredential>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokenResponse> {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    const userName = await this.generateUserName(dto.name, dto.surname);

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.dataSource.transaction(async (manager) => {
      const createdUser = manager.create(User, {
        email,
        userName,
        name: dto.name.trim(),
        surname: dto.surname.trim(),
        phone: dto.phone.trim(),
      });

      const savedUser = await manager.save(User, createdUser);

      const credential = manager.create(UserCredential, {
        userId: savedUser.id,
        email,
        passwordHash,
      });

      await manager.save(UserCredential, credential);

      return savedUser;
    });

    const tokens = await this.signTokens(user);

    return {
      user: this.toAuthUserResponse(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthTokenResponse> {
    const email = dto.email.trim().toLowerCase();

    const credential = await this.credentialRepository.findOne({
      where: { email },
      relations: {
        user: true,
      },
    });

    if (!credential) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      credential.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.signTokens(credential.user);

    return {
      user: this.toAuthUserResponse(credential.user),
      ...tokens,
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthTokenResponse> {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(
        dto.refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.signTokens(user);

    return {
      user: this.toAuthUserResponse(user),
      ...tokens,
    };
  }

  async getCurrentUser(user: CurrentUser): Promise<AuthUserResponse> {
    const foundUser = await this.userRepository.findOne({
      where: { id: user.userId },
    });

    if (!foundUser) {
      throw new UnauthorizedException('User not found');
    }

    return this.toAuthUserResponse(foundUser);
  }

  logout(): { success: true } {
    return { success: true };
  }

  private async signTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: Number(
        this.configService.getOrThrow<string>('JWT_ACCESS_TTL_SECONDS'),
      ),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: Number(
        this.configService.getOrThrow<string>('JWT_REFRESH_TTL_SECONDS'),
      ),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private toAuthUserResponse(user: User): AuthUserResponse {
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      name: user.name,
      surname: user.surname,
      phone: user.phone,
    };
  }

  private async generateUserName(name: string, surname: string): Promise<string> {
    const normalizedBase = this.normalizeUserNamePart(`${name} ${surname}`);
    const base = normalizedBase || 'user';

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const randomSuffix = randomBytes(4).toString('hex');
      const maxBaseLength = 80 - randomSuffix.length - 1;
      const truncatedBase = base.slice(0, Math.max(maxBaseLength, 1));
      const candidate = `${truncatedBase}-${randomSuffix}`;

      const existingUser = await this.userRepository.findOne({
        where: { userName: candidate },
      });

      if (!existingUser) {
        return candidate;
      }
    }

    throw new ConflictException('Email or username already exists');
  }

  private normalizeUserNamePart(value: string): string {
    const normalizedChars: Record<string, string> = {
      'ç': 'c',
      'Ç': 'c',
      'ğ': 'g',
      'Ğ': 'g',
      'ı': 'i',
      'İ': 'i',
      'ö': 'o',
      'Ö': 'o',
      'ş': 's',
      'Ş': 's',
      'ü': 'u',
      'Ü': 'u',
    };

    return value
      .trim()
      .replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => normalizedChars[char] ?? char)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
