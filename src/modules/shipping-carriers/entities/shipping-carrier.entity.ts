// src/modules/shipping-carriers/entities/shipping-carrier.entity.ts

import { Column, Entity, Index, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { ShippingCarrierService } from './shipping-carrier-service.entity';

@Entity('shipping_carriers')
export class ShippingCarrier extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80 })
  code!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl!: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    default: RecordStatus.ACTIVE,
  })
  status!: RecordStatus;

  @OneToMany(() => ShippingCarrierService, (service) => service.shippingCarrier)
  services!: ShippingCarrierService[];
}
