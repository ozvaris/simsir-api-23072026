// src/modules/users/repositories/users.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserCredential } from '../entities/user-credential.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserCredential)
    private readonly credentialRepository: Repository<UserCredential>,
  ) {}

  findUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  findUserByUserName(userName: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { userName },
    });
  }

  findAnotherUserByUserName(
    userId: string,
    userName: string,
  ): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        id: Not(userId),
        userName,
      },
    });
  }

  saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  findCredentialByUserId(userId: string): Promise<UserCredential | null> {
    return this.credentialRepository.findOne({
      where: { userId },
    });
  }

  saveCredential(credential: UserCredential): Promise<UserCredential> {
    return this.credentialRepository.save(credential);
  }
}
