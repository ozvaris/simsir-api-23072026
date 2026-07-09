import { Column, Entity, Index } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { SystemSettingValueType } from '../enums/system-setting-value-type.enum';

@Entity('system_settings')
export class SystemSetting extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 160 })
  key!: string;

  @Column({ type: 'text' })
  value!: string;

  @Column({ type: 'varchar', length: 20 })
  valueType!: SystemSettingValueType;

  @Index()
  @Column({ type: 'varchar', length: 80, nullable: true })
  groupKey!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Column({ type: 'boolean', default: false })
  isPublic!: boolean;

  @Column({ type: 'boolean', default: false })
  isSystem!: boolean;

  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    default: RecordStatus.ACTIVE,
  })
  status!: RecordStatus;
}
