import { OrderAddressResponse } from './order-address.response';
import { OrderItemResponse } from './order-item.response';
import { OrderPaymentSnapshotResponse } from './order-payment-snapshot.response';
import { OrderShipmentSnapshotResponse } from './order-shipment-snapshot.response';
import { OrderStatusHistoryResponse } from './order-status-history.response';
import { OrderSummaryResponse } from './order-summary.response';

export class OrderDetailResponse extends OrderSummaryResponse {
  notes!: string | null;
  items!: OrderItemResponse[];
  addresses!: OrderAddressResponse[];
  paymentSnapshot!: OrderPaymentSnapshotResponse | null;
  shipmentSnapshot!: OrderShipmentSnapshotResponse | null;
  statusHistory!: OrderStatusHistoryResponse[];
}
