import { ShippingOption } from '../enums/shipping-option.enum';

export class OrderShipmentSnapshotResponse {
  shippingOption!: ShippingOption | null;
  shippingCarrierId!: string | null;
  shippingCarrierCodeSnapshot!: string | null;
  shippingCarrierNameSnapshot!: string | null;
  shippingCarrierServiceId!: string | null;
  shippingCarrierServiceCodeSnapshot!: string | null;
  shippingCarrierServiceNameSnapshot!: string | null;
  estimatedDeliveryText!: string | null;
  trackingNumber!: string | null;
  shipmentPrice!: number;
  currency!: string;
}
