import { Order } from '../entities/order.entity';
import { OrderAddress } from '../entities/order-address.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderPaymentSnapshot } from '../entities/order-payment-snapshot.entity';
import { OrderShipmentSnapshot } from '../entities/order-shipment-snapshot.entity';
import { OrderStatusHistory } from '../entities/order-status-history.entity';
import { OrderAddressResponse } from '../responses/order-address.response';
import { OrderCustomerResponse } from '../responses/order-customer.response';
import { OrderDetailResponse } from '../responses/order-detail.response';
import { OrderItemResponse } from '../responses/order-item.response';
import { OrderPaymentSnapshotResponse } from '../responses/order-payment-snapshot.response';
import { OrderShipmentSnapshotResponse } from '../responses/order-shipment-snapshot.response';
import { OrderStatusHistoryResponse } from '../responses/order-status-history.response';
import { OrderSummaryResponse } from '../responses/order-summary.response';

type OrderWithOptionalItemCount = Order & {
  itemCount?: number;
};

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function mapCustomer(order: Order): OrderCustomerResponse | undefined {
  if (!order.user) {
    return undefined;
  }

  return {
    id: order.user.id,
    email: order.user.email,
    userName: order.user.userName,
    name: order.user.name,
    surname: order.user.surname,
    phone: order.user.phone,
  };
}

function mapOrderItem(item: OrderItem): OrderItemResponse {
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: toNumber(item.unitPrice),
    discountAmount: toNumber(item.discountAmount),
    lineSubtotal: toNumber(item.lineSubtotal),
    lineTotal: toNumber(item.lineTotal),
    productTitleSnapshot: item.productTitleSnapshot,
    productSlugSnapshot: item.productSlugSnapshot,
    brandNameSnapshot: item.brandNameSnapshot,
    productImageSnapshot: item.productImageSnapshot,
  };
}

function mapOrderAddress(address: OrderAddress): OrderAddressResponse {
  return {
    id: address.id,
    addressRole: address.addressRole,
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    country: address.country,
    city: address.city,
    state: address.state,
    zip: address.zip,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
  };
}

function mapPaymentSnapshot(
  snapshot: OrderPaymentSnapshot,
): OrderPaymentSnapshotResponse {
  return {
    paymentMethodId: snapshot.paymentMethodId,
    paymentMethodCodeSnapshot: snapshot.paymentMethodCodeSnapshot,
    paymentMethodNameSnapshot: snapshot.paymentMethodNameSnapshot,
    paymentProviderId: snapshot.paymentProviderId,
    paymentProviderCodeSnapshot: snapshot.paymentProviderCodeSnapshot,
    paymentProviderNameSnapshot: snapshot.paymentProviderNameSnapshot,
    paymentProviderTypeSnapshot: snapshot.paymentProviderTypeSnapshot,
    providerConfigSnapshot: snapshot.providerConfigSnapshot,
  };
}

function mapShipmentSnapshot(
  snapshot: OrderShipmentSnapshot,
): OrderShipmentSnapshotResponse {
  return {
    shippingOption: snapshot.shippingOption,
    shippingCarrierId: snapshot.shippingCarrierId,
    shippingCarrierCodeSnapshot: snapshot.shippingCarrierCodeSnapshot,
    shippingCarrierNameSnapshot: snapshot.shippingCarrierNameSnapshot,
    shippingCarrierServiceId: snapshot.shippingCarrierServiceId,
    shippingCarrierServiceCodeSnapshot: snapshot.shippingCarrierServiceCodeSnapshot,
    shippingCarrierServiceNameSnapshot: snapshot.shippingCarrierServiceNameSnapshot,
    estimatedDeliveryText: snapshot.estimatedDeliveryText,
    trackingNumber: snapshot.trackingNumber,
    shipmentPrice: toNumber(snapshot.shipmentPrice),
    currency: snapshot.currency,
  };
}

function mapStatusHistory(
  history: OrderStatusHistory,
): OrderStatusHistoryResponse {
  return {
    id: history.id,
    statusType: history.statusType,
    fromValue: history.fromValue,
    toValue: history.toValue,
    note: history.note,
    createdAt: history.createdAt.toISOString(),
  };
}

export function toOrderSummaryResponse(
  order: Order,
  options?: { includeCustomer?: boolean },
): OrderSummaryResponse {
  const orderWithItemCount = order as OrderWithOptionalItemCount;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    currency: order.currency,
    subtotal: toNumber(order.subtotal),
    discountTotal: toNumber(order.discountTotal),
    shippingFee: toNumber(order.shippingFee),
    grandTotal: toNumber(order.grandTotal),
    itemCount: orderWithItemCount.itemCount ?? order.items?.length ?? 0,
    paymentMethodCode: order.paymentSnapshot?.paymentMethodCodeSnapshot ?? null,
    paymentMethodName: order.paymentSnapshot?.paymentMethodNameSnapshot ?? null,
    shippingCarrierCode: order.shipmentSnapshot?.shippingCarrierCodeSnapshot ?? null,
    shippingCarrierName: order.shipmentSnapshot?.shippingCarrierNameSnapshot ?? null,
    shippingCarrierServiceCode:
      order.shipmentSnapshot?.shippingCarrierServiceCodeSnapshot ?? null,
    shippingCarrierServiceName:
      order.shipmentSnapshot?.shippingCarrierServiceNameSnapshot ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    customer: options?.includeCustomer ? mapCustomer(order) : undefined,
  };
}

export function toOrderDetailResponse(
  order: Order,
  options?: { includeCustomer?: boolean },
): OrderDetailResponse {
  return {
    ...toOrderSummaryResponse(order, options),
    notes: order.notes,
    items: [...(order.items ?? [])]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(mapOrderItem),
    addresses: [...(order.addresses ?? [])]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(mapOrderAddress),
    paymentSnapshot: order.paymentSnapshot
      ? mapPaymentSnapshot(order.paymentSnapshot)
      : null,
    shipmentSnapshot: order.shipmentSnapshot
      ? mapShipmentSnapshot(order.shipmentSnapshot)
      : null,
    statusHistory: [...(order.statusHistory ?? [])]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(mapStatusHistory),
  };
}
