import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Order } from '../../orders/entities/order.entity';
import { InventoryTransactionType } from '../enums/inventory-transaction-type.enum';
import { InventoryItem } from './inventory-item.entity';
import { InventoryReservation } from './inventory-reservation.entity';

@Entity('inventory_transactions')
export class InventoryTransaction extends AppBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  inventoryItemId!: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  reservationId!: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  orderId!: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  orderItemId!: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: InventoryTransactionType,
  })
  type!: InventoryTransactionType;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @ManyToOne(() => InventoryItem, (inventoryItem) => inventoryItem.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem!: InventoryItem;

  @ManyToOne(() => InventoryReservation, (reservation) => reservation.transactions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'reservationId' })
  reservation!: InventoryReservation | null;

  @ManyToOne(() => Order, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'orderId' })
  order!: Order | null;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.inventoryTransactions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'orderItemId' })
  orderItem!: OrderItem | null;
}
