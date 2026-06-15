import { PaymentMethodCode } from '../../../common/enums/payment-method-code.enum';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class ShippingCarrierPublicPaymentCollectionFeeResponse {
  paymentMethod!: PaymentMethodCode;
  fee!: number;
  currency!: string;
  minOrderAmount!: number | null;
  maxOrderAmount!: number | null;
}

export class ShippingCarrierPublicResponse {
  id!: string;
  code!: string;
  name!: string;
  fee!: number;
  status!: RecordStatus;
  carrierId!: string;
  carrierCode!: string;
  carrierName!: string;
  serviceCode!: string;
  serviceName!: string;
  price!: number;
  currency!: string;
  estimatedDeliveryText!: string | null;
  supportedPaymentMethods!: PaymentMethodCode[];
  paymentCollectionFees!: ShippingCarrierPublicPaymentCollectionFeeResponse[];
}
