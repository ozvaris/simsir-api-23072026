# Frontend Order Confirmation Backend Integration Prompt

<a id="purpose"></a>

## Purpose

This document provides a copy-paste-ready integration prompt for the frontend Codex session.

It owns only the frontend-to-backend order submission and confirmation-page integration slice:

- submitting the final checkout selection as an order;
- understanding the backend order-create contract;
- rendering the order confirmation page from backend response data;
- reloading an existing placed order by id;
- understanding confirmation-safe status, shipment, address, and line-item shapes;
- validation and basic error handling.

It does not replace the frontend repository's own `architectguide.md`, and it does not define unrelated cart, catalog, account-profile, or admin UI areas.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Usage](#usage)
- [Prompt](#prompt)

<a id="usage"></a>

## Usage

Copy the prompt below and give it directly to the frontend Codex session.

The frontend implementation should continue following the frontend repository's own architecture, API client, routing, TanStack patterns, and state-management conventions.

<a id="prompt"></a>

## Prompt

```md
Use the existing frontend architecture and `architectguide.md` in the frontend repo.

Connect the frontend checkout submit and order confirmation flow to the backend using the exact endpoint paths and response shapes below.

Important:
- the backend order submission endpoint already exists
- the backend does not expose a separate dedicated `/api/checkout/confirm` or `/api/order-confirmation` endpoint
- the backend source of truth for the confirmation page is the created order response and `GET /api/orders/:orderId`
- checkout submission currently expects saved address ids, shipping service id, and payment method id
- the backend snapshots order items, addresses, payment, and shipment data at order creation time
- preserve the existing frontend architecture, API client, routing, caching, and mutation conventions
- treat all ids as opaque `string` values

## Base

- API base: `{{Backend_URL}}/api`

## Auth requirement

All endpoints below require authenticated requests.

Headers:
```txt
Authorization: Bearer <accessToken>
Accept: application/json
```

For `POST /api/orders` also send:
```txt
Content-Type: application/json
```

Unauthenticated behavior:
- status: `401`

## Current backend reality

Important:
- there is no checkout draft finalization endpoint separate from order creation
- placing the order is done directly with `POST /api/orders`
- successful order creation returns the full order detail payload needed by the confirmation page
- if the user refreshes or revisits confirmation later, frontend should reload the order using `GET /api/orders/:orderId`
- backend order ids are UUID strings
- backend order numbers are human-readable strings, but `GET /api/orders/:orderId` currently loads by `orderId`, not by `orderNumber`

## 1. Submit checkout as an order

Endpoint:
- `POST /api/orders`

Purpose:
- create the order from the authenticated user's active cart
- validate selected checkout entities against backend ownership and availability rules
- return the created order detail for immediate confirmation-page rendering

Request JSON:
```json
{
  "shippingAddressId": "00000000-0000-4000-8000-000000000011",
  "billingAddressId": "00000000-0000-4000-8000-000000000022",
  "shippingServiceId": "00000000-0000-4000-8000-000000000033",
  "paymentMethodId": "00000000-0000-4000-8000-000000000044",
  "notes": "Please call before delivery."
}
```

Request field rules:
- `shippingAddressId`: required UUID, must belong to authenticated user and must be a saved `shipping` address
- `billingAddressId`: required UUID, must belong to authenticated user and must be a saved `billing` address
- `shippingServiceId`: required UUID, must reference an active public shipping service
- `paymentMethodId`: required UUID, must be selectable for the chosen shipping service
- `notes`: optional string, max length `2000`

Success response JSON:
```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "orderNumber": "ORD-20260710-123456",
  "userId": "22222222-2222-4222-8222-222222222222",
  "orderStatus": "PENDING",
  "paymentStatus": "PENDING",
  "fulfillmentStatus": "PENDING",
  "currency": "TRY",
  "subtotal": 1299.9,
  "discountTotal": 150,
  "shippingFee": 79,
  "grandTotal": 1228.9,
  "itemCount": 2,
  "paymentMethodCode": "credit_card",
  "paymentMethodName": "Credit Card",
  "shippingCarrierCode": "aras_kargo",
  "shippingCarrierName": "Aras Kargo",
  "shippingCarrierServiceCode": "standard_delivery",
  "shippingCarrierServiceName": "Standart Teslimat",
  "createdAt": "2026-07-10T12:34:56.000Z",
  "updatedAt": "2026-07-10T12:34:56.000Z",
  "notes": "Please call before delivery.",
  "items": [
    {
      "id": "33333333-3333-4333-8333-333333333333",
      "productId": "44444444-4444-4444-8444-444444444444",
      "quantity": 1,
      "unitPrice": 999.9,
      "discountAmount": 100,
      "lineSubtotal": 999.9,
      "lineTotal": 899.9,
      "productTitleSnapshot": "iPhone Case",
      "productSlugSnapshot": "iphone-case",
      "brandNameSnapshot": "Bazar",
      "productImageSnapshot": "https://cdn.example.com/products/iphone-case.jpg"
    },
    {
      "id": "55555555-5555-4555-8555-555555555555",
      "productId": "66666666-6666-4666-8666-666666666666",
      "quantity": 1,
      "unitPrice": 300,
      "discountAmount": 50,
      "lineSubtotal": 300,
      "lineTotal": 250,
      "productTitleSnapshot": "Charging Cable",
      "productSlugSnapshot": "charging-cable",
      "brandNameSnapshot": null,
      "productImageSnapshot": null
    }
  ],
  "addresses": [
    {
      "id": "77777777-7777-4777-8777-777777777777",
      "addressRole": "shipping",
      "label": "Home",
      "fullName": "Jane Doe",
      "phone": "+90 555 000 0000",
      "country": "Turkey",
      "city": "Istanbul",
      "state": null,
      "zip": "34000",
      "addressLine1": "Example Mah. Example Sok. No:10",
      "addressLine2": "Daire 5"
    },
    {
      "id": "88888888-8888-4888-8888-888888888888",
      "addressRole": "billing",
      "label": "Office",
      "fullName": "Jane Doe",
      "phone": "+90 555 000 0000",
      "country": "Turkey",
      "city": "Istanbul",
      "state": null,
      "zip": "34330",
      "addressLine1": "Business Center No:20",
      "addressLine2": null
    }
  ],
  "paymentSnapshot": {
    "paymentMethodId": "00000000-0000-4000-8000-000000000044",
    "paymentMethodCodeSnapshot": "credit_card",
    "paymentMethodNameSnapshot": "Credit Card",
    "paymentProviderId": null,
    "paymentProviderCodeSnapshot": null,
    "paymentProviderNameSnapshot": null,
    "paymentProviderTypeSnapshot": null,
    "providerConfigSnapshot": null
  },
  "shipmentSnapshot": {
    "shippingOption": "carrier",
    "shippingCarrierId": "99999999-9999-4999-8999-999999999999",
    "shippingCarrierCodeSnapshot": "aras_kargo",
    "shippingCarrierNameSnapshot": "Aras Kargo",
    "shippingCarrierServiceId": "00000000-0000-4000-8000-000000000033",
    "shippingCarrierServiceCodeSnapshot": "standard_delivery",
    "shippingCarrierServiceNameSnapshot": "Standart Teslimat",
    "estimatedDeliveryText": "2-3 is gunu",
    "trackingNumber": null,
    "shipmentPrice": 79,
    "currency": "TRY"
  },
  "statusHistory": [
    {
      "id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      "statusType": "ORDER",
      "fromValue": null,
      "toValue": "PENDING",
      "note": "Order created",
      "createdAt": "2026-07-10T12:34:56.000Z"
    },
    {
      "id": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      "statusType": "PAYMENT",
      "fromValue": null,
      "toValue": "PENDING",
      "note": "Initial payment status created",
      "createdAt": "2026-07-10T12:34:56.000Z"
    },
    {
      "id": "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      "statusType": "FULFILLMENT",
      "fromValue": null,
      "toValue": "PENDING",
      "note": "Initial fulfillment status created",
      "createdAt": "2026-07-10T12:34:56.000Z"
    }
  ]
}
```

Important success behavior:
- success response is already the full order detail object
- backend clears the active cart items after successful order creation
- backend snapshots product title, slug, brand, image, addresses, shipping metadata, and payment metadata into the order
- frontend confirmation screen should prefer snapshot fields from the order response instead of trying to rehydrate live product/address/payment data

Recommended frontend behavior:
1. Submit `POST /api/orders` from the final checkout action
2. On success, store or route with the returned `order.id`
3. Render the confirmation page immediately from the mutation response when possible
4. If the page is refreshed later, reload using `GET /api/orders/:orderId`
5. Do not expect cart contents to still exist after success

## 2. Reload a placed order for confirmation or revisit

Endpoint:
- `GET /api/orders/:orderId`

Purpose:
- load one previously created order owned by the authenticated user
- support refresh-safe confirmation pages and later revisit flows

Success response JSON:
- returns the same `OrderDetailResponse` shape shown above

Not found behavior:
- if `orderId` does not exist or does not belong to authenticated user, backend returns `404`

Example not found JSON:
```json
{
  "message": "Order not found",
  "error": "Not Found",
  "statusCode": 404
}
```

Important frontend behavior:
- use `orderId`, not `orderNumber`, as the route lookup key when calling backend
- the route may still display `orderNumber` to the user

## 3. Optional order list endpoint for account history entry points

Endpoint:
- `GET /api/orders`

Optional filters:
- `GET /api/orders?page=1&limit=20`
- `GET /api/orders?orderStatus=PENDING`
- `GET /api/orders?paymentStatus=PAID`
- `GET /api/orders?fulfillmentStatus=DELIVERED`

Purpose:
- support “my orders” or account history pages that may link into confirmation/detail views

Success response JSON:
```json
{
  "items": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "orderNumber": "ORD-20260710-123456",
      "userId": "22222222-2222-4222-8222-222222222222",
      "orderStatus": "PENDING",
      "paymentStatus": "PENDING",
      "fulfillmentStatus": "PENDING",
      "currency": "TRY",
      "subtotal": 1299.9,
      "discountTotal": 150,
      "shippingFee": 79,
      "grandTotal": 1228.9,
      "itemCount": 2,
      "paymentMethodCode": "credit_card",
      "paymentMethodName": "Credit Card",
      "shippingCarrierCode": "aras_kargo",
      "shippingCarrierName": "Aras Kargo",
      "shippingCarrierServiceCode": "standard_delivery",
      "shippingCarrierServiceName": "Standart Teslimat",
      "createdAt": "2026-07-10T12:34:56.000Z",
      "updatedAt": "2026-07-10T12:34:56.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

Important response behavior:
- list response is paginated
- list items are summary rows, not full detail rows
- use `GET /api/orders/:orderId` for full confirmation/detail data

## 4. Order detail shapes the confirmation page can trust

`OrderDetailResponse` top-level fields:

```ts
type OrderDetailResponse = {
  id: string;
  orderNumber: string;
  userId: string;
  orderStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus:
    | 'PENDING'
    | 'UNPAID'
    | 'PAID'
    | 'FAILED'
    | 'REFUNDED'
    | 'PARTIALLY_REFUNDED';
  fulfillmentStatus:
    | 'PENDING'
    | 'READY_FOR_SHIPMENT'
    | 'HANDED_OVER'
    | 'DELIVERED'
    | 'DELIVERY_FAILED'
    | 'RETURNED';
  currency: string;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  grandTotal: number;
  itemCount: number;
  paymentMethodCode: string | null;
  paymentMethodName: string | null;
  shippingCarrierCode: string | null;
  shippingCarrierName: string | null;
  shippingCarrierServiceCode: string | null;
  shippingCarrierServiceName: string | null;
  createdAt: string;
  updatedAt: string;
  notes: string | null;
  items: OrderItemResponse[];
  addresses: OrderAddressResponse[];
  paymentSnapshot: OrderPaymentSnapshotResponse | null;
  shipmentSnapshot: OrderShipmentSnapshotResponse | null;
  statusHistory: OrderStatusHistoryResponse[];
};
```

`items` shape:

```ts
type OrderItemResponse = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineSubtotal: number;
  lineTotal: number;
  productTitleSnapshot: string;
  productSlugSnapshot: string;
  brandNameSnapshot: string | null;
  productImageSnapshot: string | null;
};
```

`addresses` shape:

```ts
type OrderAddressResponse = {
  id: string;
  addressRole: 'shipping' | 'billing';
  label: string | null;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  state: string | null;
  zip: string | null;
  addressLine1: string;
  addressLine2: string | null;
};
```

`paymentSnapshot` shape:

```ts
type OrderPaymentSnapshotResponse = {
  paymentMethodId: string | null;
  paymentMethodCodeSnapshot: string;
  paymentMethodNameSnapshot: string;
  paymentProviderId: string | null;
  paymentProviderCodeSnapshot: string | null;
  paymentProviderNameSnapshot: string | null;
  paymentProviderTypeSnapshot: string | null;
  providerConfigSnapshot: Record<string, unknown> | null;
};
```

`shipmentSnapshot` shape:

```ts
type OrderShipmentSnapshotResponse = {
  shippingOption: 'carrier' | 'pickup' | null;
  shippingCarrierId: string | null;
  shippingCarrierCodeSnapshot: string | null;
  shippingCarrierNameSnapshot: string | null;
  shippingCarrierServiceId: string | null;
  shippingCarrierServiceCodeSnapshot: string | null;
  shippingCarrierServiceNameSnapshot: string | null;
  estimatedDeliveryText: string | null;
  trackingNumber: string | null;
  shipmentPrice: number;
  currency: string;
};
```

`statusHistory` shape:

```ts
type OrderStatusHistoryResponse = {
  id: string;
  statusType: 'ORDER' | 'PAYMENT' | 'FULFILLMENT';
  fromValue: string | null;
  toValue: string;
  note: string | null;
  createdAt: string;
};
```

Recommended confirmation-page field mapping:
- confirmation order code -> `orderNumber`
- confirmation placed-at time -> `createdAt`
- paid/unpaid/pending badge -> `paymentStatus`
- order state badge -> `orderStatus`
- shipping progress badge -> `fulfillmentStatus`
- purchased product rows -> `items`
- delivery card -> `addresses.find(item => item.addressRole === 'shipping')`
- billing card -> `addresses.find(item => item.addressRole === 'billing')`
- payment label -> `paymentMethodName` or `paymentSnapshot.paymentMethodNameSnapshot`
- shipping label -> `shippingCarrierName` + `shippingCarrierServiceName`
- ETA text -> `shipmentSnapshot?.estimatedDeliveryText`
- tracking number -> `shipmentSnapshot?.trackingNumber`
- totals section -> `subtotal`, `discountTotal`, `shippingFee`, `grandTotal`, `currency`

## 5. Important payment-status reality for confirmation

Current backend behavior:
- `credit_card` creates orders with initial `paymentStatus: "PENDING"`
- `bank_transfer` creates orders with initial `paymentStatus: "UNPAID"`
- `cash_on_delivery` creates orders with initial `paymentStatus: "UNPAID"`
- `card_on_delivery` creates orders with initial `paymentStatus: "UNPAID"`

Important:
- frontend should not assume that a successfully created order means `paymentStatus === "PAID"`
- confirmation UI should display backend `paymentStatus` exactly as returned

## 6. Error handling for checkout submit

### Validation error

When required ids are missing or malformed, backend returns `400`.

Example JSON:
```json
{
  "message": [
    "shippingAddressId must be a UUID",
    "billingAddressId must be a UUID",
    "shippingServiceId must be a UUID",
    "paymentMethodId must be a UUID"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Cart empty

If the active cart has no items, backend returns `409`.

Example JSON:
```json
{
  "message": "Cart is empty",
  "error": "Conflict",
  "statusCode": 409
}
```

### Address not found or wrong type

If address id is missing, belongs to another user, or address type is wrong:
- shipping mismatch -> `404` with `Shipping address not found`
- billing mismatch -> `404` with `Billing address not found`

### Shipping service not found

If selected service is not active/public or does not exist, backend returns `404`.

Example JSON:
```json
{
  "message": "Shipping service not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### Payment method not available for selected shipping service

If payment method is not selectable for the chosen shipping service, backend returns `409`.

Example JSON:
```json
{
  "message": "Selected payment method is not available for the chosen shipping service",
  "error": "Conflict",
  "statusCode": 409
}
```

### Inventory conflict

If a tracked product no longer has enough available inventory, backend returns `409`.

Example JSON:
```json
{
  "message": "Insufficient inventory for product iphone-case",
  "error": "Conflict",
  "statusCode": 409
}
```

Recommended frontend behavior:
1. Treat `400` as invalid checkout payload or stale frontend state
2. Treat `401` as auth/session-expired handling
3. Treat `404` as stale selected entity state and force re-selection or reload
4. Treat `409` as business-rule conflict and show a recovery message in checkout UI
5. Do not navigate to confirmation page on failed order creation

## 7. Implementation expectations

Implement only the frontend order-submit and order-confirmation integration for:
- submitting `POST /api/orders`
- storing and using returned `order.id`
- rendering confirmation from `OrderDetailResponse`
- reloading confirmation with `GET /api/orders/:orderId`
- optionally linking account-history rows from `GET /api/orders`

Do not:
- invent a separate confirmation endpoint when backend already returns the full order detail
- use `orderNumber` as the backend fetch key
- re-read live cart data to rebuild the confirmation page after success
- assume payment is immediately completed for every method
- replace snapshot values with live product/address/payment data unless the UI explicitly needs live data elsewhere
```
