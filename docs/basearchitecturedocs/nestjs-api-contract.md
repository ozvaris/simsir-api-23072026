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
  "userName": "hazel.martin",
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
  "phone": "+1 202 555 0189"
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
  "phone": "+1 202 555 0199"
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

Query params:

- `page`
- `limit`

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
      "price": 1299,
      "discount": 10,
      "rating": 4.9,
      "imgUrl": "/assets/superstore/iphone-13-pro-max.png",
      "shortDescription": "Flagship smartphone",
      "longDescription": "Detailed product description"
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

### `GET /api/admin/products/:productId`

Purpose:

- fetch product for admin management.

### `POST /api/admin/products`

Purpose:

- create product;
- optional `status` defaults to `active`.

### `PATCH /api/admin/products/:productId`

Purpose:

- update product fields;
- update `status`.

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

- list available shipping carriers.

### `GET /api/payment-methods`

Purpose:

- list available payment methods.

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
  "code": "standard_shipping",
  "name": "Standard Shipping",
  "fee": 9.99,
  "status": "active"
}
```

### `PATCH /api/admin/shipping-carriers/:shippingCarrierId`

Purpose:

- update shipping carrier fields;

Request JSON:

```json
{
  "name": "Express Shipping",
  "fee": 19.99
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
  "name": "Credit Card",
  "status": "active"
}
```

### `PATCH /api/admin/payment-methods/:paymentMethodId`

Purpose:

- update payment method fields.

Request JSON:

```json
{
  "name": "Credit Card"
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

<a id="orders-api"></a>

## Orders API

### `POST /api/orders`

Purpose:

- create order from current cart and checkout payload.

### `GET /api/orders`

Purpose:

- list current user's orders.

### `GET /api/orders/:orderId`

Purpose:

- fetch current user's order detail.

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
