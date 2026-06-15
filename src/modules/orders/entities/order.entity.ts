import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';
import { PaymentProvider } from '../../payment-methods/entities/payment-provider.entity';
import { ShippingCarrier } from '../../shipping-carriers/entities/shipping-carrier.entity';
import { ShippingCarrierService } from '../../shipping-carriers/entities/shipping-carrier-service.entity';
import { User } from '../../users/entities/user.entity';
import { FulfillmentStatus } from '../enums/fulfillment-status.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { OrderAddress } from './order-address.entity';
import { OrderItem } from './order-item.entity';
import { OrderPaymentSnapshot } from './order-payment-snapshot.entity';
import { OrderShipmentSnapshot } from './order-shipment-snapshot.entity';
import { OrderStatusHistory } from './order-status-history.entity';

@Entity('orders')
export class Order extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  orderNumber!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus!: OrderStatus;

  @Index()
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus!: PaymentStatus;

  @Index()
  @Column({
    type: 'enum',
    enum: FulfillmentStatus,
    default: FulfillmentStatus.PENDING,
  })
  fulfillmentStatus!: FulfillmentStatus;

  @Column({ type: 'varchar', length: 3, default: 'TRY' })
  currency!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discountTotal!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  shippingFee!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  grandTotal!: string;

  @Column({ type: 'uuid', nullable: true })
  paymentMethodId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  paymentProviderId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  shippingCarrierId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  shippingCarrierServiceId!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => PaymentMethod, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod!: PaymentMethod | null;

  @ManyToOne(() => PaymentProvider, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'paymentProviderId' })
  paymentProvider!: PaymentProvider | null;

  @ManyToOne(() => ShippingCarrier, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'shippingCarrierId' })
  shippingCarrier!: ShippingCarrier | null;

  @ManyToOne(() => ShippingCarrierService, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'shippingCarrierServiceId' })
  shippingCarrierService!: ShippingCarrierService | null;

  @OneToMany(() => OrderItem, (item) => item.order)
  items!: OrderItem[];

  @OneToMany(() => OrderAddress, (address) => address.order)
  addresses!: OrderAddress[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order)
  statusHistory!: OrderStatusHistory[];

  @OneToOne(() => OrderPaymentSnapshot, (snapshot) => snapshot.order)
  paymentSnapshot!: OrderPaymentSnapshot | null;

  @OneToOne(() => OrderShipmentSnapshot, (snapshot) => snapshot.order)
  shipmentSnapshot!: OrderShipmentSnapshot | null;
}
