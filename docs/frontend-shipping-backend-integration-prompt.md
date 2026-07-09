# Frontend Shipping Backend Integration Prompt

<a id="purpose"></a>

## Purpose

This document provides a copy-paste-ready integration prompt for the frontend Codex session.

It owns only the frontend-to-backend shipping-step integration slice:

- loading shipping services for checkout;
- rendering carrier/service options from backend data;
- selecting a shipping service;
- understanding shipping service and carrier ids;
- shipping request/response contract;
- payment-method compatibility linkage for the next checkout step;
- validation and basic error handling.

It does not replace the frontend repository's own `architectguide.md`, and it does not define unrelated checkout, address, cart, payment, or order UI areas.

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

Connect the frontend `/shipping` step to the backend using the exact endpoint paths and response shapes below.

Important:
- The frontend currently shows shipping options from local seed/config
- The backend already exposes a public shipping reference endpoint
- The backend shipping selection unit is the shipping service, not just the carrier
- A single carrier may expose multiple selectable services
- Preserve the existing frontend architecture, API client, routing, caching, and mutation conventions
- Treat all ids as opaque `string` values

## Base

- API base: `{{Backend_URL}}/api`

## Auth requirement

Current shipping option list endpoint:
- public
- no auth required

Headers:
```txt
Accept: application/json
```

Important:
- even though checkout routes are sign-in gated, shipping option reference data itself is public in backend
- frontend may still fetch it only inside authenticated checkout flow

## Current backend reality

Important:
- there is no dedicated `/api/checkout/shipping` endpoint right now
- there is no checkout draft endpoint that persists the selected shipping service right now
- the current backend source of truth for shipping-step options is `GET /api/shipping-carriers`
- the selected value that matters for downstream backend flows is `shippingServiceId`
- checkout/order submission currently expects `shippingServiceId`

## Shipping model reality

The backend shipping hierarchy is:

```txt
ShippingCarrier
  └─ ShippingCarrierService
       └─ ShippingCarrierServicePaymentCapability
```

Meaning:
- `ShippingCarrier` is the company or brand, such as Aras Kargo or HepsiJET
- `ShippingCarrierService` is the selectable checkout option, such as standard delivery or express delivery
- `ShippingCarrierServicePaymentCapability` describes which conditional payment methods are allowed for that service

Important:
- frontend shipping selection should identify the selected service
- frontend should not treat carrier id alone as the selected checkout value

## 1. List shipping options for checkout

Endpoint:
- `GET /api/shipping-carriers`

Purpose:
- fetch public shipping services/options for checkout
- render each selectable service card/row in `/shipping`
- preserve carrier display data and service-level fee/ETA/payment capability data

Success response JSON:
```json
{
  "freeShippingThreshold": 1000,
  "items": [
    {
      "id": "svc_001",
      "code": "aras_kargo",
      "name": "Aras Kargo",
      "fee": 79,
      "status": "active",
      "carrierId": "car_001",
      "carrierCode": "aras_kargo",
      "carrierName": "Aras Kargo",
      "serviceCode": "standard_delivery",
      "serviceName": "Standart Teslimat",
      "price": 79,
      "currency": "TRY",
      "estimatedDeliveryText": "2-3 is gunu",
      "supportedPaymentMethods": [
        "cash_on_delivery",
        "card_on_delivery"
      ],
      "paymentCollectionFees": [
        {
          "paymentMethod": "cash_on_delivery",
          "fee": 25,
          "currency": "TRY",
          "minOrderAmount": null,
          "maxOrderAmount": null
        },
        {
          "paymentMethod": "card_on_delivery",
          "fee": 35,
          "currency": "TRY",
          "minOrderAmount": null,
          "maxOrderAmount": null
        }
      ]
    },
    {
      "id": "svc_002",
      "code": "hepsijet",
      "name": "HepsiJET",
      "fee": 149.9,
      "status": "active",
      "carrierId": "car_002",
      "carrierCode": "hepsijet",
      "carrierName": "HepsiJET",
      "serviceCode": "same_day_delivery",
      "serviceName": "Ayni Gun Teslimat",
      "price": 149.9,
      "currency": "TRY",
      "estimatedDeliveryText": "Bugun teslim",
      "supportedPaymentMethods": [],
      "paymentCollectionFees": []
    }
  ]
}
```

Important response behavior:
- response is an object with `items`
- response may include top-level `freeShippingThreshold`
- `items` is always an array
- each item represents one selectable shipping service
- `id` is the shipping service id that should be used as the selected value
- `carrierId` identifies the parent carrier
- `carrierCode` and `carrierName` are display metadata
- `serviceCode` and `serviceName` identify the exact option
- `price` is the shipping fee for that service
- `supportedPaymentMethods` reflects active service-level conditional payment capability rows
- `paymentCollectionFees` describes fee/limit metadata for supported conditional payment methods
- backend returns only active carriers, active services, and active payment capability rows

Recommended frontend behavior:
1. Load `/shipping` options from `GET /api/shipping-carriers`
2. Render one selectable row/card per returned item
3. Use `item.id` as the selected shipping value in checkout state
4. Show `carrierName` and `serviceName` together in UI
5. Show `price`, `currency`, and `estimatedDeliveryText` from backend instead of frontend seed values
6. If the UI shows a free-shipping threshold banner, read it from top-level `freeShippingThreshold`

## 2. Use selected shipping service for payment step compatibility

Endpoint:
- `GET /api/payment-methods?shippingServiceId=:shippingServiceId`

Purpose:
- fetch payment methods after shipping selection
- determine which payment methods are selectable for the chosen shipping service

Success response JSON example:
```json
{
  "items": [
    {
      "id": "pm_001",
      "code": "credit_card",
      "name": "Credit Card",
      "status": "active",
      "isBaseMethod": true,
      "isConditionalMethod": false,
      "isSelectable": true,
      "availabilityReason": "available"
    },
    {
      "id": "pm_002",
      "code": "cash_on_delivery",
      "name": "Cash on Delivery",
      "status": "active",
      "isBaseMethod": false,
      "isConditionalMethod": true,
      "isSelectable": true,
      "availabilityReason": "available",
      "extraFee": 25,
      "currency": "TRY",
      "minOrderAmount": null,
      "maxOrderAmount": null
    },
    {
      "id": "pm_003",
      "code": "card_on_delivery",
      "name": "Card on Delivery",
      "status": "active",
      "isBaseMethod": false,
      "isConditionalMethod": true,
      "isSelectable": false,
      "availabilityReason": "not_supported_by_shipping_service"
    }
  ]
}
```

Important response behavior:
- `credit_card` and `bank_transfer` are base methods
- base methods remain selectable when active
- `cash_on_delivery` and `card_on_delivery` are conditional methods
- conditional methods depend on the selected shipping service
- when `shippingServiceId` is omitted, conditional methods may be listed but can be non-selectable with reason `shipping_service_required`

Recommended frontend behavior:
1. After shipping selection, use the selected shipping service id to load payment methods
2. Do not infer payment compatibility only from local shipping config
3. Prefer backend `isSelectable`, `availabilityReason`, and `extraFee` as the source of truth for payment-step UI

## 3. Use selected shipping service when checkout is submitted

Current backend expectation:
- checkout/order submission should send the selected shipping service id

Current request fields used by backend order creation:
```json
{
  "shippingAddressId": "00000000-0000-4000-8000-000000000011",
  "billingAddressId": "00000000-0000-4000-8000-000000000022",
  "shippingServiceId": "00000000-0000-4000-8000-000000000033",
  "paymentMethodId": "00000000-0000-4000-8000-000000000044",
  "notes": "Leave at door"
}
```

Important backend behavior:
- `shippingServiceId` must point to an active public shipping carrier service
- order creation snapshots the selected carrier and service details at order time
- frontend should persist or carry forward the selected shipping service id through checkout flow state

## Frontend field mapping

Frontend currently has local concepts such as:
```ts
type ShippingOptionId = "shipping-company" | "store-pickup";
type ShippingCarrierId = "swiftline" | "northstar" | "primeway";
```

Backend shipping response uses:
```ts
type BackendShippingOption = {
  id: string;
  code: string;
  name: string;
  fee: number;
  status: "active" | "inactive";
  carrierId: string;
  carrierCode: string;
  carrierName: string;
  serviceCode: string;
  serviceName: string;
  price: number;
  currency: string;
  estimatedDeliveryText: string | null;
  supportedPaymentMethods: (
    | "credit_card"
    | "bank_transfer"
    | "cash_on_delivery"
    | "card_on_delivery"
    | string
  )[];
  paymentCollectionFees: {
    paymentMethod: string;
    fee: number;
    currency: string;
    minOrderAmount: number | null;
    maxOrderAmount: number | null;
  }[];
};
```

Field mapping:
- frontend local `ShippingOptionId` -> backend `id` for selected service
- frontend local carrier identifier -> backend `carrierId` or `carrierCode` depending on UI need
- frontend option label -> backend `serviceName`
- frontend carrier label -> backend `carrierName`
- frontend shipping fee -> backend `price`
- frontend ETA text -> backend `estimatedDeliveryText`
- frontend payment support badges -> backend `supportedPaymentMethods`

Important mismatch:
- frontend local `ShippingOptionId` should not remain a hard-coded union
- selected shipping value should become backend `shippingServiceId`
- local carrier ids such as `swiftline` or `northstar` are not backend identifiers
- “pickup” is not currently exposed as a dedicated public checkout endpoint concept; backend currently exposes carrier services such as `branch_delivery` as shipping services

## Recommended frontend integration scope

Implement only the frontend shipping integration for:
- fetching shipping options from backend
- rendering shipping carrier/service cards from backend response
- selecting one shipping service
- storing selected `shippingServiceId` in checkout flow state
- carrying service selection into payment step data loading
- showing loading, empty, and error states for shipping option fetch

Recommended frontend behavior:
1. Replace local shipping seed/config as the primary source with `GET /api/shipping-carriers`
2. Use backend `id` as the selected value and store it as `shippingServiceId`
3. Display `carrierName` + `serviceName` together instead of assuming a 1:1 carrier-option model
4. Use backend `price` instead of recalculating shipping fee differently in frontend
5. Use backend payment capability data to inform the payment step
6. If shipping options request fails, show a recoverable error state and retry path
7. If no options are returned, show an empty-state message and block moving forward

## Recommended frontend type shapes

```ts
type BackendShippingPaymentCollectionFee = {
  paymentMethod: string;
  fee: number;
  currency: string;
  minOrderAmount: number | null;
  maxOrderAmount: number | null;
};

type BackendShippingOption = {
  id: string;
  code: string;
  name: string;
  fee: number;
  status: "active" | "inactive" | string;
  carrierId: string;
  carrierCode: string;
  carrierName: string;
  serviceCode: string;
  serviceName: string;
  price: number;
  currency: string;
  estimatedDeliveryText: string | null;
  supportedPaymentMethods: string[];
  paymentCollectionFees: BackendShippingPaymentCollectionFee[];
};

type BackendShippingOptionListResponse = {
  freeShippingThreshold?: number;
  items: BackendShippingOption[];
};
```
```
