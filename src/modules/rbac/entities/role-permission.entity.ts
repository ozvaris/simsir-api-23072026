import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity('role_permissions')
@Index(['roleId', 'permissionId'], { unique: true })
export class RolePermission extends AppBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  roleId!: string;

  @Index()
  @Column({ type: 'uuid' })
  permissionId!: string;

  @Column({ type: 'timestamptz' })
  assignedAt!: Date;

  @Column({ type: 'uuid', nullable: true })
  assignedBy!: string | null;

  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role!: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permissionId' })
  permission!: Permission;
}
