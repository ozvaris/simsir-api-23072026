import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { OrderAddressRole } from '../enums/order-address-role.enum';
import { Order } from './order.entity';

@Entity('order_addresses')
export class OrderAddress extends AppBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  orderId!: string;

  @Column({
    type: 'enum',
    enum: OrderAddressRole,
  })
  addressRole!: OrderAddressRole;

  @Column({ type: 'varchar', length: 100, nullable: true })
  label!: string | null;

  @Column({ type: 'varchar', length: 150 })
  fullName!: string;

  @Column({ type: 'varchar', length: 30 })
  phone!: string;

  @Column({ type: 'varchar', length: 100 })
  country!: string;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zip!: string | null;

  @Column({ type: 'varchar', length: 255 })
  addressLine1!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLine2!: string | null;

  @ManyToOne(() => Order, (order) => order.addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order!: Order;
}
