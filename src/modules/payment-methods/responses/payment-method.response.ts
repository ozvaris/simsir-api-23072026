// src/modules/payment-methods/responses/payment-method.response.ts

import { RecordStatus } from '../../../common/enums/record-status.enum';
import { PaymentProviderResponse } from './payment-provider.response';

export type PaymentMethodAvailabilityReason =
  | 'available'
  | 'shipping_service_required'
  | 'not_supported_by_shipping_service';

export class PaymentMethodResponse {
  id!: string;
  code!: string;
  name!: string;
  status!: RecordStatus;
  providers?: PaymentProviderResponse[];
  isBaseMethod?: boolean;
  isConditionalMethod?: boolean;
  isSelectable?: boolean;
  availabilityReason?: PaymentMethodAvailabilityReason;
  extraFee?: number | null;
  currency?: string | null;
  minOrderAmount?: number | null;
  maxOrderAmount?: number | null;
}
