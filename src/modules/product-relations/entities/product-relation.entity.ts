// src/modules/product-relations/entities/product-relation.entity.ts

import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { ProductRelationType } from '../enums/product-relation-type.enum';
import { Product } from '../../products/entities/product.entity';

@Entity('product_relations')
@Index(['sourceProductId', 'targetProductId', 'relationType'], { unique: true })
export class ProductRelation extends AppBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  sourceProductId!: string;

  @Index()
  @Column({ type: 'uuid' })
  targetProductId!: string;

  @Column({
    type: 'enum',
    enum: ProductRelationType,
  })
  relationType!: ProductRelationType;

  @ManyToOne(() => Product, (product) => product.sourceRelations, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'sourceProductId' })
  sourceProduct!: Product;

  @ManyToOne(() => Product, (product) => product.targetRelations, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'targetProductId' })
  targetProduct!: Product;
}
