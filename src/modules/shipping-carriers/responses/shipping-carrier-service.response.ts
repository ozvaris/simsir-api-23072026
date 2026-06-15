import { RecordStatus } from '../../../common/enums/record-status.enum';
import { ShippingCarrierServicePaymentCapabilityResponse } from './shipping-carrier-service-payment-capability.response';

export class ShippingCarrierServiceResponse {
  id!: string;
  code!: string;
  name!: string;
  description!: string | null;
  price!: number;
  currency!: string;
  estimatedDeliveryText!: string | null;
  sortOrder!: number;
  status!: RecordStatus;
  paymentCapabilities?: ShippingCarrierServicePaymentCapabilityResponse[];
}
