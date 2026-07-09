import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/base.entity';
import { ShippingOption } from '../../orders/enums/shipping-option.enum';
import { User } from '../../users/entities/user.entity';

@Entity('checkout_drafts')
export class CheckoutDraft extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 20, nullable: true })
  shippingOption!: ShippingOption | null;

  @Column({ type: 'uuid', nullable: true })
  shippingServiceId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  shippingAddressId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  billingAddressId!: string | null;

  @Column({ type: 'boolean', default: true })
  sameAsShipping!: boolean;

  @Column({ type: 'uuid', nullable: true })
  paymentMethodId!: string | null;
}
