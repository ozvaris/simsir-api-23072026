import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { Product } from '../../products/entities/product.entity';
import { InventoryReservation } from './inventory-reservation.entity';
import { InventoryTransaction } from './inventory-transaction.entity';

@Entity('inventory_items')
export class InventoryItem extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'int', default: 0 })
  onHandQuantity!: number;

  @Column({ type: 'int', default: 0 })
  reservedQuantity!: number;

  @ManyToOne(() => Product, (product) => product.inventoryItems, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @OneToMany(() => InventoryReservation, (reservation) => reservation.inventoryItem)
  reservations!: InventoryReservation[];

  @OneToMany(() => InventoryTransaction, (transaction) => transaction.inventoryItem)
  transactions!: InventoryTransaction[];
}
