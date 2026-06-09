import { Column, Entity, Index, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { RbacStatus } from '../enums/rbac-status.enum';
import { RolePermission } from './role-permission.entity';

@Entity('permissions')
export class Permission extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120 })
  code!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  resource!: string;

  @Index()
  @Column({ type: 'varchar', length: 60 })
  action!: string;

  @Column({ type: 'boolean', default: false })
  isSystem!: boolean;

  @Column({ type: 'varchar', length: 20, default: RbacStatus.ACTIVE })
  status!: RbacStatus;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions!: RolePermission[];
}
