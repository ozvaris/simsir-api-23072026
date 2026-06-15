import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { OrderStatusType } from '../enums/order-status-type.enum';
import { Order } from './order.entity';

@Entity('order_status_history')
export class OrderStatusHistory extends AppBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  orderId!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: OrderStatusType,
  })
  statusType!: OrderStatusType;

  @Column({ type: 'varchar', length: 80, nullable: true })
  fromValue!: string | null;

  @Column({ type: 'varchar', length: 80 })
  toValue!: string;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @ManyToOne(() => Order, (order) => order.statusHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order!: Order;
}
