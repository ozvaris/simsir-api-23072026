# Shipping Carrier Payment Capabilities Update

## Goal

Update the `shipping-carriers` module so each shipping carrier can declare whether it supports `cash_on_delivery` and/or `card_on_delivery`.

This is needed because checkout selects shipping before payment. The payment step must be able to show only the payment methods that are compatible with the selected shipping carrier, and the frontend should be able to display supported kapida payment services on the shipping selection card.

## Read First

Canonical docs:

- `docs/basearchitecturedocs/architectureguide.md`
- `docs/basearchitecturedocs/nestjs-api-contract.md`
- `docs/basearchitecturedocs/nestjs-entities-and-relations.md`
- `docs/basearchitecturedocs/backend-module-patterns.md`

Relevant source files:

- `src/modules/shipping-carriers/`
- `src/modules/payments/` or existing payment method enum/source files, only to reuse existing payment method codes if already defined
- existing migration/seed files related to shipping carriers, if any

## Required Change

Add carrier-level payment capability support for kapida payment methods.

A shipping carrier must be able to declare zero, one, or both of these capabilities:

```txt
cash_on_delivery
card_on_delivery
```

Recommended model:

```txt
ShippingCarrierPaymentCapability
- id
- shippingCarrierId
- paymentMethod
- isActive
- fee
- minOrderAmount
- maxOrderAmount
- sortOrder
- createdAt
- updatedAt
```

Rules:

1. `paymentMethod` must only allow:
   - `cash_on_delivery`
   - `card_on_delivery`
2. Do not treat `credit_card` or `bank_transfer` as carrier capabilities.
3. A carrier must not have duplicate capability records for the same `paymentMethod`.
4. `fee` must be non-negative.
5. If both `minOrderAmount` and `maxOrderAmount` exist, `minOrderAmount` must not be greater than `maxOrderAmount`.
6. Public shipping responses must include only active payment capabilities.
7. Admin shipping responses may include active and inactive payment capabilities.
8. Existing shipping carrier create/update/list/detail behaviour must remain compatible unless the current module pattern requires a narrow DTO extension.

Expose the capability data in the public shipping selection response so the frontend can show badges or labels such as:

```txt
Kapida nakit +25 TL
Kapida kredi karti +35 TL
```

Suggested response shape for public shipping options/carriers:

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

If the existing module already has a different public response mapper shape, keep the existing shape and add equivalent capability fields without breaking existing fields.

## Keep Unchanged

- Do not change the main payment method design.
- Do not implement real payment provider integrations.
- Do not change online card provider logic such as PayTR, iyzico, PayU, virtual POS, or bank transfer accounts.
- Do not rename existing shipping carrier tables, columns, endpoint paths, or carrier codes unless a migration is strictly required for the new capability table.
- Do not change unrelated shipping price, zone, address, or delivery calculation logic.
- Do not change order creation or checkout finalization logic in this prompt.
- Do not create new permissions unless the existing shipping-carriers module pattern requires one. Prefer existing shipping-carrier admin permissions.
- Do not generate or update Postman collections in this prompt.

## Out of Scope

- Filtering payment methods in the payment module.
- Implementing `GET /api/checkout/payment-methods?shippingOptionId=...`.
- Order/payment snapshot changes.
- Real kapida tahsilat settlement logic.
- Cargo company API integrations.
- Mobile POS integration.
- Frontend implementation.

## Implementation Notes

- Follow the existing module/entity/repository/service/controller/DTO/mapper patterns.
- If a new table is needed, prefer a clear name such as `shipping_carrier_payment_capabilities`, unless the project has a different naming convention.
- Add a unique constraint/index on `(shippingCarrierId, paymentMethod)`.
- Reuse the existing project enum for payment methods if available. If not available, define a narrow enum in the appropriate shared/payment location according to existing project structure.
- Seed capability examples only if the project already seeds shipping carriers. Seed operations must be idempotent.
- Public mappers should not expose inactive capabilities.
- Admin mappers should make capability status visible.
- Keep the update narrow and module-focused.

## Required Result Report

After implementation, report briefly:

- files changed;
- final carrier payment capability behaviour;
- endpoint/response changes;
- permission changes or confirmation that permissions stayed unchanged;
- database/table/entity/migration impact;
- seed changes, if any;
- Postman test impact, but do not generate collections;
- commands run;
- build/lint/test results;
- intentionally deferred items.
