import { PaymentMethodCode } from '../../../common/enums/payment-method-code.enum';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class ShippingCarrierServicePaymentCapabilityResponse {
  id!: string;
  paymentMethod!: PaymentMethodCode;
  fee!: number;
  currency!: string;
  minOrderAmount!: number | null;
  maxOrderAmount!: number | null;
  sortOrder!: number;
  status!: RecordStatus;
}
