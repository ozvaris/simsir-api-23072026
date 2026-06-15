import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { ShippingOption } from '../enums/shipping-option.enum';
import { Order } from './order.entity';

@Entity('order_shipment_snapshots')
export class OrderShipmentSnapshot extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'uuid' })
  orderId!: string;

  @Column({
    type: 'enum',
    enum: ShippingOption,
    nullable: true,
  })
  shippingOption!: ShippingOption | null;

  @Column({ type: 'uuid', nullable: true })
  shippingCarrierId!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  shippingCarrierCodeSnapshot!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  shippingCarrierNameSnapshot!: string | null;

  @Column({ type: 'uuid', nullable: true })
  shippingCarrierServiceId!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  shippingCarrierServiceCodeSnapshot!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  shippingCarrierServiceNameSnapshot!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  estimatedDeliveryText!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  trackingNumber!: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  shipmentPrice!: string;

  @Column({ type: 'varchar', length: 3, default: 'TRY' })
  currency!: string;

  @OneToOne(() => Order, (order) => order.shipmentSnapshot, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order!: Order;
}
