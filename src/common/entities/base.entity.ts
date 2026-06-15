// src/common/entities/base.entity.ts

import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  createdById!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  createdByName!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'uuid', nullable: true })
  updatedById!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  updatedByName!: string | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
