// src/modules/users/entities/user-credential.entity.ts

import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

@Entity('user_credentials')
export class UserCredential extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'uuid' })
  userId!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @OneToOne(() => User, (user) => user.credential, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
