import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { Product } from '../../products/entities/product.entity';
import { StorefrontCollection } from './storefront-collection.entity';

@Entity('storefront_collection_items')
@Index(
  'IDX_storefront_collection_items_collection_product_unique',
  ['collectionId', 'productId'],
  { unique: true },
)
export class StorefrontCollectionItem extends AppBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  collectionId!: string;

  @Index()
  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    default: RecordStatus.ACTIVE,
  })
  status!: RecordStatus;

  @ManyToOne(() => StorefrontCollection, (collection) => collection.items, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'collectionId' })
  collection!: StorefrontCollection;

  @ManyToOne(() => Product, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
