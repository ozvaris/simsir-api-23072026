import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { ShippingCarrierServicePaymentCapability } from './shipping-carrier-service-payment-capability.entity';
import { ShippingCarrier } from './shipping-carrier.entity';

@Entity('shipping_carrier_services')
@Index(['shippingCarrierId', 'code'], { unique: true })
export class ShippingCarrierService extends AppBaseEntity {
  @Column({ type: 'uuid' })
  shippingCarrierId!: string;

  @ManyToOne(() => ShippingCarrier, (carrier) => carrier.services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shippingCarrierId' })
  shippingCarrier!: ShippingCarrier;

  @Column({ type: 'varchar', length: 80 })
  code!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price!: string;

  @Column({ type: 'varchar', length: 3, default: 'TRY' })
  currency!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  estimatedDeliveryText!: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    default: RecordStatus.ACTIVE,
  })
  status!: RecordStatus;

  @OneToMany(
    () => ShippingCarrierServicePaymentCapability,
    (paymentCapability) => paymentCapability.shippingCarrierService,
  )
  paymentCapabilities!: ShippingCarrierServicePaymentCapability[];
}
