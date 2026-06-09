// src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { RbacQueryService } from '../modules/rbac/services/rbac-query.service';
import { User } from '../modules/users/entities/user.entity';

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly rbacQueryService: RbacQueryService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const authorizationSummary =
      await this.rbacQueryService.getAuthorizationSummary(user.id, {
        email: user.email,
        userName: user.userName,
      });

    return {
      userId: user.id,
      email: user.email,
      userName: user.userName,
      name: user.name,
      surname: user.surname,
      roles: authorizationSummary.roles,
      permissions: authorizationSummary.permissions,
      isAdmin: authorizationSummary.isAdmin,
    };
  }
}
