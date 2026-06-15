import { PaymentProviderType } from '../../../common/enums/payment-provider-type.enum';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class PaymentProviderResponse {
  id!: string;
  code!: string;
  name!: string;
  providerType!: PaymentProviderType;
  description!: string | null;
  logoUrl!: string | null;
  sortOrder!: number;
  status!: RecordStatus;
}
