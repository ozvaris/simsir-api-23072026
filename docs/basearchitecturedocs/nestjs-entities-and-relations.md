# NestJS Entities And Relations

<a id="purpose"></a>

## Purpose

This document defines the backend entity model and relationship map.

It intentionally focuses on:

- entity list;
- entity responsibilities;
- important properties;
- relationship map.

It does not define controller, service, DTO, response, or API endpoint behavior.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Entity Groups](#entity-groups)
- [Identity Entities](#identity-entities)
- [Access Control Entities](#access-control-entities)
- [Catalog Entities](#catalog-entities)
- [Cart Entities](#cart-entities)
- [Checkout Reference Entities](#checkout-reference-entities)
- [Order Entities](#order-entities)
- [Relationship Map](#relationship-map)
- [Minimal Phase-1 Set](#minimal-phase-1-set)

<a id="entity-groups"></a>

## Entity Groups

### Identity

- `User`
- `UserCredential`
- `Address`

### Access Control

- `Role`
- `Permission`
- `UserRole`
- `RolePermission`

### Catalog

- `Category`
- `Product`
- `ProductMedia`
- `ProductReview`
- `ProductRelation`

### Cart

- `Cart`
- `CartItem`

### Checkout Reference

- `ShippingCarrier`
- `PaymentMethod`

### Orders

- `Order`
- `OrderItem`
- `OrderAddressSnapshot`

<a id="identity-entities"></a>

## Identity Entities

### `User`

Account owner.

Responsibilities:

- owns credentials;
- owns addresses;
- owns cart;
- owns orders;
- authors product reviews;
- receives access through role assignments.

Properties:

- `id`
- `email`
- `userName`
- `name`
- `surname`
- `phone`

### `UserCredential`

Authentication-specific credential record.

Properties:

- `id`
- `userId`
- `email`
- `passwordHash`

Password must be stored as a hash, not raw text.

### `Address`

Saved account address.

Responsibilities:

- belongs to a user;
- supports shipping and billing types;
- supports default address behavior.

Properties:

- `id`
- `userId`
- `type`
- `label`
- `fullName`
- `phone`
- `country`
- `city`
- `state`
- `zip`
- `addressLine1`
- `addressLine2`
- `isDefault`

<a id="access-control-entities"></a>

## Access Control Entities

Access control entities implement RBAC without merging authentication, authorization, and ownership concerns.

### `Role`

Business-meaning access package.

Responsibilities:

- groups permissions into meaningful operational responsibilities;
- supports admin, staff, support, catalog, and order-management access;
- may be seeded as a system role.

Properties:

- `id`
- `code`
- `name`
- `description`
- `isSystem`
- `status`
- `createdAt`
- `updatedAt`

Notes:

- `code` should be unique and stable.
- System roles should not be deleted accidentally.
- `isAdmin` should be derived from role or permission state, not used as the primary data model.

### `Permission`

Technical access unit.

Responsibilities:

- represents a precise action the system can authorize;
- supports endpoint-level guards;
- allows roles to evolve without creating a new role for every small access change.

Properties:

- `id`
- `code`
- `name`
- `description`
- `resource`
- `action`
- `isSystem`
- `status`
- `createdAt`
- `updatedAt`

Recommended `code` format:

- `resource.action`
- `module.resource.action` for larger domains

Examples:

- `catalog.product.create`
- `catalog.product.update`
- `order.read_all`
- `order.update_status`
- `rbac.role.assign_permission`

### `UserRole`

User-to-role assignment.

Responsibilities:

- assigns one or more roles to a user;
- records who assigned the role and when;
- may later support expiration or tenant-specific assignment.

Properties:

- `id`
- `userId`
- `roleId`
- `assignedAt`
- `assignedBy`

Optional future properties:

- `expiresAt`
- `tenantId` or `storeId` when multi-tenant or marketplace behavior is introduced

Notes:

- A user should not receive the same role twice in the same scope.
- For the current single-store e-commerce phase, tenant fields are not required.

### `RolePermission`

Role-to-permission assignment.

Responsibilities:

- defines the effective permission set of a role;
- acts as the main source for authorization summary calculation.

Properties:

- `id`
- `roleId`
- `permissionId`
- `assignedAt`
- `assignedBy`

Notes:

- A role should not receive the same permission twice.
- Inactive permissions should be excluded from authorization summary calculation.

<a id="catalog-entities"></a>

## Catalog Entities

### `Category`

Product grouping entity.

Responsibilities:

- groups products;
- supports parent-child category trees;
- may represent root or child category.

Properties:

- `id`
- `parentId`
- `slug`
- `name`
- `imgUrl`
- `sortOrder`
- `status`

Notes:

- `active` categories are visible in the public catalog.
- `inactive` categories remain manageable in admin flows but are hidden from public catalog endpoints.
- Category delete is a hard delete attempt and is blocked when child categories or products exist.

### `Product`

Core catalog entity.

Module boundary:

- core product behavior belongs to `ProductsModule`;
- media, review, and relation CRUD/use-case behavior belongs to
  `ProductMediaModule`, `ProductReviewsModule`, and `ProductRelationsModule`;
- entity relation properties may remain on `Product` for intentional product
  detail loading.

Properties:

- `id`
- `slug`
- `title`
- `brandName`
- `categoryId`
- `price`
- `discount`
- `rating`
- `imgUrl`
- `shortDescription`
- `longDescription`
- `status`

Notes:

- `active` products are visible in the public catalog.
- `inactive` products remain manageable in admin flows but are hidden from public catalog endpoints.
- Product delete is a hard delete attempt and is blocked when related cart items, media, reviews, or product relations exist.

### `ProductMedia`

Product gallery/image record.

Module boundary:

- owned by `ProductMediaModule`;
- table name remains `product_media`;
- relation to `Product` can be loaded by product detail queries without moving
  media mutations back into `ProductsService`.

Properties:

- `id`
- `productId`
- `src`
- `alt`
- `sortOrder`

### `ProductReview`

Product review record.

Module boundary:

- owned by `ProductReviewsModule`;
- table name remains `product_reviews`;
- review mutations use authenticated current-user context and update product
  rating through the review use-case flow.

Properties:

- `id`
- `productId`
- `userId`
- `ratingValue`
- `comment`
- `createdAt`

### `ProductRelation`

Product-to-product relation.

Module boundary:

- owned by `ProductRelationsModule`;
- table name remains `product_relations`;
- product detail may load source relations for related product response shapes.

Used for:

- frequently bought together;
- related products.

Properties:

- `id`
- `sourceProductId`
- `targetProductId`
- `relationType`

Recommended `relationType` values:

- `frequently_bought_together`
- `related_product`

<a id="cart-entities"></a>

## Cart Entities

### `Cart`

Active shopping cart.

Properties:

- `id`
- `userId`
- `status`

### `CartItem`

Product line inside cart.

Properties:

- `id`
- `cartId`
- `productId`
- `quantity`

<a id="checkout-reference-entities"></a>

## Checkout Reference Entities

### `ShippingCarrier`

Carrier option used when shipping-company flow is selected.

Properties:

- `id`
- `code`
- `name`
- `fee`
- `status`

Notes:

- `active` shipping carriers are visible in public checkout reference endpoints.
- `inactive` shipping carriers remain manageable in admin flows but are hidden from public checkout reference endpoints.
- Shipping carrier delete is a hard delete attempt and is blocked when related records exist.

### `PaymentMethod`

Checkout payment method.

Properties:

- `id`
- `code`
- `name`
- `status`

Notes:

- `active` payment methods are visible in public checkout reference endpoints.
- `inactive` payment methods remain manageable in admin flows but are hidden from public checkout reference endpoints.
- Payment method delete is a hard delete attempt and is blocked when related records exist.

<a id="order-entities"></a>

## Order Entities

### `Order`

Confirmed order root entity.

Properties:

- `id`
- `userId`
- `shippingOption`
- `shippingCarrierId`
- `paymentMethodId`
- `orderNumber`
- `placedAt`
- `totalValue`

### `OrderItem`

Product snapshot line within an order.

Properties:

- `id`
- `orderId`
- `productId`
- `title`
- `quantity`
- `unitPrice`
- `originalUnitPrice`
- `linePrice`
- `imageSrc`
- `imageAlt`

### `OrderAddressSnapshot`

Shipping or billing address captured at order time.

Properties:

- `id`
- `orderId`
- `role`
- `fullName`
- `email`
- `phone`
- `company`
- `country`
- `state`
- `city`
- `zip`
- `address1`
- `address2`

Recommended `role` values:

- `shipping`
- `billing`

<a id="relationship-map"></a>

## Relationship Map

### User Side

- `User 1 - 1 UserCredential`
- `User 1 - N Address`
- `User 1 - N Order`
- `User 1 - N ProductReview`
- `User 1 - 1 Cart`
- `User 1 - N UserRole`

### Access Control Side

- `Role 1 - N UserRole`
- `Role 1 - N RolePermission`
- `Permission 1 - N RolePermission`

### Catalog Side

- `Category 1 - N Category` as parent-child tree
- `Category 1 - N Product`
- `Product 1 - N ProductMedia`
- `Product 1 - N ProductReview`
- `Product 1 - N CartItem`
- `Product 1 - N OrderItem`
- `Product 1 - N ProductRelation` as source product
- `Product 1 - N ProductRelation` as target product

### Cart Side

- `Cart 1 - N CartItem`
- `CartItem N - 1 Product`

### Checkout Reference Side

- `ShippingCarrier 1 - N Order`
- `PaymentMethod 1 - N Order`

### Order Side

- `Order 1 - N OrderItem`
- `Order 1 - N OrderAddressSnapshot`

<a id="minimal-phase-1-set"></a>

## Minimal Phase-1 Set

Start with:

- `User`
- `UserCredential`
- `Role`
- `Permission`
- `UserRole`
- `RolePermission`
- `Address`
- `Category`
- `Product`
- `ProductMedia`
- `ProductReview`
- `ProductRelation`
- `Cart`
- `CartItem`
- `ShippingCarrier`
- `PaymentMethod`
- `Order`
- `OrderItem`
- `OrderAddressSnapshot`

Tenant-specific access-control entities are not part of the minimal set unless the product becomes multi-store, marketplace-based, or organization-based.
