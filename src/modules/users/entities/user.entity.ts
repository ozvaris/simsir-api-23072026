// src/modules/users/entities/user.entity.ts

import { Column, Entity, Index, OneToMany, OneToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { Order } from '../../orders/entities/order.entity';
import { ProductReview } from '../../../modules/product-reviews/entities/product-review.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { UserRole } from '../../rbac/entities/user-role.entity';
import { Address } from './address.entity';
import { UserCredential } from './user-credential.entity';

@Entity('users')
export class User extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80 })
  userName!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  surname!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone!: string | null;

  @OneToOne(() => UserCredential, (credential) => credential.user)
  credential!: UserCredential;

  @OneToMany(() => Address, (address) => address.user)
  addresses!: Address[];

  @OneToMany(() => ProductReview, (review) => review.user)
  reviews!: ProductReview[];

  @OneToOne(() => Cart, (cart) => cart.user)
  cart!: Cart;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles!: UserRole[];

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];
}
