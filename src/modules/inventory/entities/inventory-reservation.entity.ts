import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Order } from '../../orders/entities/order.entity';
import { InventoryReservationStatus } from '../enums/inventory-reservation-status.enum';
import { InventoryItem } from './inventory-item.entity';
import { InventoryTransaction } from './inventory-transaction.entity';

@Entity('inventory_reservations')
export class InventoryReservation extends AppBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  inventoryItemId!: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  orderId!: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  orderItemId!: string | null;

  @Column({ type: 'int' })
  quantity!: number;

  @Index()
  @Column({
    type: 'enum',
    enum: InventoryReservationStatus,
    default: InventoryReservationStatus.ACTIVE,
  })
  status!: InventoryReservationStatus;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @ManyToOne(() => InventoryItem, (inventoryItem) => inventoryItem.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem!: InventoryItem;

  @ManyToOne(() => Order, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'orderId' })
  order!: Order | null;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.inventoryReservations, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'orderItemId' })
  orderItem!: OrderItem | null;

  @OneToMany(() => InventoryTransaction, (transaction) => transaction.reservation)
  transactions!: InventoryTransaction[];
}
