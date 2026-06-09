// src/modules/products/entities/product.entity.ts

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { Category } from '../../categories/entities/category.entity';
import { ProductMedia } from '../../product-media/entities/product-media.entity';
import { ProductRelation } from '../../product-relations/entities/product-relation.entity';
import { ProductReview } from '../../product-reviews/entities/product-review.entity';

@Entity('products')
export class Product extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 220 })
  slug!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  brandName!: string | null;

  @Index()
  @Column({ type: 'uuid' })
  categoryId!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discount!: string;

  @Column({ type: 'numeric', precision: 2, scale: 1, default: 0 })
  rating!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imgUrl!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  shortDescription!: string | null;

  @Column({ type: 'text', nullable: true })
  longDescription!: string | null;

  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    default: RecordStatus.ACTIVE,
  })
  status!: RecordStatus;

  @ManyToOne(() => Category, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @OneToMany(() => ProductMedia, (media) => media.product)
  media!: ProductMedia[];

  @OneToMany(() => ProductReview, (review) => review.product)
  reviews!: ProductReview[];

  @OneToMany(() => CartItem, (item) => item.product)
  cartItems!: CartItem[];

  @OneToMany(() => ProductRelation, (relation) => relation.sourceProduct)
  sourceRelations!: ProductRelation[];

  @OneToMany(() => ProductRelation, (relation) => relation.targetProduct)
  targetRelations!: ProductRelation[];
}
