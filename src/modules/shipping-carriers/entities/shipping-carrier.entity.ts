// src/modules/shipping-carriers/entities/shipping-carrier.entity.ts

import { Column, Entity, Index } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { RecordStatus } from '../../../common/enums/record-status.enum';

@Entity('shipping_carriers')
export class ShippingCarrier extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80 })
  code!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  fee!: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    default: RecordStatus.ACTIVE,
  })
  status!: RecordStatus;
}
