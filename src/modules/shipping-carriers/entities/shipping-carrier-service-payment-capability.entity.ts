import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { PaymentMethodCode } from '../../../common/enums/payment-method-code.enum';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { ShippingCarrierService } from './shipping-carrier-service.entity';

@Entity('shipping_carrier_service_payment_capabilities')
@Index(['shippingCarrierServiceId', 'paymentMethod'], { unique: true })
export class ShippingCarrierServicePaymentCapability extends AppBaseEntity {
  @Column({ type: 'uuid' })
  shippingCarrierServiceId!: string;

  @ManyToOne(
    () => ShippingCarrierService,
    (shippingCarrierService) => shippingCarrierService.paymentCapabilities,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'shippingCarrierServiceId' })
  shippingCarrierService!: ShippingCarrierService;

  @Column({ type: 'varchar', length: 40 })
  paymentMethod!: PaymentMethodCode;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  fee!: string;

  @Column({ type: 'varchar', length: 3, default: 'TRY' })
  currency!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  minOrderAmount!: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  maxOrderAmount!: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    default: RecordStatus.ACTIVE,
  })
  status!: RecordStatus;
}
