# NestJS API Contract

<a id="purpose"></a>

## Purpose

This document defines the REST API surface expected by the frontend.

It includes:

- endpoint paths;
- controller and service expectations;
- request JSON examples;
- response JSON examples;
- common error response examples;
- suggested implementation order.

This document is not an architecture guide and is not an entity schema document.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Conventions](#conventions)
- [Auth API](#auth-api)
- [Users API](#users-api)
- [Addresses API](#addresses-api)
- [Categories API](#categories-api)
- [Products API](#products-api)
- [Inventory Admin API](#inventory-admin-api)
- [Cart API](#cart-api)
- [Checkout Reference API](#checkout-reference-api)
- [Orders API](#orders-api)
- [Common Error JSON](#common-error-json)
- [Recommended Build Order](#recommended-build-order)

<a id="conventions"></a>

## Conventions

- Base path examples use `/api`.
- IDs are strings.
- Money values are represented as numbers in response JSON.
- Protected endpoints require authenticated user context.
- Public endpoints must be explicitly documented.
- Request bodies are represented by DTO classes.
- Response bodies are represented by `Response` suffix classes.

<a id="auth-api"></a>

## Auth API

### `POST /api/auth/register`

Purpose:

- create a user account;
- create credential record;
- return authenticated user and tokens when JWT flow is enabled.

Request JSON:

```json
{
  "email": "hazel.martin@example.com",
  "password": "Password123!",
  "name": "Hazel",
  "surname": "Martin",
  "phone": "+1 202 555 0189"
}
```

Response JSON:

```json
{
  "user": {
    "id": "usr_001",
    "email": "hazel.martin@example.com",
    "userName": "hazel.martin",
    "name": "Hazel",
    "surname": "Martin",
    "phone": "+1 202 555 0189"
  },
  "accessToken": "access-token",
  "refreshToken": "refresh-token"
}
```

### `POST /api/auth/login`

Purpose:

- validate credentials;
- return authenticated user and tokens.

Request JSON:

```json
{
  "email": "hazel.martin@example.com",
  "password": "Password123!"
}
```

Response JSON:

```json
{
  "user": {
    "id": "usr_001",
    "email": "hazel.martin@example.com",
    "userName": "hazel.martin",
    "name": "Hazel",
    "surname": "Martin",
    "phone": "+1 202 555 0189"
  },
  "accessToken": "access-token",
  "refreshToken": "refresh-token"
}
```

### `POST /api/auth/refresh`

Purpose:

- verify refresh token;
- issue new access and refresh tokens.

Request JSON:

```json
{
  "refreshToken": "refresh-token"
}
```

Response JSON:

```json
{
  "user": {
    "id": "usr_001",
    "email": "hazel.martin@example.com",
    "userName": "hazel.martin",
    "name": "Hazel",
    "surname": "Martin",
    "phone": "+1 202 555 0189"
  },
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

### `POST /api/auth/logout`

Purpose:

- end client authentication flow.

Response JSON:

```json
{
  "success": true
}
```

### `GET /api/auth/me`

Purpose:

- return current authenticated user.

Response JSON:

```json
{
  "id": "usr_001",
  "email": "hazel.martin@example.com",
  "userName": "hazel.martin",
  "name": "Hazel",
  "surname": "Martin",
  "phone": "+1 202 555 0189",
  "createdAt": "2025-01-12T10:30:00.000Z",
  "updatedAt": "2026-06-18T01:55:00.000Z"
}
```

### `GET /api/auth/me/access`

Purpose:

- return current authenticated user's authorization summary;
- support frontend role and permission aware UI decisions.

Response JSON:

```json
{
  "userId": "usr_001",
  "email": "hazel.martin@example.com",
  "userName": "hazel.martin",
  "roles": ["CUSTOMER"],
  "permissions": [],
  "isAdmin": false
}
```

### `GET /api/auth/me/access-summary`

Purpose:

- return current authenticated user's authorization summary;
- provide an explicit alias for access summary consumers.

Response JSON:

```json
{
  "userId": "usr_001",
  "email": "hazel.martin@example.com",
  "userName": "hazel.martin",
  "roles": ["CUSTOMER"],
  "permissions": [],
  "isAdmin": false
}
```

<a id="users-api"></a>

## Users API

### `GET /api/users/me`

Purpose:

- fetch current account profile.

Response JSON:

```json
{
  "id": "usr_001",
  "email": "hazel.martin@example.com",
  "userName": "hazel.martin",
  "name": "Hazel",
  "surname": "Martin",
  "phone": "+1 202 555 0189"
}
```

### `PATCH /api/users/me`

Purpose:

- update current account profile.

Request JSON:

```json
{
  "email": "hazel.martin@example.com",
  "userName": "hazel.martin",
  "name": "Hazel",
  "surname": "Martin",
  "phone": "+1 202 555 0199"
}
```

Response JSON:

```json
{
  "id": "usr_001",
  "email": "hazel.martin@example.com",
  "userName": "hazel.martin",
  "name": "Hazel",
  "surname": "Martin",
  "phone": "+1 202 555 0199",
  "createdAt": "2025-01-12T10:30:00.000Z",
  "updatedAt": "2026-06-18T01:55:00.000Z"
}
```

### `PATCH /api/users/me/password`

Purpose:

- change current account password.

Request JSON:

```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

Response JSON:

```json
{
  "success": true
}
```

### `PATCH /api/admin/users/:userId/password`

Purpose:

- allow `SUPER_ADMIN` to reset a user's password when the user cannot access their account.

Request JSON:

```json
{
  "newPassword": "NewPassword456!"
}
```

Response JSON:

```json
{
  "success": true
}
```

<a id="addresses-api"></a>

## Addresses API

### `GET /api/users/me/addresses`

Purpose:

- list current user's saved addresses;
- optionally filter by address type.

Query params:

- `type=shipping|billing`

Response JSON:

```json
{
  "items": [
    {
      "id": "addr_001",
      "userId": "usr_001",
      "type": "shipping",
      "label": "Home",
      "fullName": "Hazel Martin",
      "phone": "+1 202 555 0189",
      "country": "United States",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94105",
      "addressLine1": "245 Market Street",
      "addressLine2": "Suite 18",
      "isDefault": true
    }
  ]
}
```

### `POST /api/users/me/addresses`

Purpose:

- create saved address for current user.

Request JSON:

```json
{
  "type": "shipping",
  "label": "Office",
  "fullName": "Hazel Martin",
  "phone": "+1 202 555 0170",
  "country": "United States",
  "city": "San Francisco",
  "state": "CA",
  "zip": "94103",
  "addressLine1": "880 Howard Street",
  "addressLine2": "Floor 3",
  "isDefault": false
}
```

Response JSON:

```json
{
  "id": "addr_002",
  "userId": "usr_001",
  "type": "shipping",
  "label": "Office",
  "fullName": "Hazel Martin",
  "phone": "+1 202 555 0170",
  "country": "United States",
  "city": "San Francisco",
  "state": "CA",
  "zip": "94103",
  "addressLine1": "880 Howard Street",
  "addressLine2": "Floor 3",
  "isDefault": false
}
```

### `PATCH /api/users/me/addresses/:addressId`

Purpose:

- update saved address owned by current user.

Request JSON:

```json
{
  "label": "Studio Billing",
  "fullName": "Hazel Martin",
  "phone": "+1 202 555 0160",
  "country": "United States",
  "city": "San Francisco",
  "state": "CA",
  "zip": "94107",
  "addressLine1": "150 Townsend Street",
  "addressLine2": "Suite 400",
  "isDefault": true
}
```

Response JSON:

```json
{
  "id": "addr_003",
  "userId": "usr_001",
  "type": "billing",
  "label": "Studio Billing",
  "fullName": "Hazel Martin",
  "phone": "+1 202 555 0160",
  "country": "United States",
  "city": "San Francisco",
  "state": "CA",
  "zip": "94107",
  "addressLine1": "150 Townsend Street",
  "addressLine2": "Suite 400",
  "isDefault": true
}
```

### `DELETE /api/users/me/addresses/:addressId`

Purpose:

- delete saved address owned by current user.

Response JSON:

```json
{
  "success": true
}
```

<a id="categories-api"></a>

## Categories API

Public category endpoints return only `active` catalog records. Admin category endpoints can manage both `active` and `inactive` records and support `status` filtering where list endpoints exist.

### `GET /api/categories`

Purpose:

- list categories.

Response JSON:

```json
{
  "items": [
    {
      "id": "cat_001",
      "parentId": null,
      "slug": "smartphones",
      "name": "Smartphones",
      "imgUrl": "/assets/superstore/category-smartphones.png",
      "sortOrder": 1
    }
  ]
}
```

### `GET /api/categories/tree`

Purpose:

- list categories as a parent-child tree.

Response JSON:

```json
{
  "items": [
    {
      "id": "cat_001",
      "parentId": null,
      "slug": "electronics",
      "name": "Electronics",
      "imgUrl": "/assets/superstore/category-electronics.png",
      "sortOrder": 1,
      "children": [
        {
          "id": "cat_002",
          "parentId": "cat_001",
          "slug": "smartphones",
          "name": "Smartphones",
          "imgUrl": "/assets/superstore/category-smartphones.png",
          "sortOrder": 1
        }
      ]
    }
  ]
}
```

### `GET /api/categories/:slug`

Purpose:

- fetch category detail.

### `GET /api/categories/:slug/products`

Purpose:

- list products under a category.
- use the same inventory-aware public product list item shape as `GET /api/products`.

Query params:

- `page`
- `limit`

Response JSON:

```json
{
  "category": {
    "id": "cat_001",
    "parentId": null,
    "slug": "audio",
    "name": "Audio",
    "imgUrl": "/assets/superstore/category-audio.png",
    "sortOrder": 1
  },
  "items": [
    {
      "id": "prd_001",
      "slug": "iphone-13-pro-max",
      "title": "iPhone 13 Pro Max",
      "brandName": "Apple",
      "categoryId": "cat_001",
      "isTrackedInventory": true,
      "price": 1299,
      "discount": 10,
      "rating": 4.9,
      "imgUrl": "/assets/superstore/iphone-13-pro-max.png",
      "shortDescription": "Flagship smartphone",
      "longDescription": "Detailed product description",
      "status": "active",
      "inventory": {
        "onHandQuantity": 24,
        "reservedQuantity": 2,
        "availableQuantity": 22
      }
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

## Admin Categories API

Admin category endpoints require catalog category permissions.

### `GET /api/admin/categories`

Purpose:

- list categories for admin management;
- support status, search, and pagination filters.

Query params:

- `status`
- `search`
- `page`
- `limit`

### `GET /api/admin/categories/:categoryId`

Purpose:

- fetch category for admin management.

### `POST /api/admin/categories`

Purpose:

- create category;
- optional `status` defaults to `active`.

### `PATCH /api/admin/categories/:categoryId`

Purpose:

- update category fields;
- update `status`.

### `DELETE /api/admin/categories/:categoryId`

Purpose:

- hard delete the category when it has no child categories or products.

Rules:

- `DELETE` does not change category `status`;
- child categories block delete with `409 Conflict`;
- products under the category block delete with `409 Conflict`;
- active and inactive related records both count as blocking records;
- use `PATCH /api/admin/categories/:categoryId` to change `status`.

<a id="products-api"></a>

## Products API

Public product endpoints return only `active` products under `active` categories. Admin product endpoints can manage both `active` and `inactive` products and support `status` filtering where list endpoints exist.

Product core endpoints are implemented by `ProductsModule`. Product review
endpoints keep the same public/authenticated paths but are owned by
`ProductReviewsModule`. Product review admin read endpoints use the admin
product path namespace but do not add moderation/write behavior.

### `GET /api/products`

Purpose:

- list products;
- support category, search, and pagination filters.

Query params:

- `categorySlug`
- `search`
- `page`
- `limit`

Response JSON:

```json
{
  "items": [
    {
      "id": "prd_001",
      "slug": "iphone-13-pro-max",
      "title": "iPhone 13 Pro Max",
      "brandName": "Apple",
      "categoryId": "cat_001",
      "isTrackedInventory": true,
      "price": 1299,
      "discount": 10,
      "rating": 4.9,
      "imgUrl": "/assets/superstore/iphone-13-pro-max.png",
      "shortDescription": "Flagship smartphone",
      "longDescription": "Detailed product description",
      "inventory": {
        "onHandQuantity": 24,
        "reservedQuantity": 2,
        "availableQuantity": 22
      }
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

### `GET /api/products/:slug`

Purpose:

- fetch product detail;
- include media and recommendation relations.

Response JSON:

```json
{
  "id": "prd_001",
  "slug": "iphone-13-pro-max",
  "title": "iPhone 13 Pro Max",
  "brandName": "Apple",
  "categoryId": "cat_001",
  "isTrackedInventory": true,
  "price": 1299,
  "discount": 10,
  "rating": 4.9,
  "imgUrl": "/assets/superstore/iphone-13-pro-max.png",
  "shortDescription": "Flagship smartphone",
  "longDescription": "Detailed product description",
  "inventory": {
    "onHandQuantity": 24,
    "reservedQuantity": 2,
    "availableQuantity": 22
  },
  "media": [
    {
      "id": "media_001",
      "productId": "prd_001",
      "src": "/assets/superstore/iphone-13-pro-max.png",
      "alt": "iPhone 13 Pro Max",
      "sortOrder": 1
    }
  ],
  "relations": {
    "frequentlyBoughtTogether": [],
    "relatedProducts": []
  }
}
```

### `GET /api/products/:productId/reviews`

Purpose:

- list product reviews.

### `POST /api/products/:productId/reviews`

Purpose:

- create review for product.

Request JSON:

```json
{
  "ratingValue": 5,
  "comment": "Excellent detail page and product quality."
}
```

### `PATCH /api/products/:productId/reviews/:reviewId`

Purpose:

- update the current user's own product review.

### `DELETE /api/products/:productId/reviews/:reviewId`

Purpose:

- delete the current user's own product review.

## Admin Products API

Admin product endpoints require catalog product permissions.

Core product admin CRUD is implemented by `ProductsModule`. Existing product
media and product relation admin mutations keep their `/api/admin/products/...`
paths but are owned by `ProductMediaModule` and `ProductRelationsModule`.
Product review admin list/detail endpoints are read-only and are owned by
`ProductReviewsModule`.

### `GET /api/admin/products`

Purpose:

- list products for admin management;
- support category, status, search, and pagination filters.

Query params:

- `categorySlug`
- `status`
- `search`
- `page`
- `limit`

Response JSON:

```json
{
  "items": [
    {
      "id": "prd_001",
      "slug": "iphone-13-pro-max",
      "title": "iPhone 13 Pro Max",
      "brandName": "Apple",
      "categoryId": "cat_001",
      "isTrackedInventory": true,
      "price": 1299,
      "discount": 10,
      "rating": 4.9,
      "imgUrl": "/assets/superstore/iphone-13-pro-max.png",
      "shortDescription": "Flagship smartphone",
      "longDescription": "Detailed product description",
      "status": "active",
      "inventory": {
        "onHandQuantity": 24,
        "reservedQuantity": 2,
        "availableQuantity": 22
      }
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

### `GET /api/admin/products/:productId`

Purpose:

- fetch product for admin management.

Response JSON:

```json
{
  "id": "prd_001",
  "slug": "iphone-13-pro-max",
  "title": "iPhone 13 Pro Max",
  "brandName": "Apple",
  "categoryId": "cat_001",
  "isTrackedInventory": true,
  "price": 1299,
  "discount": 10,
  "rating": 4.9,
  "imgUrl": "/assets/superstore/iphone-13-pro-max.png",
  "shortDescription": "Flagship smartphone",
  "longDescription": "Detailed product description",
  "status": "active",
  "inventory": {
    "onHandQuantity": 24,
    "reservedQuantity": 2,
    "availableQuantity": 22
  }
}
```

### `POST /api/admin/products`

Purpose:

- create product;
- optional `status` defaults to `active`.

Response JSON:

```json
{
  "id": "prd_101",
  "slug": "postman-test-product-1710000000000",
  "title": "Postman Test Product",
  "brandName": "Postman Brand",
  "categoryId": "cat_001",
  "isTrackedInventory": false,
  "price": 129.99,
  "discount": 10,
  "rating": 4.8,
  "imgUrl": "/assets/superstore/postman-test-product.png",
  "shortDescription": "Postman generated test product.",
  "longDescription": "Created from admin product API.",
  "status": "active",
  "inventory": {
    "onHandQuantity": null,
    "reservedQuantity": null,
    "availableQuantity": null
  }
}
```

### `PATCH /api/admin/products/:productId`

Purpose:

- update product fields;
- update `status`.

Response JSON:

```json
{
  "id": "prd_101",
  "slug": "postman-test-product-1710000000000",
  "title": "Postman Test Product Updated",
  "brandName": "Postman Brand",
  "categoryId": "cat_001",
  "isTrackedInventory": false,
  "price": 139.99,
  "discount": 5,
  "rating": 4.8,
  "imgUrl": "/assets/superstore/postman-test-product.png",
  "shortDescription": "Postman generated test product.",
  "longDescription": "Created from admin product API.",
  "status": "inactive",
  "inventory": {
    "onHandQuantity": null,
    "reservedQuantity": null,
    "availableQuantity": null
  }
}
```

### `DELETE /api/admin/products/:productId`

Purpose:

- hard delete the product when it has no related cart, order item, media, review, or product relation records.

Rules:

- `DELETE` does not change product `status`;
- cart items block delete with `409 Conflict`;
- order items block delete with `409 Conflict`;
- media records block delete with `409 Conflict`;
- reviews block delete with `409 Conflict`;
- source or target product relations block delete with `409 Conflict`;
- use `PATCH /api/admin/products/:productId` to change `status`.

<a id="inventory-admin-api"></a>

## Inventory Admin API

Inventory management should stay separate from product catalog create/update payloads.

Reason:

- `Product` owns catalog data;
- `InventoryItem` owns stock state;
- `InventoryReservation` and `InventoryTransaction` own operational stock movement;
- `reservedQuantity` must stay system-managed and must not be edited directly from ordinary product update requests.

Because of that:

- `POST /api/admin/products` should not accept stock fields;
- `PATCH /api/admin/products/:productId` should not accept stock fields;
- inventory should be managed through separate admin endpoints.

Inventory tracking contract:

- `isTrackedInventory` is the single product-level source of truth for whether a product participates in inventory tracking;
- `inventory` objects expose quantity summary only;
- `inventory.isTracked` should not be used as a separate response field.

Recommended initial endpoint set:

### `GET /api/admin/products/:productId/inventory`

Purpose:

- fetch the current inventory state for one product.

Response JSON:

```json
{
  "productId": "prd_001",
  "inventory": {
    "onHandQuantity": 24,
    "reservedQuantity": 2,
    "availableQuantity": 22
  }
}
```

### `PUT /api/admin/products/:productId/inventory`

Purpose:

- create the inventory record when it does not exist;
- set the current on-hand quantity explicitly for initial setup or controlled correction.

Request JSON:

```json
{
  "onHandQuantity": 24,
  "note": "Initial stock setup"
}
```

Response JSON:

```json
{
  "productId": "prd_001",
  "inventory": {
    "onHandQuantity": 24,
    "reservedQuantity": 0,
    "availableQuantity": 24
  }
}
```

Rules:

- create the `InventoryItem` if it does not exist;
- update only `onHandQuantity`;
- do not allow direct request-level editing of `reservedQuantity`.

### `POST /api/admin/products/:productId/inventory/adjustments`

Purpose:

- apply a manual stock movement;
- create an `InventoryTransaction` record.

Request JSON:

```json
{
  "type": "MANUAL_ADD",
  "quantity": 5,
  "note": "Warehouse recount correction"
}
```

Alternative remove example:

```json
{
  "type": "MANUAL_REMOVE",
  "quantity": 2,
  "note": "Damaged units removed"
}
```

Response JSON:

```json
{
  "success": true,
  "productId": "prd_001",
  "inventory": {
    "onHandQuantity": 29,
    "reservedQuantity": 2,
    "availableQuantity": 27
  }
}
```

Rules:

- allow `MANUAL_ADD` and `MANUAL_REMOVE`;
- reject adjustments that would make `onHandQuantity` negative;
- write a matching `InventoryTransaction`;
- keep `reservedQuantity` unchanged in manual adjustment flow unless a future dedicated operational flow explicitly changes reservations.

### `GET /api/admin/products/:productId/inventory/transactions`

Purpose:

- list inventory transaction history for admin review.

Response JSON:

```json
{
  "items": [
    {
      "id": "inv_tx_001",
      "inventoryItemId": "inv_001",
      "reservationId": null,
      "orderId": null,
      "orderItemId": null,
      "type": "MANUAL_ADD",
      "quantity": 5,
      "note": "Warehouse recount correction",
      "createdAt": "2026-06-11T12:00:00.000Z"
    }
  ]
}
```

### `GET /api/admin/products/:productId/inventory/reservations`

Purpose:

- list active and historical reservations affecting the product.

Response JSON:

```json
{
  "items": [
    {
      "id": "inv_res_001",
      "orderId": "ord_001",
      "orderItemId": "ord_item_001",
      "quantity": 2,
      "status": "ACTIVE",
      "expiresAt": "2026-06-12T12:00:00.000Z",
      "note": "Reservation for DEMO-ORDER-1001"
    }
  ]
}
```

Recommended boundary:

- product admin endpoints manage descriptive catalog fields;
- inventory admin endpoints manage stock setup and manual stock corrections;
- order/checkout workflows manage reservation and commit lifecycle.

### `GET /api/admin/products/:productId/media`

Purpose:

- list media records for a product;
- support pagination.

Query params:

- `page`
- `limit`

Required permission:

- `catalog.product.read`

### `GET /api/admin/products/media/:mediaId`

Purpose:

- fetch a product media record for admin management.

Required permission:

- `catalog.product.read`

### `POST /api/admin/products/:productId/media`

Purpose:

- create media for a product.

Required permission:

- `catalog.product.update`

### `PATCH /api/admin/products/media/:mediaId`

Purpose:

- update product media fields.

Required permission:

- `catalog.product.update`

### `DELETE /api/admin/products/media/:mediaId`

Purpose:

- remove product media.

Required permission:

- `catalog.product.update`

### `GET /api/admin/products/:productId/relations`

Purpose:

- list product-to-product relations for a source product;
- support relation type filtering and pagination.

Query params:

- `relationType`
- `page`
- `limit`

Required permission:

- `catalog.product.read`

### `GET /api/admin/products/relations/:relationId`

Purpose:

- fetch a product-to-product relation for admin management.

Required permission:

- `catalog.product.read`

### `POST /api/admin/products/:productId/relations`

Purpose:

- create product-to-product relation.

Required permission:

- `catalog.product.update`

### `DELETE /api/admin/products/relations/:relationId`

Purpose:

- remove product-to-product relation.

Required permission:

- `catalog.product.update`

Product relation update is intentionally unsupported. Use delete and create
instead when a relation is wrong.

### `GET /api/admin/products/:productId/reviews`

Purpose:

- list reviews for a product in the admin panel;
- support pagination;
- provide read-only visibility without moderation behavior.

Query params:

- `page`
- `limit`

Required permission:

- `catalog.product.read`

### `GET /api/admin/products/reviews/:reviewId`

Purpose:

- fetch a product review record in the admin panel;
- provide read-only visibility without moderation behavior.

Required permission:

- `catalog.product.read`

Product review admin moderation/write endpoints are intentionally deferred.
This contract does not add:

- `PATCH /api/admin/products/reviews/:reviewId/status`
- `DELETE /api/admin/products/reviews/:reviewId`

<a id="cart-api"></a>

## Cart API

### `GET /api/cart`

Purpose:

- fetch current active cart.

### `POST /api/cart/items`

Purpose:

- add product to cart.

Request JSON:

```json
{
  "productId": "prd_001",
  "quantity": 1
}
```

### `PATCH /api/cart/items/:itemId`

Purpose:

- update cart item quantity.

Request JSON:

```json
{
  "quantity": 2
}
```

### `DELETE /api/cart/items/:itemId`

Purpose:

- remove item from cart.

### `DELETE /api/cart`

Purpose:

- clear active cart.

<a id="checkout-reference-api"></a>

## Checkout Reference API

### `GET /api/shipping-carriers`

Purpose:

- list available shipping services for checkout.

Response intent:

- each item identifies the selectable shipping service;
- carrier display fields remain available in the same item;
- active service-level kapida capability data is included for UI display.

### `GET /api/payment-methods`

Purpose:

- list available payment methods.

Query params:

- `shippingServiceId` optional

Behavior rules:

- `credit_card` and `bank_transfer` are base payment methods;
- base payment methods remain selectable when active;
- `cash_on_delivery` and `card_on_delivery` are conditional payment methods;
- conditional payment methods become selectable only when the selected shipping service has an active matching capability row;
- when `shippingServiceId` is omitted, conditional methods may still be listed but should return as not selectable with a reason such as `shipping_service_required`.

Response intent:

- each item may include:
  - `providers`
  - `isBaseMethod`
  - `isConditionalMethod`
  - `isSelectable`
  - `availabilityReason`
  - `extraFee`
  - `currency`
  - `minOrderAmount`
  - `maxOrderAmount`

Provider response intent:

- a payment method may include zero or more provider records;
- provider records may include:
  - `code`
  - `name`
  - `providerType`
  - `description`
  - `logoUrl`
  - `sortOrder`
  - `status`
- public payment responses should include only active providers.

## Admin Shipping Carriers API

Admin shipping carrier endpoints require shipping carrier permissions.

### `GET /api/admin/shipping-carriers`

Purpose:

- list shipping carriers for admin management;
- support status, search, and pagination filters.

Query params:

- `status`
- `search`
- `page`
- `limit`

### `GET /api/admin/shipping-carriers/:shippingCarrierId`

Purpose:

- fetch shipping carrier detail for admin management.

### `POST /api/admin/shipping-carriers`

Purpose:

- create shipping carrier;
- optional `status` defaults to `active`.

Request JSON:

```json
{
  "code": "aras_kargo",
  "name": "Aras Kargo",
  "description": "National cargo carrier",
  "sortOrder": 10,
  "status": "active"
}
```

### `PATCH /api/admin/shipping-carriers/:shippingCarrierId`

Purpose:

- update shipping carrier fields;

Request JSON:

```json
{
  "name": "Aras Kargo",
  "description": "Updated carrier description",
  "sortOrder": 20
}
```

### `PATCH /api/admin/shipping-carriers/:shippingCarrierId/status`

Purpose:

- update shipping carrier status;
- activate or deactivate shipping carrier without using delete semantics.

Request JSON:

```json
{
  "status": "active"
}
```

### `DELETE /api/admin/shipping-carriers/:shippingCarrierId`

Purpose:

- hard delete the shipping carrier when it has no related records.

Rules:

- `DELETE` does not change shipping carrier `status`;
- related records block delete with `409 Conflict`;
- use `PATCH /api/admin/shipping-carriers/:shippingCarrierId/status` to change `status`.

Response JSON:

```json
{
  "success": true
}
```

### `POST /api/admin/shipping-carriers/:shippingCarrierId/services`

Purpose:

- create a delivery service/option under an existing carrier.

Request JSON:

```json
{
  "code": "standard_delivery",
  "name": "Standart Teslimat",
  "price": 79,
  "currency": "TRY",
  "estimatedDeliveryText": "2-3 is gunu",
  "sortOrder": 10,
  "status": "active"
}
```

### `PATCH /api/admin/shipping-carriers/:shippingCarrierId/services/:shippingCarrierServiceId`

Purpose:

- update shipping carrier service fields.

### `PATCH /api/admin/shipping-carriers/:shippingCarrierId/services/:shippingCarrierServiceId/status`

Purpose:

- activate or deactivate a shipping carrier service.

### `DELETE /api/admin/shipping-carriers/:shippingCarrierId/services/:shippingCarrierServiceId`

Purpose:

- hard delete a shipping carrier service when it has no protected related records.

### `POST /api/admin/shipping-carriers/:shippingCarrierId/services/:shippingCarrierServiceId/payment-capabilities`

Purpose:

- attach a kapida payment capability to a shipping service.

Request JSON:

```json
{
  "paymentMethod": "cash_on_delivery",
  "fee": 25,
  "currency": "TRY",
  "minOrderAmount": null,
  "maxOrderAmount": null,
  "sortOrder": 10,
  "status": "active"
}
```

Rules:

- allowed `paymentMethod` values are only `cash_on_delivery` and `card_on_delivery`;
- this capability layer must not be used for `credit_card` or `bank_transfer`.

### `PATCH /api/admin/shipping-carriers/:shippingCarrierId/services/:shippingCarrierServiceId/payment-capabilities/:shippingCarrierServicePaymentCapabilityId`

Purpose:

- update shipping service payment capability fields.

### `PATCH /api/admin/shipping-carriers/:shippingCarrierId/services/:shippingCarrierServiceId/payment-capabilities/:shippingCarrierServicePaymentCapabilityId/status`

Purpose:

- activate or deactivate a shipping service payment capability.

### `DELETE /api/admin/shipping-carriers/:shippingCarrierId/services/:shippingCarrierServiceId/payment-capabilities/:shippingCarrierServicePaymentCapabilityId`

Purpose:

- hard delete a shipping service payment capability.

## Admin Payment Methods API

Admin payment method endpoints require payment method permissions.

### `GET /api/admin/payment-methods`

Purpose:

- list payment methods for admin management;
- support status, search, and pagination filters.

Query params:

- `status`
- `search`
- `page`
- `limit`

### `GET /api/admin/payment-methods/:paymentMethodId`

Purpose:

- fetch payment method detail for admin management.

### `POST /api/admin/payment-methods`

Purpose:

- create payment method;
- optional `status` defaults to `active`.

Request JSON:

```json
{
  "code": "credit_card",
  "name": "Kredi / Banka Karti",
  "status": "active"
}
```

### `PATCH /api/admin/payment-methods/:paymentMethodId`

Purpose:

- update payment method fields.

Request JSON:

```json
{
  "name": "Kredi / Banka Karti"
}
```

### `PATCH /api/admin/payment-methods/:paymentMethodId/status`

Purpose:

- update payment method status;
- activate or deactivate payment method without using delete semantics.

Request JSON:

```json
{
  "status": "active"
}
```

### `DELETE /api/admin/payment-methods/:paymentMethodId`

Purpose:

- hard delete the payment method when it has no related records.

Rules:

- `DELETE` does not change payment method `status`;
- related records block delete with `409 Conflict`;
- use `PATCH /api/admin/payment-methods/:paymentMethodId/status` to change `status`.

Response JSON:

```json
{
  "success": true
}
```

### `POST /api/admin/payment-methods/:paymentMethodId/providers`

Purpose:

- create a provider/channel under an existing payment method.

Request JSON:

```json
{
  "code": "iyzico",
  "name": "iyzico",
  "providerType": "PSP",
  "description": "Kart odeme saglayicisi",
  "sortOrder": 20,
  "status": "active"
}
```

Rules:

- provider `code` must be unique within the same payment method;
- `providerType` should be one of `PSP`, `BANK_POS`, or `AGGREGATOR`.

### `PATCH /api/admin/payment-methods/:paymentMethodId/providers/:paymentProviderId`

Purpose:

- update payment provider fields.

### `PATCH /api/admin/payment-methods/:paymentMethodId/providers/:paymentProviderId/status`

Purpose:

- activate or deactivate a payment provider without deleting the payment method itself.

### `DELETE /api/admin/payment-methods/:paymentMethodId/providers/:paymentProviderId`

Purpose:

- hard delete a payment provider when it has no protected related records.

## Order-Time Validation Notes

Order creation is not defined in this section yet, but the payment eligibility rule must be enforced again during order creation.

Required rule:

- if selected payment method is `credit_card` or `bank_transfer`, active payment method validation is enough;
- if selected payment method is `cash_on_delivery` or `card_on_delivery`, backend must also verify that the selected `shippingServiceId` has an active matching payment capability;
- backend must not trust frontend filtering alone.

<a id="orders-api"></a>

## Orders API

Current implementation note:

- customer order endpoints are implemented in runtime code;
- admin order read/workflow endpoints are implemented in runtime code;
- the contract below should now be treated as the current API surface baseline for the orders module.

### `POST /api/orders`

Purpose:

- create order from current cart and checkout payload.

Request JSON:

```json
{
  "shippingAddressId": "addr_shipping_001",
  "billingAddressId": "addr_billing_001",
  "shippingServiceId": "ship_service_001",
  "paymentMethodId": "pay_method_001",
  "notes": "Leave at building reception"
}
```

Rules:

- cart must contain at least one item;
- shipping address must belong to the current user and be of type `shipping`;
- billing address must belong to the current user and be of type `billing`;
- selected shipping service must be active and publicly selectable;
- selected payment method must be valid for the selected shipping service;
- tracked-inventory products must have enough available quantity before order creation;
- successful order creation clears the active cart;
- order creation creates inventory reservations for tracked products.

Response JSON shape:

- returns order detail response;
- includes item snapshots, address snapshots, payment snapshot, shipment snapshot, and status history.

### `GET /api/orders`

Purpose:

- list current user's orders.

Query params:

- `page`
- `limit`
- `orderStatus`
- `paymentStatus`
- `fulfillmentStatus`

Response JSON shape:

```json
{
  "items": [
    {
      "id": "ord_001",
      "orderNumber": "ORD-20260617-ABC123",
      "orderStatus": "PENDING",
      "paymentStatus": "PENDING",
      "fulfillmentStatus": "PENDING",
      "currency": "TRY",
      "grandTotal": 1549.99,
      "createdAt": "2026-06-17T20:00:00.000Z"
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

### `GET /api/orders/:orderId`

Purpose:

- fetch current user's order detail.

Rules:

- current user can only read own orders;
- missing or foreign order id returns `404 Not Found`.

### `POST /api/orders/:orderId/cancel`

Purpose:

- allow the current customer to cancel an eligible order;
- release active tracked-inventory reservations created by that order.

Rules:

- customer cancel is intended for cancellable pre-delivery states;
- successful cancel appends order status history;
- reservation release restores `reservedQuantity` and `availableQuantity` appropriately.

### `GET /api/admin/orders`

Purpose:

- list orders for admin and operations review.

Required permission:

- `order.read_all`

Query params:

- `page`
- `limit`
- `orderStatus`
- `paymentStatus`
- `fulfillmentStatus`
- `userId`
- `search`

### `GET /api/admin/orders/:orderId`

Purpose:

- fetch full order detail for admin and support workflows.

Required permission:

- `order.read_all`

Admin detail response shape:

- extends normal order detail response;
- includes `customer` object context for admin-facing consumers.

### `POST /api/admin/orders/:orderId/confirm`

Purpose:

- move an order into confirmed processing state.

Required permission:

- `order.update_status`

### `POST /api/admin/orders/:orderId/ready-for-shipment`

Purpose:

- mark the order as operationally ready for shipment.

Required permission:

- `order.update_status`

### `POST /api/admin/orders/:orderId/hand-over`

Purpose:

- hand the order over to the shipping carrier;
- optionally save tracking number information in shipment snapshot.

Required permission:

- `order.update_status`

### `POST /api/admin/orders/:orderId/deliver`

Purpose:

- complete delivery workflow;
- commit tracked inventory reservations into final stock movement.

Required permission:

- `order.update_status`

### `POST /api/admin/orders/:orderId/delivery-failed`

Purpose:

- mark delivery as failed;
- release active tracked-inventory reservations for the order.

Required permission:

- `order.update_status`

### `POST /api/admin/orders/:orderId/return`

Purpose:

- mark the order as returned after delivery.

Required permission:

- `order.update_status`

### `POST /api/admin/orders/:orderId/restock-returned-items`

Purpose:

- restock returned tracked-inventory items after return processing.

Required permission:

- `order.update_status`

### `POST /api/admin/orders/:orderId/cancel`

Purpose:

- allow operations/admin-side cancellation flow;
- release active tracked-inventory reservations when applicable.

Required permission:

- `order.cancel`

<a id="common-error-json"></a>

## Common Error JSON

Validation error example:

```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password should not be empty"],
  "error": "Bad Request"
}
```

Not found example:

```json
{
  "statusCode": 404,
  "message": "Order not found",
  "error": "Not Found"
}
```

Unauthorized example:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

Conflict example:

```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

<a id="recommended-build-order"></a>

## Recommended Build Order

1. Auth
2. Users
3. Addresses
4. Categories
5. Products
6. Cart
7. Checkout Reference
8. Orders
