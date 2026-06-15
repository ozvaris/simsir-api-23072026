import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { InventoryReservation } from '../../inventory/entities/inventory-reservation.entity';
import { InventoryTransaction } from '../../inventory/entities/inventory-transaction.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem extends AppBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  orderId!: string;

  @Index()
  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  unitPrice!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discountAmount!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  lineSubtotal!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  lineTotal!: string;

  @Column({ type: 'varchar', length: 255 })
  productTitleSnapshot!: string;

  @Column({ type: 'varchar', length: 220 })
  productSlugSnapshot!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  brandNameSnapshot!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  productImageSnapshot!: string | null;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @ManyToOne(() => Product, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @OneToMany(() => InventoryReservation, (reservation) => reservation.orderItem)
  inventoryReservations!: InventoryReservation[];

  @OneToMany(() => InventoryTransaction, (transaction) => transaction.orderItem)
  inventoryTransactions!: InventoryTransaction[];
}
