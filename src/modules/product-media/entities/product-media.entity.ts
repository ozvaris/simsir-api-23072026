// src/modules/product-media/entities/product-media.entity.ts

import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('product_media')
export class ProductMedia extends AppBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'varchar', length: 500 })
  src!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  alt!: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @ManyToOne(() => Product, (product) => product.media, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
