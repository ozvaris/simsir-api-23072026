import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { Order } from './order.entity';

@Entity('order_payment_snapshots')
export class OrderPaymentSnapshot extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'uuid' })
  orderId!: string;

  @Column({ type: 'uuid', nullable: true })
  paymentMethodId!: string | null;

  @Column({ type: 'varchar', length: 80 })
  paymentMethodCodeSnapshot!: string;

  @Column({ type: 'varchar', length: 160 })
  paymentMethodNameSnapshot!: string;

  @Column({ type: 'uuid', nullable: true })
  paymentProviderId!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  paymentProviderCodeSnapshot!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  paymentProviderNameSnapshot!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  paymentProviderTypeSnapshot!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  providerConfigSnapshot!: Record<string, unknown> | null;

  @OneToOne(() => Order, (order) => order.paymentSnapshot, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order!: Order;
}
