import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { Category } from '../../categories/entities/category.entity';

@Entity('storefront_featured_categories')
@Index('IDX_storefront_featured_categories_category_id_unique', ['categoryId'], {
  unique: true,
})
export class FeaturedCategory extends AppBaseEntity {
  @Column({ type: 'uuid' })
  categoryId!: string;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

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
}
