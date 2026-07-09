# Frontend Cart Backend Integration Prompt

<a id="purpose"></a>

## Purpose

This document provides a copy-paste-ready integration prompt for the frontend Codex session.

It owns only the frontend-to-backend cart integration slice:

- current cart fetch;
- add item to cart;
- update cart item quantity;
- remove cart item;
- clear cart;
- cart request/response contract;
- cart validation and basic error handling.

It does not replace the frontend repository's own `architectguide.md`, and it does not define unrelated frontend application areas.

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

Connect the frontend cart flow to the backend using the exact endpoint paths and response shapes below.

Important:
- The frontend currently has no cart integration; implement it using the backend endpoints below
- This backend exposes authenticated-user cart endpoints under `/api/cart`
- Cart ownership is resolved by authenticated user context, not request body
- This backend uses exactly one active cart per authenticated user
- Preserve the existing frontend architecture, API client, routing, caching, and mutation conventions
- Treat all ids as opaque `string` values

## Base

- API base: `{{Backend_URL}}/api`

## Auth requirement

All cart endpoints below require authenticated requests.

Ownership and cardinality:
- cart is user-owned
- the backend resolves cart by authenticated `userId`
- there is only one active cart per authenticated user

Headers:
```txt
Authorization: Bearer <accessToken>
Accept: application/json
```

Unauthenticated behavior:
- status: `401`

## 1. Get current cart

Endpoint:
- `GET /api/cart`

Purpose:
- fetch the current active cart for the signed-in user
- if no cart exists yet, backend may create and return the active cart

Important resource behavior:
- this endpoint returns one cart object, not a cart collection
- this is the current user's owned active cart

Success response JSON:
```json
{
  "id": "crt_001",
  "userId": "usr_001",
  "status": "active",
  "items": [
    {
      "id": "cit_001",
      "cartId": "crt_001",
      "productId": "prd_001",
      "quantity": 2,
      "unitPrice": 1200,
      "discount": 10,
      "finalUnitPrice": 1080,
      "lineTotal": 2160,
      "product": {
        "id": "prd_001",
        "slug": "iphone-15-pro",
        "title": "iPhone 15 Pro",
        "brandName": "Apple",
        "imgUrl": "https://cdn.example.com/products/iphone-15-pro.jpg"
      }
    }
  ],
  "summary": {
    "itemCount": 1,
    "totalQuantity": 2,
    "subtotal": 2400,
    "discountTotal": 240,
    "total": 2160
  }
}
```

Important response behavior:
- `items` is always an array
- `summary` is always present
- `itemCount` is distinct from `totalQuantity`
- `status` currently uses values such as `active`, `checked_out`, `abandoned`
- customer cart flow in this backend is centered on the active cart returned by `GET /api/cart`

Empty cart example:
```json
{
  "id": "crt_001",
  "userId": "usr_001",
  "status": "active",
  "items": [],
  "summary": {
    "itemCount": 0,
    "totalQuantity": 0,
    "subtotal": 0,
    "discountTotal": 0,
    "total": 0
  }
}
```

## 2. Add item to cart

Endpoint:
- `POST /api/cart/items`

Headers:
```txt
Authorization: Bearer <accessToken>
Content-Type: application/json
Accept: application/json
```

Request JSON:
```json
{
  "productId": "00000000-0000-4000-8000-000000000001",
  "quantity": 1
}
```

Request field rules:
- `productId`: required, UUID string
- `quantity`: required, integer, minimum `1`

Success response JSON:
- returns the full cart response shape
- status may be `200` or `201`

Important success behavior:
- if the product is not already in cart, backend creates a new cart item
- if the product is already in cart, backend does not create a duplicate line
- adding the same product again increments the existing item quantity

Validation error:
- status: `400`

Example validation error JSON:
```json
{
  "message": [
    "productId must be a UUID",
    "quantity must not be less than 1"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

Product not found:
- status: `404`

Example not found JSON:
```json
{
  "message": "Product not found",
  "error": "Not Found",
  "statusCode": 404
}
```

## 3. Update cart item quantity

Endpoint:
- `PATCH /api/cart/items/:itemId`

Headers:
```txt
Authorization: Bearer <accessToken>
Content-Type: application/json
Accept: application/json
```

Request JSON:
```json
{
  "quantity": 3
}
```

Request field rules:
- `quantity`: required, integer, minimum `1`

Success response JSON:
- returns the full cart response shape

Not found behavior:
- if `itemId` does not exist or does not belong to the current user cart, backend returns `404`

Example not found JSON:
```json
{
  "message": "Cart item not found",
  "error": "Not Found",
  "statusCode": 404
}
```

## 4. Remove one cart item

Endpoint:
- `DELETE /api/cart/items/:itemId`

Success response JSON:
```json
{
  "success": true
}
```

Not found behavior:
- if `itemId` does not exist or does not belong to the current user cart, backend returns `404`

Example not found JSON:
```json
{
  "message": "Cart item not found",
  "error": "Not Found",
  "statusCode": 404
}
```

Recommended frontend behavior after success:
- either optimistically remove the item from cached cart state
- or invalidate/refetch `GET /api/cart`

## 5. Clear current cart

Endpoint:
- `DELETE /api/cart`

Success response JSON:
```json
{
  "success": true
}
```

Important success behavior:
- backend clears cart items
- backend does not require frontend to send cart id
- after clear, `GET /api/cart` should return the same cart with empty `items`

## Recommended frontend type shapes

```ts
type CartItemProduct = {
  id: string;
  slug: string;
  title: string;
  brandName: string | null;
  imgUrl: string | null;
};

type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  finalUnitPrice: number;
  lineTotal: number;
  product: CartItemProduct;
};

type CartSummary = {
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  discountTotal: number;
  total: number;
};

type CartResponse = {
  id: string;
  userId: string;
  status: 'active' | 'checked_out' | 'abandoned' | string;
  items: CartItem[];
  summary: CartSummary;
};

type CartMutationSuccess = {
  success: true;
};
```

## Required frontend integration scope

Implement only the frontend cart integration for:
- fetching current cart
- rendering cart items and summary from backend response
- add-to-cart mutation
- update-quantity mutation
- remove-item mutation
- clear-cart mutation
- loading, empty, and error states for these flows

Recommended frontend behavior:
1. Load cart from `GET /api/cart` for authenticated users
2. Use backend `summary` directly instead of recalculating totals differently in frontend
3. Use `item.id` for item-level update/remove mutations
4. After add/update/remove/clear, update cache consistently or refetch cart
5. If request returns `401`, treat cart as auth-required and follow app auth handling rules
6. Do not send `userId` or `cartId` in add/update requests because these are not part of the backend request contract
```
