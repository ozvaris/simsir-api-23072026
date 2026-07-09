import { Column, Entity, Index, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { StorefrontCollectionType } from '../enums/storefront-collection-type.enum';
import { StorefrontCollectionItem } from './storefront-collection-item.entity';

@Entity('storefront_collections')
export class StorefrontCollection extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120 })
  type!: StorefrontCollectionType;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  viewAllHref!: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    default: RecordStatus.ACTIVE,
  })
  status!: RecordStatus;

  @OneToMany(() => StorefrontCollectionItem, (item) => item.collection)
  items!: StorefrontCollectionItem[];
}
