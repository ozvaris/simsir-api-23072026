# Postman Run Order Guide

## Purpose

This document defines the recommended collection run order for the current backend project.

The goal is to make local Postman testing repeatable after:

- fresh database reset;
- seed rerun;
- RBAC/user bootstrap;
- major API contract updates.

## Shared Environment

Use the shared Postman environment:

```txt
Simsir - Local
```

Environment file:

```txt
postman/simsir-local.postman_environment.json
```

This environment should stay active across all collections unless a future workflow explicitly requires a different backend context such as staging or production.

## Setup Output Rule

`01-user-role-token-setup` is the setup collection for the rest of the RBAC-aware suite.

In Postman UI:

- select `Simsir - Local`;
- run `01-user-role-token-setup`;
- then run the downstream collections with the same environment selected.

In Newman CLI:

- run `01-user-role-token-setup` first;
- export its output into:

```txt
postman/simsir-local.newman-runtime.postman_environment.json
```

- then run later collections with that generated environment file.

Preferred pattern:

```bash
newman run postman/04-checkout-reference-role-tests.postman_collection.json \
  -e postman/simsir-local.newman-runtime.postman_environment.json \
  --export-environment postman/simsir-local.newman-runtime.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export postman/reports/04-checkout-reference-role-tests-report.json \
  2>&1 | tee postman/reports/04-checkout-reference-role-tests-output.txt
```

Orders module example:

```bash
newman run postman/09-orders-module-tests.postman_collection.json \
  -e postman/simsir-local.newman-runtime.postman_environment.json \
  --export-environment postman/simsir-local.newman-runtime.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export postman/reports/09-orders-module-tests-report.json \
  2>&1 | tee postman/reports/09-orders-module-tests-output.txt
```

## Recommended Project-Level Run Order

Run collections in this order:

1. **User Role Token Setup**
   - `postman/01-user-role-token-setup.postman_collection.json`
   - Creates/logs in test users and populates role tokens.

2. **Category Product Role Tests**
   - `postman/02-category-product-role-tests.postman_collection.json`
   - Verifies public/admin catalog behavior and creates reusable category/product test data.

3. **Cart Endpoint Tests**
   - `postman/03-cart-endpoint-tests.postman_collection.json`
   - Uses an active product and validates customer cart behavior.

4. **Checkout Reference Role Tests**
   - `postman/04-checkout-reference-role-tests.postman_collection.json`
   - Verifies shipping/payment public/admin flows and role boundaries.

5. **Inventory Admin Tests**
   - `postman/05-inventory-admin-tests.postman_collection.json`
   - Verifies inventory read/write/admin permission flow on seeded demo product data.

6. **Product Media Submodule Tests**
   - `postman/06-product-media-submodule-tests.postman_collection.json`

7. **Product Relations Submodule Tests**
   - `postman/07-product-relations-submodule-tests.postman_collection.json`

8. **Product Reviews Submodule Tests**
   - `postman/08-product-reviews-submodule-tests.postman_collection.json`

9. **Orders Module Tests**
   - `postman/09-orders-module-tests.postman_collection.json`
   - Verifies customer order lifecycle, admin workflow transitions, role guards, and inventory commit/release effects in one collection.

10. **Storefront Home And Admin Tests**
   - `postman/10-storefront-home-and-admin-tests.postman_collection.json`
   - Verifies public storefront home response shape, featured category curation, storefront collection/item admin CRUD, and cleanup.

## Why This Order

### 1. Token setup comes first

Several collections depend on:

- `customer_access_token`
- `super_admin_access_token`
- `catalog_manager_access_token`
- `order_manager_access_token`
- `support_staff_access_token`

Those variables are populated by the token setup collection.

For Newman-based runs, the practical dependency is not just the collection itself but the exported generated environment file produced by that setup run.

### 2. Catalog tests come before cart and submodules

Catalog tests may create reusable category/product test records and confirm that public/admin listing behavior is healthy before downstream workflows use product data.

### 3. Cart depends on active product data

Cart tests capture an active product from the product list, so catalog/product data should already be valid.

### 4. Checkout reference tests depend on role tokens

Shipping/payment admin CRUD and permission checks require preloaded role tokens.

### 5. Inventory tests depend on seeded demo product data

Inventory admin tests assume:

- seeded demo users exist;
- seeded demo product exists;
- seeded inventory exists for the demo product.

### 6. Product submodule tests should run after core catalog checks

Media, relations, and reviews tests are easier to interpret after the base product flow is already verified.

### 7. Orders tests should run after cart, checkout reference, and inventory checks

Orders module tests depend on:

- role tokens from `01-user-role-token-setup`
- active product and catalog behavior already being healthy
- shipping/payment reference data already verified by `04`
- seeded tracked inventory and inventory admin behavior already verified by `05`

The order collection itself creates its own cart/order runtime state, but it is easier to trust and interpret after the upstream catalog, checkout reference, inventory, and review-ready product surface has already been checked.

### 8. Storefront tests should run after core catalog and product submodule checks

Storefront tests depend on:

- role tokens from `01-user-role-token-setup`
- active demo categories and products being available
- base catalog behavior already being healthy

The storefront collection creates curated storefront records on top of the catalog surface, so it is easiest to interpret after the catalog and product-oriented checks have already passed.

## Database Reset (Local Only)

Use the following script only for local seed-data reset testing.

Do not run this against production or any database with data that must be preserved.

```sql
DROP TABLE IF EXISTS
  "cart_items",
  "carts",
  "order_status_history",
  "order_shipment_snapshots",
  "order_payment_snapshots",
  "order_addresses",
  "order_items",
  "orders",
  "inventory_transactions",
  "inventory_reservations",
  "inventory_items",
  "storefront_collection_items",
  "storefront_collections",
  "storefront_featured_categories",
  "addresses",
  "user_credentials",
  "user_roles",
  "role_permissions",
  "product_reviews",
  "product_relations",
  "product_media",
  "products",
  "categories",
  "payment_providers",
  "payment_methods",
  "shipping_carrier_service_payment_capabilities",
  "shipping_carrier_services",
  "shipping_carriers",
  "system_settings",
  "permissions",
  "roles",
  "users"
CASCADE;
```

## Reset And Rerun Flow

After a destructive local reset:

1. Drop tables if needed.
2. Restart the application so schema and seed data are recreated.
3. Import/select `Simsir - Local`.
4. Run `User Role Token Setup`.
5. If using Newman, switch to `postman/simsir-local.newman-runtime.postman_environment.json`.
6. Run the remaining collections in the recommended order.

## Token Expiry Note

JWT access tokens in the local environment may expire during manual or delayed test runs.

If a collection that normally requires authenticated admin or role-based access suddenly starts returning:

- `401 Unauthorized`

while the same collection previously worked, first suspect expired access tokens before assuming a backend regression.

Recommended recovery:

1. rerun `01-user-role-token-setup.postman_collection.json`
2. export the refreshed generated environment again if using Newman
3. rerun the target collection

This is especially relevant for:

- checkout reference admin tests;
- inventory admin tests;
- orders module tests;
- other admin/RBAC collections that depend on bearer tokens created earlier in the session.

## Collection-Level Rule

Inside each collection, run folders in numeric order.

Example:

```txt
01 ...
02 ...
03 ...
```

Numeric folder order is important because later folders may depend on variables created by earlier folders.

## Maintenance Rule

When a new Postman collection is added or an existing one gains new dependencies, update this document if either of these changes happens:

- the project-level recommended run order changes;
- a collection now depends on variables, seed data, or IDs created by another collection.

## Current Scope Note

This guide covers the current implemented Postman collections for:

- RBAC token setup;
- catalog;
- cart;
- checkout reference data;
- inventory admin;
- product submodules;
- orders runtime workflow coverage.
