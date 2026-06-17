# Orders Module Preparation Guide

## Purpose

This document is now the single canonical working document for the orders module.

It combines:

- current repo-grounded implementation analysis
- previously discussed design decisions
- remaining open questions
- next implementation plan

This means it replaces the split view of:

- "current analysis"
- "future preparation notes"

with one practical source of truth.

## Current High-Level Status

The current `src/modules/orders` module is structurally meaningful but operationally incomplete.

What already exists:

- order-related entities are defined
- order enums are defined
- demo order seed logic exists
- inventory reservation and commit behavior is already referenced from seed flow
- the module is wired into `AppModule`

What does not exist yet:

- no customer order controller
- no admin order controller
- no runtime `OrdersService`
- no order DTO layer
- no response mapper / response contract implementation
- no real business workflow API surface

So the current module should be understood as:

- schema-first prepared
- seed-assisted
- workflow-incomplete

## Repo-Grounded Current State

### Files Currently Present In `src/modules/orders`

- `entities/`
- `enums/`
- `seed/`
- `orders.module.ts`

Not present yet:

- `controllers/`
- `services/`
- `dto/`
- `responses/`
- `repositories/`
- `mappers/`

This confirms that the orders module is currently a data-model and seed preparation layer, not yet a full runtime business module.

### Current Entity Model

#### `Order`

The aggregate root already includes:

- `orderNumber`
- `userId`
- `orderStatus`
- `paymentStatus`
- `fulfillmentStatus`
- `currency`
- `subtotal`
- `discountTotal`
- `shippingFee`
- `grandTotal`
- `paymentMethodId`
- `paymentProviderId`
- `shippingCarrierId`
- `shippingCarrierServiceId`
- `notes`

Current relations:

- `ManyToOne -> User`
- `ManyToOne -> PaymentMethod`
- `ManyToOne -> PaymentProvider`
- `ManyToOne -> ShippingCarrier`
- `ManyToOne -> ShippingCarrierService`
- `OneToMany -> OrderItem`
- `OneToMany -> OrderAddress`
- `OneToMany -> OrderStatusHistory`
- `OneToOne -> OrderPaymentSnapshot`
- `OneToOne -> OrderShipmentSnapshot`

Assessment:

- good structural foundation exists
- payment/shipping references and snapshot separation are already aligned with intended checkout behavior
- order is already designed as a historical record, not a thin live pointer object

#### `OrderItem`

`OrderItem` already stores useful snapshot data:

- `productId`
- `quantity`
- `unitPrice`
- `discountAmount`
- `lineSubtotal`
- `lineTotal`
- `productTitleSnapshot`
- `productSlugSnapshot`
- `brandNameSnapshot`
- `productImageSnapshot`

Current relations:

- `ManyToOne -> Order` with `CASCADE`
- `ManyToOne -> Product` with `RESTRICT`
- `OneToMany -> InventoryReservation`
- `OneToMany -> InventoryTransaction`

Assessment:

- snapshot direction is correct
- product history preservation is already intentional
- product delete protection is already coupled to orders through `RESTRICT`

#### `OrderAddress`

`OrderAddress` is already modeled as an order-time snapshot, not as a live pointer to the current user address.

Fields include:

- `addressRole`
- `label`
- `fullName`
- `phone`
- `country`
- `city`
- `state`
- `zip`
- `addressLine1`
- `addressLine2`

Assessment:

- this matches the preferred snapshot-based address model

#### `OrderPaymentSnapshot`

Current snapshot fields include:

- payment method id/code/name
- payment provider id/code/name/type
- `providerConfigSnapshot`

Assessment:

- good structure for preserving checkout-time payment metadata
- runtime payment workflow still does not exist, but persistence shape is ready

#### `OrderShipmentSnapshot`

Current snapshot fields include:

- `shippingOption`
- carrier id/code/name
- service id/code/name
- `estimatedDeliveryText`
- `trackingNumber`
- `shipmentPrice`
- `currency`

Assessment:

- structurally ready for shipment metadata preservation

#### `OrderStatusHistory`

Status history already stores:

- `statusType`
- `fromValue`
- `toValue`
- `note`

Assessment:

- generic and useful structure exists
- runtime transition ownership is still missing

### Current Enum Baseline

Already implemented:

- `OrderStatus`
  - `PENDING`
  - `CONFIRMED`
  - `CANCELLED`
  - `COMPLETED`

- `PaymentStatus`
  - `PENDING`
  - `UNPAID`
  - `PAID`
  - `FAILED`
  - `REFUNDED`
  - `PARTIALLY_REFUNDED`

- `FulfillmentStatus`
  - `PENDING`
  - `READY_FOR_SHIPMENT`
  - `HANDED_OVER`
  - `DELIVERED`
  - `DELIVERY_FAILED`
  - `RETURNED`

- `OrderStatusType`
  - `ORDER`
  - `PAYMENT`
  - `FULFILLMENT`

- `OrderAddressRole`
  - `shipping`
  - `billing`

- `ShippingOption`
  - `carrier`
  - `pickup`

Assessment:

- enums are already richer than the live module surface
- the main missing piece is transition enforcement, not enum definition

## Current Seed Behavior

### `DemoOrdersSeedService`

The most concrete business behavior in the current module lives inside demo seed logic.

Current seed flow:

1. find demo user
2. find shipping and billing addresses
3. find payment method and optional provider
4. find shipping carrier and shipping service
5. find demo products
6. require inventory records for those products
7. calculate subtotal, discount total, shipping fee, and grand total
8. create:
   - `Order`
   - `OrderPaymentSnapshot`
   - `OrderShipmentSnapshot`
   - `OrderAddress`
   - `OrderStatusHistory`
   - `OrderItem`
   - `InventoryReservation`
   - `InventoryTransaction`
9. mutate inventory according to fulfillment state

### What The Seed Already Encodes

The seed logic already reveals intended business rules:

- active reservation case:
  - reservation becomes `ACTIVE`
  - `reservedQuantity` increases
  - `RESERVE` transaction is written

- delivered/committed case:
  - reservation becomes `COMMITTED`
  - `onHandQuantity` decreases
  - `RESERVE` and `COMMIT` transactions are written

This means the repo already expresses the intended inventory direction:

- order create can imply reservation
- delivered state can imply commit

But that logic still exists only in seed semantics, not in runtime order services.

## What The Current Module Already Proves

Even without controllers or services, the current state already proves:

- order data is intended to be snapshot-driven
- payment and shipping references are preserved both as relations and snapshots
- inventory integration is intentional for tracked demo flows
- order items are intended to preserve product history even if product data changes later
- order hard-delete is not meant to be a normal business operation

## Important Existing Couplings

### Product Delete Coupling

`OrderItem -> Product` uses `RESTRICT`.

This is correct for order history preservation and means:

- product hard delete must always respect existing order items
- product and order lifecycle are already coupled at database level

### Inventory Coupling

Current behavior already assumes:

- tracked products have inventory records
- order seed can create reservations and commit transactions
- inventory reservation and inventory commit are meaningful order-side concepts

### Seed Ordering Sensitivity

Recent work already showed that order seed depends on initialization order of:

- products
- inventory
- addresses
- shipping carriers
- payment methods

So the module currently behaves as a structural integrator, but not yet as a clean isolated runtime module.

## Current Gaps

### Missing Runtime Business Layer

There is currently no:

- create order service
- cancel order service
- status transition service
- customer order list/detail service
- admin order management service

### Missing API Surface

There are no live endpoints yet for:

- customer order creation
- my orders list
- my order detail
- cancel
- admin list/detail
- admin status update

### Missing DTO / Response Layer

The persistence model is ahead of the API layer.

Not defined yet:

- request DTOs
- query DTOs
- response classes
- response mappers

### Business Rules Are Still Implicit

Important rules still live only in assumptions and seed code:

- when to reserve stock
- when to commit stock
- when to release stock
- which fulfillment transitions are valid
- which order transitions are valid
- whether untracked products fully bypass inventory flow

## Existing Planning Decisions

These are the key design decisions already discussed and should be treated as the current working direction.

### 1. Order Domain Scope

Primary scope:

- order should be created from checkout flow
- admin manual order creation is still a design item
- guest checkout is still an open design item

### 2. Snapshot Policy

Agreed direction:

- product data should be snapshotted into `OrderItem`
- shipping/billing addresses should be snapshotted into `OrderAddress`
- payment/shipping metadata should be snapshotted into dedicated snapshot tables

### 3. Price Calculation Responsibility

Current intended direction:

- checkout should calculate totals
- order should persist those calculated values as historical record

This implies:

- checkout is the calculator
- order is the durable business record

### 4. Inventory Policy

Current working decision:

- `isTrackedInventory` is a real business field on `Product`
- `isTrackedInventory = true` means product participates in stock tracking
- `isTrackedInventory = false` means inventory reservation / transaction flow should not apply

Tracked product rules:

- inventory record is required
- order create should reserve, not immediately commit
- cancel should release
- shipped/delivered style completion should commit

Summary:

- order create = reserve
- cancel = release
- shipped/delivered phase = commit

### 5. Delete / Cancel / Archive Direction

Current working direction:

- order should not be hard-deleted as a routine business action
- cancel should be a business action, not a delete
- admin delete is likely not part of the main model

### 6. API Surface Direction

Customer side target:

- create order
- my orders list
- my order detail
- cancel own order

Admin side target:

- orders list
- order detail
- status update
- payment/shipping update

## Open Questions Still Not Finalized

### 1. Cart -> Order Idempotency

Still needs a clear rule:

- how to prevent creating the same order twice from the same cart

### 2. Cart Lifecycle Meaning

Still needs explicit clarification:

- whether cart itself should gain a meaningful lifecycle status
- or remain a persistent container whose real mutations happen only on cart items

### 3. RBAC And Ownership

Still needs explicit policy:

- can customer only see own orders
- what can `ORDER_MANAGER` change
- what is `SUPPORT_STAFF` read-only scope
- who may change which status family

### 4. Guest Checkout

Still undecided:

- whether guest checkout should exist
- if yes, whether a temporary customer identity or different snapshot path is needed

### 5. Audit Log

Still open:

- whether order/payment/fulfillment changes should write explicit audit JSON with old/new values and actor metadata

Recommended current direction:

- do not block first implementation on a dedicated audit log subsystem
- keep `OrderStatusHistory` as the minimum built-in history mechanism
- track richer audit logging as a follow-up feature if needed

## Two-Phase Implementation Plan

### Phase 1: Structural Update

Goal:

- make the orders module minimally real and testable in runtime, not only structurally prepared

Focus:

- entities
- enums
- relations
- snapshot fields
- DTO and response contract preparation
- customer-facing read surface
- first disposable order lifecycle
- inventory-linked order creation and cancellation verification
- documentation updates

This phase should make these areas explicit:

- field lists
- enum lists
- relation directions
- snapshot payload boundaries
- current status fields
- product-level inventory policy such as `isTrackedInventory`
- how an order is created, read back, cancelled, and observed in inventory during test execution

This phase is for:

- making the schema coherent
- preparing product and inventory for order integration
- opening the first real runtime order flow
- making the module testable in Postman/Newman with a safe end-to-end order lifecycle

Phase 1 should now cover this minimum executable flow:

1. prepare cart
2. create order
3. read order detail
4. cancel order
5. observe inventory effect
6. verify final result

This means Phase 1 is no longer "read only".

It is the first runtime-complete and testable order slice.

### Phase 2: Workflow / Business Rule Update

Goal:

- expand the orders domain from the first executable lifecycle into a richer and stricter workflow model

Focus:

- status transition rules
- payment-type specific workflow behavior
- inventory reserve / commit / release flow
- transaction boundaries
- order history write rules
- tracked product lifecycle handling

Recommended approach:

- prefer action-driven workflow instead of one generic "patch everything" status mutation style

Phase 2 should therefore start after the basic Phase 1 order lifecycle is already working and testable.

Phase 2 is for:

- richer admin/customer actions
- stricter transition enforcement
- broader payment and fulfillment behaviors
- deeper inventory lifecycle rules
- larger workflow coverage beyond the first create/cancel slice

Candidate actions:

- `confirmOrder`
- `markReadyForShipment`
- `handOverOrder`
- `markDelivered`
- `markDeliveryFailed`
- `markReturned`
- `restockReturnedItems`
- admin cancellation refinements

## Recommended Implementation Order

The best next implementation order is:

1. create `OrdersService`
2. add customer-facing minimum read model
   - my orders list
   - my order detail
3. add checkout-to-order creation flow
4. add cancellation and inventory release behavior
5. verify the basic executable flow in Postman/Newman
   - prepare cart
   - create order
   - read detail
   - cancel order
   - observe inventory effect
   - verify final result
6. add admin list/detail/status update flow
7. add stronger RBAC and ownership checks
8. implement richer workflow transitions and inventory commit behavior
9. expand workflow and coverage before entering Phase 3 hardening

## Readiness Assessment

### Ready

- entity foundation
- snapshot structure
- enum baseline
- demo seed for structural verification
- product/order delete protection coupling

### Partially Ready

- inventory-integrated order semantics
- payment/shipping snapshot persistence
- status history model

### Not Ready Yet

- live order APIs
- runtime workflow service layer
- DTO / response layer
- customer/admin RBAC behavior
- cancellation and release logic
- transition policy enforcement

## Conclusion

The current `src/modules/orders` module is not a placeholder.

It already has a serious structural core:

- order aggregate
- item snapshots
- address snapshots
- payment snapshots
- shipment snapshots
- status history
- demo seed that already exercises reservation and commit concepts

But it is still not a complete runtime business module.

The missing layer is the actual order application workflow:

- service ownership
- API surface
- DTO and response contracts
- status transition enforcement
- customer/admin behavior rules

In short:

- data model: meaningfully prepared
- business API: not implemented yet
- seed semantics: valuable, but not a substitute for runtime workflow
