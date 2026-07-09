// src/modules/users/users.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';

type UserProfileResponse = {
  id: string;
  email: string;
  userName: string;
  name: string;
  surname: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.usersRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toProfileResponse(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfileResponse> {
    const user = await this.usersRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.userName && dto.userName !== user.userName) {
      const existingUser = await this.usersRepository.findAnotherUserByUserName(
        userId,
        dto.userName.trim(),
      );

      if (existingUser) {
        throw new ConflictException('Username is already in use');
      }

      user.userName = dto.userName.trim();
    }

    if (dto.email) {
      const nextEmail = dto.email.trim().toLowerCase();

      if (nextEmail !== user.email) {
        const existingUser = await this.usersRepository.findAnotherUserByEmail(
          userId,
          nextEmail,
        );

        if (existingUser) {
          throw new ConflictException('Email is already in use');
        }

        user.email = nextEmail;
      }
    }

    if (dto.name !== undefined) {
      user.name = dto.name.trim();
    }

    if (dto.surname !== undefined) {
      user.surname = dto.surname.trim();
    }

    if (dto.phone !== undefined) {
      user.phone = dto.phone.trim();
    }

    const savedUser = await this.usersRepository.saveUser(user);

    return this.toProfileResponse(savedUser);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ success: true }> {
    const credential =
      await this.usersRepository.findCredentialByUserId(userId);

    if (!credential) {
      throw new NotFoundException('Credential not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      credential.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is invalid');
    }

    credential.passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.usersRepository.saveCredential(credential);

    return { success: true };
  }

  private toProfileResponse(user: User): UserProfileResponse {
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      name: user.name,
      surname: user.surname,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
