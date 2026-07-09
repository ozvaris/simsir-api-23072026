# Frontend Checkout Address Backend Integration Prompt

<a id="purpose"></a>

## Purpose

This document provides a copy-paste-ready integration prompt for the frontend Codex session.

It owns only the frontend-to-backend checkout address integration slice:

- loading authenticated user addresses for checkout;
- selecting shipping and billing addresses for checkout;
- using default shipping and billing addresses;
- checkout address request/response contract;
- checkout field mapping against backend address shape;
- validation and basic error handling.

It does not replace the frontend repository's own `architectguide.md`, and it does not define unrelated checkout, cart, payment, or order UI areas.

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

Connect the frontend checkout address flow to the backend using the exact endpoint paths and response shapes below.

Important:
- The frontend already has address-book backend integration
- The backend currently does not expose a dedicated checkout-address endpoint
- Checkout should reuse the authenticated user's saved addresses
- Shipping and billing address selection should use saved address ids
- The backend is authoritative for persisted addresses and address ownership
- Preserve the existing frontend architecture, API client, routing, caching, and mutation conventions
- Treat all ids as opaque `string` values

## Base

- API base: `{{Backend_URL}}/api`

## Auth requirement

All endpoints below require authenticated requests.

Headers:
```txt
Authorization: Bearer <accessToken>
Accept: application/json
```

Unauthenticated behavior:
- status: `401`

## Current backend reality

Important:
- there is no dedicated `/api/checkout/addresses` endpoint right now
- there is no checkout draft endpoint for address persistence right now
- there is no backend field for checkout-only `email` or `company` on address records
- checkout address selection should currently be based on saved account addresses
- order creation currently expects `shippingAddressId` and `billingAddressId`

## 1. List saved addresses for checkout

Endpoint:
- `GET /api/users/me/addresses`

Optional filter:
- `GET /api/users/me/addresses?type=shipping`
- `GET /api/users/me/addresses?type=billing`

Purpose:
- fetch authenticated user's saved addresses
- use them in checkout shipping/billing selectors
- derive default shipping and default billing records from `isDefault`

Success response JSON:
```json
{
  "items": [
    {
      "id": "adr_001",
      "userId": "usr_001",
      "type": "shipping",
      "label": "Home",
      "fullName": "Jane Doe",
      "phone": "+1 555 000 0000",
      "country": "United States",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "addressLine1": "350 5th Ave",
      "addressLine2": "Floor 21",
      "isDefault": true
    },
    {
      "id": "adr_002",
      "userId": "usr_001",
      "type": "billing",
      "label": "Office",
      "fullName": "Jane Doe",
      "phone": "+1 555 000 0000",
      "country": "United States",
      "city": "New York",
      "state": null,
      "zip": "10018",
      "addressLine1": "11 Times Sq",
      "addressLine2": null,
      "isDefault": true
    }
  ]
}
```

Important response behavior:
- response is an object with `items`
- `items` is always an array
- each address has `type` as either `shipping` or `billing`
- default selection is not returned in a separate object
- frontend should infer defaults by finding `isDefault === true` within each type

Recommended frontend behavior:
1. Load all addresses on checkout entry using `GET /api/users/me/addresses`
2. Split the returned `items` into shipping and billing groups by `type`
3. Preselect the first `isDefault === true` shipping address if present
4. Preselect the first `isDefault === true` billing address if present
5. If `sameAsShipping` is enabled, reuse the selected shipping address in UI state

## 2. Create a new saved address from checkout flow

Endpoint:
- `POST /api/users/me/addresses`

Headers:
```txt
Authorization: Bearer <accessToken>
Content-Type: application/json
Accept: application/json
```

Request JSON:
```json
{
  "type": "shipping",
  "label": "Home",
  "fullName": "Jane Doe",
  "phone": "+1 555 000 0000",
  "country": "United States",
  "city": "New York",
  "state": "NY",
  "zip": "10001",
  "addressLine1": "350 5th Ave",
  "addressLine2": "Floor 21",
  "isDefault": true
}
```

Request field rules:
- `type`: required, `shipping` or `billing`
- `label`: required string, max length `100`
- `fullName`: required string, max length `150`
- `phone`: required string, max length `30`
- `country`: required string, max length `100`
- `city`: required string, max length `100`
- `state`: optional string or `null`, max length `100`
- `zip`: optional string or `null`, max length `20`
- `addressLine1`: required string, max length `255`
- `addressLine2`: optional string or `null`, max length `255`
- `isDefault`: optional boolean

Success response JSON:
- returns the created address object

Important success behavior:
- if `isDefault` is `true`, backend unsets the previous default for the same address `type`
- created address belongs to authenticated user

## 3. Update a saved address from checkout flow

Endpoint:
- `PATCH /api/users/me/addresses/:addressId`

Headers:
```txt
Authorization: Bearer <accessToken>
Content-Type: application/json
Accept: application/json
```

Request JSON example:
```json
{
  "label": "Home",
  "fullName": "Jane Doe",
  "phone": "+1 555 111 1111",
  "country": "United States",
  "city": "Brooklyn",
  "state": "NY",
  "zip": "11201",
  "addressLine1": "1 Main St",
  "addressLine2": null,
  "isDefault": true
}
```

Success response JSON:
- returns the updated address object

Not found behavior:
- if `addressId` does not exist or does not belong to authenticated user, backend returns `404`

Example not found JSON:
```json
{
  "message": "Address not found",
  "error": "Not Found",
  "statusCode": 404
}
```

Important success behavior:
- if `isDefault` is `true`, backend unsets the previous default for the same address type

## 4. Delete a saved address from checkout flow

Endpoint:
- `DELETE /api/users/me/addresses/:addressId`

Success response JSON:
```json
{
  "success": true
}
```

Not found behavior:
- if `addressId` does not exist or does not belong to authenticated user, backend returns `404`

Important success behavior:
- if the deleted record was the default of its type, backend promotes the first remaining address of the same type to default

## 5. Use selected addresses when checkout is submitted

Current backend expectation:
- checkout does not currently submit full address objects
- checkout/order submission should send saved address ids

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
- `shippingAddressId` must belong to the authenticated user
- `billingAddressId` must belong to the authenticated user
- `shippingAddressId` must point to an address with `type: "shipping"`
- `billingAddressId` must point to an address with `type: "billing"`
- order flow snapshots address data at order creation time
- later changes to account addresses do not change the stored order address snapshot

## Frontend field mapping

Checkout form fields currently used in frontend:
```ts
{
  fullName: string;
  email: string;
  phone: string;
  company: string;
  zip: string;
  country: string;
  address1: string;
  address2: string;
}
```

Backend account address fields:
```ts
{
  label: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  state: string | null;
  zip: string | null;
  addressLine1: string;
  addressLine2: string | null;
  isDefault: boolean;
  type: "shipping" | "billing";
}
```

Field mapping:
- frontend `fullName` -> backend `fullName`
- frontend `phone` -> backend `phone`
- frontend `country` -> backend `country`
- frontend `zip` -> backend `zip`
- frontend `address1` -> backend `addressLine1`
- frontend `address2` -> backend `addressLine2`
- frontend `email` -> not part of backend address contract
- frontend `company` -> not part of backend address contract
- backend `city` -> required in backend address contract
- backend `state` -> optional in backend address contract
- backend `label` -> required in backend address contract
- backend `type` -> required in backend address contract
- backend `isDefault` -> optional create/update field, available in response

Important mismatch:
- frontend checkout shape is not enough to create a backend address as-is
- backend requires `label`, `city`, and `type`
- frontend `email` and `company` should not be sent to address endpoints unless backend contract changes in the future

## Recommended frontend integration scope

Implement only the frontend checkout-address integration for:
- fetching saved addresses for authenticated checkout users
- rendering shipping and billing address options from backend response
- preselecting default shipping and billing addresses from `isDefault`
- selecting a saved address for shipping
- selecting a saved address for billing
- optionally creating or updating saved addresses through existing address endpoints
- sending `shippingAddressId` and `billingAddressId` during checkout/order submission
- handling loading, empty, and error states for these flows

Recommended frontend behavior:
1. Prefer `GET /api/users/me/addresses` as the primary checkout address source
2. Use `?type=shipping` or `?type=billing` only if a split query better matches frontend architecture
3. Do not expect a dedicated backend default-address endpoint right now
4. Do not send full address objects when backend expects address ids for checkout submit
5. Do not send `email` or `company` to address endpoints
6. If checkout UI allows creating a new address, collect backend-required missing fields such as `label`, `city`, and `type`
7. If request returns `401`, treat checkout address flow as auth-required and follow app auth handling rules

## Recommended frontend type shapes

```ts
type BackendAccountAddressType = "shipping" | "billing";

type BackendAccountAddress = {
  id: string;
  userId: string;
  type: BackendAccountAddressType;
  label: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  state: string | null;
  zip: string | null;
  addressLine1: string;
  addressLine2: string | null;
  isDefault: boolean;
};

type BackendAccountAddressListResponse = {
  items: BackendAccountAddress[];
};

type CheckoutAddressSelectionPayload = {
  shippingAddressId: string;
  billingAddressId: string;
};

type MutationSuccess = {
  success: true;
};
```
```
