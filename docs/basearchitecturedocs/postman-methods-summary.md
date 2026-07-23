# Postman Methods Summary

Last updated: 2026-07-23 11:01:11

<a id="purpose"></a>

## Purpose

This document summarizes the existing Postman collections under `postman/` from an operational point of view.

It owns:

- which collection is used for which backend area;
- which main HTTP methods and endpoint groups appear in each collection;
- which collections are useful for manual setup or manual operations;
- which collections are mainly regression-oriented and less useful for ad hoc admin actions.

It does not replace:

- `postman-run-order-guide.md` for run order;
- `rbac-api-contract.md` and `nestjs-api-contract.md` for endpoint contracts;
- raw Postman JSON files for exact request bodies, scripts, and variable capture details.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [How To Read This Summary](#how-to-read-this-summary)
- [Shared Environment And Dependency Notes](#shared-environment-and-dependency-notes)
- [Collection Summary](#collection-summary)
- [Manual Operation Shortlist](#manual-operation-shortlist)
- [When To Use JSON Instead](#when-to-use-json-instead)

<a id="how-to-read-this-summary"></a>

## How To Read This Summary

Each collection section is intentionally short.

It answers:

- what the collection is for;
- which method families it contains;
- which role tokens it depends on;
- whether it is practical for manual operational use.

Method summaries are grouped conceptually instead of listing every single request again.

<a id="shared-environment-and-dependency-notes"></a>

## Shared Environment And Dependency Notes

- Shared local environment: `postman/simsir-local.postman_environment.json`
- Core setup collection: `postman/01-user-role-token-setup.postman_collection.json`
- Most admin and role-aware collections depend on tokens or ids created by collection `01`.
- If tokens expire, rerun collection `01` before assuming a backend problem.

<a id="collection-summary"></a>

## Collection Summary

### `01-user-role-token-setup.postman_collection.json`

Purpose:

- bootstrap role test users;
- login seeded and test users;
- assign RBAC roles;
- relogin after role assignment;
- verify access summary and current profile contract.

Main methods and endpoint groups:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `PUT /api/admin/rbac/users/:userId/roles`
- `GET /api/auth/me/access`
- `GET /api/users/me`
- `PATCH /api/users/me`

Operational value:

- highest manual value for auth and RBAC bootstrap;
- best starting point for assigning `SUPER_ADMIN`, `CUSTOMER`, `CATALOG_MANAGER`, `ORDER_MANAGER`, or `SUPPORT_STAFF` roles;
- useful when you need ready-made token capture behavior.

### `02-category-product-role-tests.postman_collection.json`

Purpose:

- validate public catalog reads;
- validate admin catalog access boundaries;
- run category and product CRUD with role-based expectations;
- verify inactive visibility and cleanup behavior.

Main methods and endpoint groups:

- `GET /api/categories`
- `GET /api/categories/tree`
- `GET /api/products`
- `GET /api/categories/:slug/products`
- `GET|POST|PATCH|DELETE /api/admin/categories`
- `GET|POST|PATCH|DELETE /api/admin/products`

Operational value:

- useful for manual catalog admin checks;
- useful for verifying whether a role should read or write category/product data;
- less useful for one-off business operations unless you are actively testing role boundaries.

### `03-cart-endpoint-tests.postman_collection.json`

Purpose:

- validate customer cart lifecycle;
- validate ownership isolation;
- validate unauthenticated and validation error behavior.

Main methods and endpoint groups:

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `DELETE /api/cart`

Operational value:

- mostly regression-focused;
- useful when troubleshooting customer cart behavior;
- not a primary admin operations collection.

### `04-checkout-reference-role-tests.postman_collection.json`

Purpose:

- validate public shipping and payment reference reads;
- validate checkout draft save/restore flow;
- run shipping carrier and payment method admin CRUD;
- verify staff and manager role boundaries.

Main methods and endpoint groups:

- `GET /api/shipping-carriers`
- `GET /api/payment-methods`
- `GET|PATCH /api/checkout/draft`
- `GET|POST|PATCH|DELETE /api/admin/shipping-carriers`
- `POST /api/admin/shipping-carriers/:carrierId/services`
- `POST /api/admin/shipping-carriers/:carrierId/services/:serviceId/payment-capabilities`
- `GET|POST|PATCH /api/admin/payment-methods`
- `POST|PATCH /api/admin/payment-methods/:methodId/providers`

Operational value:

- strong manual value for checkout reference administration;
- useful when testing shipping/payment configuration permissions;
- good source for nested admin endpoint examples.

### `05-inventory-admin-tests.postman_collection.json`

Purpose:

- validate seeded inventory access;
- run inventory read, set, adjustment, transaction, and reservation checks;
- verify read/write boundaries across roles;
- restore fixture state at cleanup.

Main methods and endpoint groups:

- `GET /api/admin/products/:productId/inventory`
- `PUT /api/admin/products/:productId/inventory`
- `POST /api/admin/products/:productId/inventory/adjustments`
- `GET /api/admin/products/:productId/inventory/transactions`
- `GET /api/admin/products/:productId/inventory/reservations`

Operational value:

- useful for manual inventory inspection and quantity adjustment;
- useful when checking whether non-catalog roles should be read-only;
- high value for support and debugging around stock state.

### `06-product-media-submodule-tests.postman_collection.json`

Purpose:

- validate product detail media shape;
- run product media admin CRUD;
- verify customer denial on media admin endpoints;
- clean up temporary media fixtures.

Main methods and endpoint groups:

- `GET /api/products/:slug`
- `GET|POST /api/admin/products/:productId/media`
- `GET|PATCH|DELETE /api/admin/products/media/:mediaId`

Operational value:

- useful for manual media admin testing;
- less general-purpose than catalog and inventory collections;
- best used when product media contract or permissions are under review.

### `07-product-relations-submodule-tests.postman_collection.json`

Purpose:

- validate product relation shape on product detail;
- run relation admin create/read/delete flow;
- verify customer denial on relation admin endpoints.

Main methods and endpoint groups:

- `GET /api/products/:slug`
- `GET|POST /api/admin/products/:productId/relations`
- `GET|DELETE /api/admin/products/relations/:relationId`

Operational value:

- useful for relation-specific admin checks;
- narrower operational value than core catalog collections.

### `08-product-reviews-submodule-tests.postman_collection.json`

Purpose:

- validate public review listing;
- run authenticated customer review create/update/delete flow;
- verify admin review read endpoints;
- verify unauthenticated create denial.

Main methods and endpoint groups:

- `GET /api/products/:productId/reviews`
- `POST /api/products/:productId/reviews`
- `PATCH|DELETE /api/products/:productId/reviews/:reviewId`
- `GET /api/admin/products/:productId/reviews`
- `GET /api/admin/products/reviews/:reviewId`

Operational value:

- useful when reviewing customer-generated content behavior;
- moderate value for support/admin read troubleshooting;
- not a general admin bootstrap collection.

### `09-orders-module-tests.postman_collection.json`

Purpose:

- validate authenticated order lifecycle;
- validate customer cancel flow;
- validate admin order transition matrix;
- validate reservation, commit, release, return, and restock inventory effects.

Main methods and endpoint groups:

- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/:orderId`
- `POST /api/orders/:orderId/cancel`
- `GET /api/admin/orders/:orderId`
- `POST /api/admin/orders/:orderId/confirm`
- `POST /api/admin/orders/:orderId/ready-for-shipment`
- `POST /api/admin/orders/:orderId/hand-over`
- `POST /api/admin/orders/:orderId/deliver`
- `POST /api/admin/orders/:orderId/return`
- `POST /api/admin/orders/:orderId/restock-returned-items`
- `POST /api/admin/orders/:orderId/delivery-failed`
- `POST /api/admin/orders/:orderId/cancel`

Operational value:

- very strong regression and workflow validation value;
- useful when investigating order-status transitions or inventory side effects;
- less suitable for quick one-off admin actions because it is heavily stateful.

### `10-storefront-home-and-admin-tests.postman_collection.json`

Purpose:

- validate storefront home baseline response;
- run featured category CRUD;
- run storefront collection and collection-item CRUD;
- verify that public storefront home reflects admin curation.

Main methods and endpoint groups:

- `GET /api/storefront/home`
- `GET /api/admin/storefront/collections`
- `POST|PATCH|DELETE /api/admin/storefront/collections`
- `POST /api/admin/storefront/collections/:collectionId/items`
- `GET /api/admin/storefront/collections/:collectionId/items`
- `PATCH|DELETE /api/admin/storefront/collections/items/:itemId`
- `POST|GET|DELETE /api/admin/storefront/featured-categories`

Operational value:

- useful for homepage merchandising and curation checks;
- good operational reference for storefront admin maintenance.

### `11-system-settings-admin-tests.postman_collection.json`

Purpose:

- validate system settings CRUD for `SUPER_ADMIN`;
- validate support-staff read-only behavior;
- validate access denial for non-authorized roles.

Main methods and endpoint groups:

- `GET /api/admin/system-settings`
- `POST /api/admin/system-settings`
- `GET /api/admin/system-settings/:settingId`
- `PATCH /api/admin/system-settings/:settingId`
- `DELETE /api/admin/system-settings/:settingId`

Operational value:

- useful for system configuration smoke checks;
- useful when confirming that only `SUPER_ADMIN` may write global settings.

<a id="manual-operation-shortlist"></a>

## Manual Operation Shortlist

Use these collections first for day-to-day manual operations:

- `01-user-role-token-setup`
  - auth login, role assignment, token bootstrap, access-summary verification
- `04-checkout-reference-role-tests`
  - shipping carrier and payment method admin operations
- `05-inventory-admin-tests`
  - inventory inspection and adjustments
- `10-storefront-home-and-admin-tests`
  - storefront curation and featured category operations
- `11-system-settings-admin-tests`
  - global settings admin operations

Use these mostly for regression or feature-level debugging:

- `03-cart-endpoint-tests`
- `06-product-media-submodule-tests`
- `07-product-relations-submodule-tests`
- `08-product-reviews-submodule-tests`
- `09-orders-module-tests`

<a id="when-to-use-json-instead"></a>

## When To Use JSON Instead

Read the raw Postman JSON instead of this summary when you need:

- exact request body examples;
- exact bearer-token variable names;
- test scripts and variable capture logic;
- cleanup behavior;
- temporary runtime variable names;
- exact folder-level execution order inside a collection.
