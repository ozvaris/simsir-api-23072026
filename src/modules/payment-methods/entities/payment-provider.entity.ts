import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { PaymentProviderType } from '../../../common/enums/payment-provider-type.enum';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { PaymentMethod } from './payment-method.entity';

@Entity('payment_providers')
@Index(['paymentMethodId', 'code'], { unique: true })
export class PaymentProvider extends AppBaseEntity {
  @Column({ type: 'uuid' })
  paymentMethodId!: string;

  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.providers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'varchar', length: 80 })
  code!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  providerType!: PaymentProviderType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl!: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    default: RecordStatus.ACTIVE,
  })
  status!: RecordStatus;
}
