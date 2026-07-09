# Shipping Carrier Payment Capabilities Update V2

## Goal

Update the `shipping-carriers` module so shipping carriers can have delivery services/options, and kapida payment capabilities belong to each shipping service/option.

Checkout selects shipping before payment. Therefore the public shipping response must show which kapida payment methods each selected shipping service supports before the user moves to the payment step.

Target hierarchy:

```txt
ShippingCarrier
  └─ ShippingCarrierService
       └─ ShippingCarrierServicePaymentCapability
```

Example:

```txt
Aras Kargo
  ├─ Standart Teslimat
  │    ├─ cash_on_delivery supported
  │    └─ card_on_delivery supported
  │
  └─ Ekspres Teslimat
       ├─ cash_on_delivery not supported
       └─ card_on_delivery not supported
```

## Read First

Canonical docs:

- `docs/basearchitecturedocs/architectureguide.md`
- `docs/basearchitecturedocs/nestjs-api-contract.md`
- `docs/basearchitecturedocs/nestjs-entities-and-relations.md`
- `docs/basearchitecturedocs/backend-module-patterns.md`

Relevant source files:

- `src/modules/shipping-carriers/`
- existing shipping carrier entity/repository/service/controller/DTO/mapper files
- existing migration/seed files related to shipping carriers, if any
- existing payment method enum/source files, only to reuse existing payment method codes if already defined

## Required Change

Add service-level shipping payment capability support.

### 1. Keep `ShippingCarrier` as the carrier/company entity

`ShippingCarrier` should represent only the carrier/company, for example:

```txt
aras_kargo
mng_kargo
yurtici_kargo
hepsijet
```

Do not store kapida payment support directly on `ShippingCarrier`.

Expected intent:

```txt
ShippingCarrier
- id
- code
- name
- description
- logoUrl
- status
- sortOrder
- createdAt
- updatedAt
```

Keep existing fields if the project already has them.

### 2. Add or reuse `ShippingCarrierService`

A carrier may have one or more delivery services/options.

If an existing `ShippingService`, `ShippingOption`, or equivalent entity already exists, extend that entity instead of creating a duplicate.

If no equivalent entity exists, add a new service entity with this intent:

```txt
ShippingCarrierService
- id
- shippingCarrierId
- code
- name
- description
- price
- currency
- estimatedDeliveryText
- status
- sortOrder
- createdAt
- updatedAt
```

Examples:

```txt
standard_delivery -> Standart Teslimat
express_delivery  -> Ekspres Teslimat
same_day_delivery -> Ayni Gun Teslimat
branch_delivery   -> Magazadan Teslim
```

The checkout shipping selection should identify the selected shipping service/option, not only the carrier.

### 3. Add `ShippingCarrierServicePaymentCapability`

Each shipping service/option may support zero, one, or both kapida payment methods.

Expected intent:

```txt
ShippingCarrierServicePaymentCapability
- id
- shippingCarrierServiceId
- paymentMethod
- isActive
- fee
- currency
- minOrderAmount
- maxOrderAmount
- sortOrder
- createdAt
- updatedAt
```

`paymentMethod` must only allow:

```txt
cash_on_delivery
card_on_delivery
```

Do not use this capability table for:

```txt
credit_card
bank_transfer
```

Those methods belong to the payment module and are not shipping service collection capabilities.

### 4. Validation and database rules

Implement these rules according to the existing project patterns:

1. A shipping carrier service belongs to exactly one shipping carrier.
2. A payment capability belongs to exactly one shipping carrier service.
3. A service must not have duplicate capability records for the same `paymentMethod`.
4. Add a unique constraint/index on `(shippingCarrierId, code)` for services.
5. Add a unique constraint/index on `(shippingCarrierServiceId, paymentMethod)` for capabilities.
6. `price` must be non-negative.
7. `fee` must be non-negative.
8. If both `minOrderAmount` and `maxOrderAmount` exist, `minOrderAmount` must not be greater than `maxOrderAmount`.
9. Public responses must include only active carriers, active services, and active capabilities.
10. Admin responses may include inactive services/capabilities according to the existing admin module pattern.

### 5. Public shipping response

Expose service-level payment capability data in the public shipping selection response so the frontend can show labels such as:

```txt
Standart Teslimat
Kapida nakit +25 TL
Kapida kredi karti +35 TL
```

Required public response intent:

```json
{
  "id": "...",
  "carrierCode": "aras_kargo",
  "carrierName": "Aras Kargo",
  "serviceName": "Standart Teslimat",
  "price": 79,
  "estimatedDeliveryText": "2-3 is gunu",
  "supportedPaymentMethods": [
    "cash_on_delivery",
    "card_on_delivery"
  ],
  "paymentCollectionFees": [
    {
      "paymentMethod": "cash_on_delivery",
      "fee": 25,
      "minOrderAmount": null,
      "maxOrderAmount": null
    },
    {
      "paymentMethod": "card_on_delivery",
      "fee": 35,
      "minOrderAmount": null,
      "maxOrderAmount": null
    }
  ]
}
```

Important response intent:

- `id` should identify the selected shipping service/option, not only the carrier.
- `carrierCode` and `carrierName` should still be available for display.
- `supportedPaymentMethods` should be derived from active capability records.
- `paymentCollectionFees` should include fee and amount limit data for active capability records.
- If the existing public response mapper already has a different shape, keep existing fields compatible and add equivalent service-level capability fields.

### 6. Admin behaviour

Follow the existing `shipping-carriers` admin pattern.

Support managing services and service payment capabilities in the narrowest way that fits the current module structure.

If the module currently uses nested DTOs for carrier configuration, extend those DTOs carefully.

If the module currently uses separate admin endpoints for child records, add narrow service/capability endpoints under the existing shipping-carriers admin boundary.

Do not create a broad new shipping architecture in this prompt.

## Keep Unchanged

- Do not change the main payment method design.
- Do not implement real payment provider integrations.
- Do not change online card provider logic such as PayTR, iyzico, PayU, virtual POS, or bank transfer accounts.
- Do not store kapida payment support directly on `ShippingCarrier` if service-level support is implemented.
- Do not rename existing carrier codes or existing endpoint paths unless the current codebase requires a narrow additive endpoint for services/capabilities.
- Do not change unrelated zone, address, stock, cart, product, category, or order logic.
- Do not change order creation or checkout finalization logic in this prompt.
- Do not create new permissions unless the existing shipping-carriers module pattern requires them. Prefer existing shipping-carrier admin permissions.
- Do not generate or update Postman collections in this prompt.

## Out of Scope

- Filtering payment methods in the payment module.
- Implementing `GET /api/checkout/payment-methods?shippingServiceId=...`.
- Order/payment/shipping snapshot changes.
- Real kapida tahsilat settlement logic.
- Cargo company API integrations.
- Mobile POS integration.
- Frontend implementation.
- Full shipping rate engine or zone-based delivery pricing redesign.

## Implementation Notes

- Follow existing module/entity/repository/service/controller/DTO/mapper patterns.
- Prefer table names such as:
  - `shipping_carrier_services`
  - `shipping_carrier_service_payment_capabilities`
- Reuse existing `RecordStatus` or equivalent status pattern.
- Reuse the existing project enum for payment methods if available.
- If there is no shared payment method enum yet, define the narrowest enum in the appropriate shared/payment location according to the current project structure.
- Keep `cash_on_delivery` and `card_on_delivery` as exact method codes.
- Use the existing decimal/money handling pattern for `price`, `fee`, `minOrderAmount`, and `maxOrderAmount`.
- Use the existing currency handling pattern. If the project has no currency pattern, keep the change minimal and default to the existing project convention.
- Use explicit repository methods where useful, for example fetching active services with active capabilities for the public response.
- Do not load unrelated relations only to build the public response.
- Seed service/capability examples only if the project already seeds shipping carriers.
- Seed operations must be idempotent.
- Avoid silent cascade deletes unless the project already uses that pattern for child configuration records.
- Keep the update narrow and module-focused.

## Required Result Report

After implementation, report briefly:

- files changed;
- final entity/relation structure;
- final shipping service and payment capability behaviour;
- endpoint/response changes;
- permission changes or confirmation that permissions stayed unchanged;
- database/table/entity/migration impact;
- seed changes, if any;
- Postman test impact, but do not generate collections;
- commands run;
- build/lint/test results;
- intentionally deferred items.
