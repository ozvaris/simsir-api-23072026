import { FulfillmentStatus } from '../enums/fulfillment-status.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { OrderCustomerResponse } from './order-customer.response';

export class OrderSummaryResponse {
  id!: string;
  orderNumber!: string;
  userId!: string;
  orderStatus!: OrderStatus;
  paymentStatus!: PaymentStatus;
  fulfillmentStatus!: FulfillmentStatus;
  currency!: string;
  subtotal!: number;
  discountTotal!: number;
  shippingFee!: number;
  grandTotal!: number;
  itemCount!: number;
  paymentMethodCode!: string | null;
  paymentMethodName!: string | null;
  shippingCarrierCode!: string | null;
  shippingCarrierName!: string | null;
  shippingCarrierServiceCode!: string | null;
  shippingCarrierServiceName!: string | null;
  createdAt!: string;
  updatedAt!: string;
  customer?: OrderCustomerResponse;
}
