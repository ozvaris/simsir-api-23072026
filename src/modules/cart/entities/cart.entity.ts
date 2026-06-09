// src/modules/cart/entities/cart.entity.ts

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { CartStatus } from '../enums/cart-status.enum';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.ACTIVE,
  })
  status!: CartStatus;

  @OneToOne(() => User, (user) => user.cart, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => CartItem, (item) => item.cart)
  items!: CartItem[];
}
