// src/modules/product-reviews/entities/product-review.entity.ts

import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('product_reviews')
export class ProductReview extends AppBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  productId!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'numeric', precision: 2, scale: 1 })
  ratingValue!: string;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
