# Seed Data Guide

<a id="purpose"></a>

## Purpose

This document defines the backend seed data guide for the project.

It explains:

- which data may be seeded;
- where seed data should live;
- how seed code should be structured;
- which seed data is safe for production;
- which seed data belongs only to local development or demos;
- how SQL bootstrap scripts should relate to module seed services.

This document does not define API endpoints, entity schemas, or migration strategy. Those belong to companion documents.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Seed Data Categories](#seed-data-categories)
- [System Seed](#system-seed)
- [Reference Seed](#reference-seed)
- [Demo and Development Seed](#demo-development-seed)
- [Production Safety Rules](#production-safety-rules)
- [Never Auto-Seed In Production](#never-auto-seed-production)
- [Current Seed Flow](#current-seed-flow)
- [Module Seed Structure](#module-seed-structure)
- [Idempotency Rules](#idempotency-rules)
- [Seed Update Policy](#seed-update-policy)
- [SQL Bootstrap Scripts](#sql-bootstrap-scripts)
- [Local Seed Reset Helper](#local-seed-reset-helper)
- [Super Admin Bootstrap](#super-admin-bootstrap)
- [When to Add Seed Data](#when-to-add-seed-data)
- [Review Checklist](#review-checklist)

<a id="seed-data-categories"></a>

## Seed Data Categories

Seed data must be classified before implementation.

The project uses these seed categories:

- system seed;
- reference seed;
- demo and development seed.

The category decides where the seed belongs, when it may run, and whether it is safe for production.

<a id="system-seed"></a>

## System Seed

System seed is required for the backend to enforce core platform behavior.

Examples:

- roles;
- permissions;
- role-permission links;
- default system access rules;
- bootstrap super admin role assignment when explicitly required.

System seed should be:

- idempotent;
- safe to run more than once;
- explicit about system-owned records;
- separated from demo data;
- reviewed carefully before production use.

Current examples:

- `src/modules/rbac/seed/rbac-seed.data.ts`
- `scripts/sql/check-super-admin-bootstrap.sql` as a manual inspection helper only
- `scripts/sql/user-roles.sql`

RBAC seed data must stay aligned with:

- `rbac-module-guide.md`;
- `rbac-api-contract.md`;
- `rbac-role-permission-matrix.md`.

<a id="reference-seed"></a>

## Reference Seed

Reference seed is stable operational data used by real application flows.

Examples:

- shipping carriers;
- shipping carrier services;
- shipping service payment capabilities for kapida collection methods;
- payment methods;
- payment providers;
- future order status reference values;
- future country, region, or checkout reference records if the project adds them.

Reference seed should be:

- small;
- predictable;
- idempotent;
- safe for local and staging environments;
- production-safe only when the values are intentionally real operational defaults.

Current examples:

- `src/modules/shipping-carriers/seed/shipping-carriers-seed.service.ts`
- `src/modules/payment-methods/seed/payment-methods-seed.service.ts`

Current checkout reference intent:

- shipping carrier seed may create carrier/company records;
- the same shipping carrier seed may also create service/option child records owned by those carriers;
- the same shipping carrier seed may also create service-level kapida capability records;
- payment method seed creates the stable payment method catalog used by checkout and orders.
- the same payment method seed may also create provider/channel child records under a payment method.

Reference records with `status` should normally seed as `active` unless there is a clear reason to seed inactive examples for development only.

<a id="demo-development-seed"></a>

## Demo and Development Seed

Demo and development seed is sample data used for local testing, demos, or frontend development.

Examples:

- sample categories;
- sample products;
- product media;
- sample users for non-production role testing;
- sample carts;
- sample orders after the orders module exists.

Demo and development seed must not run automatically in production.

Demo seed should be:

- clearly named as demo or development seed;
- environment-gated;
- easy to reset;
- safe to delete;
- separated from system and reference seed.

Do not mix demo data into RBAC seed, checkout reference seed, or production bootstrap scripts.

Default demo users may be created for non-production role testing when `SEED_DEMO_DATA=true`.

Recommended demo users:

| Role              | Email                         | User Name         |
| ----------------- | ----------------------------- | ----------------- |
| `CATALOG_MANAGER` | `catalog.manager@example.com` | `catalog.manager` |
| `ORDER_MANAGER`   | `order.manager@example.com`   | `order.manager`   |
| `SUPPORT_STAFF`   | `support.staff@example.com`   | `support.staff`   |
| `CUSTOMER`        | `customer@example.com`        | `customer`        |

`SUPER_ADMIN` should not be created as an automatic demo user. Super admin bootstrap should stay explicit and operational through the `pnpm bootstrap:super-admin` command.

Default demo user password should come from:

```txt
SEED_DEFAULT_USER_PASSWORD
```

If the password env is missing, demo user seed should not run. Do not hard-code a reusable default password in production-capable seed code.

Default demo user seed should:

- create the user only when email and username do not already exist;
- create a credential with a hashed password;
- assign the matching role by role `code`;
- skip password overwrite for existing users;
- add missing role assignment idempotently;
- stay disabled in production even when other system/reference seeds are enabled.

Current demo seed examples:

- `src/modules/rbac/seed/demo-users-seed.service.ts`
- `src/modules/categories/seed/demo-categories-seed.service.ts`
- `src/modules/products/seed/demo-products-seed.service.ts`
- `src/modules/inventory/seed/demo-inventory-seed.service.ts`
- `src/modules/product-media/seed/demo-product-media-seed.service.ts`
- `src/modules/product-relations/seed/demo-product-relations-seed.service.ts`
- `src/modules/product-reviews/seed/demo-product-reviews-seed.service.ts`
- `src/modules/addresses/seed/demo-addresses-seed.service.ts`
- `src/modules/orders/seed/demo-orders-seed.service.ts`

Demo catalog data should stay module-owned:

- category demo records belong to the categories module;
- product demo records belong to the products module;
- inventory demo records belong to the inventory module and must create stock state separately from product catalog records;
- product media demo records belong to the product media module.
- product relation demo records belong to the product relations module.
- product review demo records belong to the product reviews module and may depend on demo users and demo products.
- address demo records belong to the addresses module and must remain tied to demo users only.
- order demo records belong to the orders module and may depend on demo users, demo addresses, demo products, checkout reference seed, and inventory records.

Product seed must not carry stock quantity fields directly when inventory is modeled separately. In the current structure:

- product demo seed creates catalog products;
- inventory demo seed creates `inventory_items` for those products;
- order demo seed may then create reservations, inventory transactions, and sample order state on top of that inventory layer.

<a id="production-safety-rules"></a>

## Production Safety Rules

Production seed rules must be conservative.

This section defines the high-level production posture.

Allowed in production only when explicitly intended:

- system roles and permissions;
- required role-permission links;
- carefully reviewed reference data;
- explicit super admin bootstrap only when the deployment process requires it.

Not allowed as automatic production seed:

- fake users;
- fake customer data;
- fake products;
- demo carts;
- demo orders;
- temporary testing records;
- Postman-only records.

Production seed must not silently overwrite business-managed data.

If a production seed update changes existing system behavior, document the reason and expected effect before rollout.

<a id="never-auto-seed-production"></a>

## Never Auto-Seed In Production

This section is the explicit deny-list for automatic production seed behavior.

The following data must never be auto-seeded in production:

- demo users;
- fake customer accounts;
- fake customer addresses;
- fake products;
- fake product media;
- fake product reviews;
- demo carts;
- demo orders;
- sample payment data;
- temporary testing records;
- Postman-only setup records.

Production seed must not create sample business data.

If production needs an initial admin, role assignment, or reference value, it must be an explicit system or reference seed decision, not a demo seed.

Production must not auto-create default role users such as catalog manager, order manager, support staff, or customer demo accounts.

<a id="current-seed-flow"></a>

## Current Seed Flow

Detailed seed execution flow is documented in:

- [Seed Flow Detail](./seed-flow-deatil.md)

Seed data is created in two separate contexts:

- automatic application startup seed;
- manual operational bootstrap.

Automatic seed runs from Nest module lifecycle hooks when the application starts.

Seed code writes directly to the database through repositories or TypeORM repositories. It does not call HTTP endpoints and does not require an authenticated super admin token.

The current startup flow includes:

- reference seed for shipping carriers and payment methods;
- demo catalog seed for categories, products, inventory, product media, product relations, addresses, reviews, and orders when demo seed is enabled;
- RBAC system seed for roles, permissions, and role-permission links;
- demo user seed after RBAC roles exist.

Order, dependency notes, and lifecycle details belong in the linked detail document instead of being duplicated here.

Super admin creation is not part of automatic seed.

For a clean database, the typical setup flow is:

```txt
Start the application
-> system/reference seed creates baseline records
-> demo seed creates local/demo data when enabled
-> run pnpm bootstrap:super-admin when a real admin login is needed
```

The super admin is needed for a human operator to log in and call admin endpoints. It is not needed for seed code to insert baseline records.

<a id="module-seed-structure"></a>

## Module Seed Structure

Module-owned seed code should live inside the module that owns the data.

Recommended structure:

```txt
src/modules/<module-name>/seed/
```

Examples:

```txt
src/modules/rbac/seed/
src/modules/shipping-carriers/seed/
src/modules/payment-methods/seed/
src/modules/inventory/seed/
src/modules/orders/seed/
```

Checkout reference modules may keep related reference layers in one seed service when they belong to the same module boundary.

Example:

- shipping carrier module may seed:
  - carrier records;
  - carrier service records;
  - service payment capability records.

Seed services should:

- use repositories or TypeORM repositories consistently with the module;
- avoid duplicating business rules from services unless needed;
- normalize stable codes the same way the module does;
- avoid cross-module writes unless the seed explicitly belongs to a system bootstrap flow.

Seed data constants may live beside the seed service when they are module-owned and reusable.

Seed services should respect these environment switches:

- `SEED_SYSTEM_DATA` controls system seed outside production and must be enabled explicitly in production;
- `SEED_REFERENCE_DATA` controls reference seed outside production and must be enabled explicitly in production;
- `SEED_DEMO_DATA` controls demo seed and must never run in production;
- `SEED_DEFAULT_USER_PASSWORD` supplies the password for non-production demo users;
- `ENABLE_PRODUCTION_SEED` must be enabled before any production system/reference seed can run.

Outside production, system and reference seed may run by default unless their category switch is explicitly disabled.

Demo seed must be explicitly enabled with `SEED_DEMO_DATA=true`.

<a id="idempotency-rules"></a>

## Idempotency Rules

Seed operations must be idempotent.

Running the same seed twice should not create duplicates.

Use stable natural keys for lookup:

- role `code`;
- permission `code`;
- shipping carrier `code`;
- shipping carrier service `shippingCarrierId + code`;
- shipping service payment capability `shippingCarrierServiceId + paymentMethod`;
- payment method `code`;
- payment provider `paymentMethodId + code`;
- product `slug` for inventory demo lookup;
- inventory item `productId`;
- user `email` and `userName` for demo users;
- order `orderNumber`;
- future reference data `code`.

Seed code may:

- create missing records;
- update system-owned fields when the seed is authoritative;
- skip existing records when business-managed data should not be overwritten.

Seed code must not:

- create duplicate records;
- depend on random IDs;
- assume a clean database;
- delete user-managed production data.

This section defines the general rule set.

The current implementation behavior is documented separately in Seed Update Policy.

<a id="seed-update-policy"></a>

## Seed Update Policy

This section describes the current implementation behavior of the existing seed services.

The default behavior is:

- create missing records;
- create missing links or credentials when required;
- skip existing business-managed records;
- avoid restoring edited records back to seed defaults unless the seed is explicitly authoritative.

Current skip-only seed behavior:

- RBAC permission seed creates missing permissions by `code` and does not restore edited permission fields;
- RBAC role seed creates missing roles by `code` and does not restore edited role fields;
- RBAC role-permission seed adds missing links and does not remove extra existing links;
- shipping carrier reference seed creates missing carriers by `code` and does not restore edited carrier fields;
- shipping carrier service reference seed creates missing services by `shippingCarrierId + code` and does not restore edited service fields;
- shipping carrier service payment capability seed creates missing capabilities by `shippingCarrierServiceId + paymentMethod` and does not restore edited capability fields;
- payment method reference seed creates missing methods by `code` and does not restore edited payment method fields;
- payment provider reference seed creates missing providers by `paymentMethodId + code` and does not restore edited provider fields;
- demo category seed creates missing categories by `slug` and does not restore edited category fields;
- demo product seed creates missing products by `slug` and does not restore edited product fields;
- demo inventory seed creates a missing inventory item by `productId` and does not restore edited stock values;
- demo product media seed creates missing media by `productId + src` and does not restore edited media fields;
- demo product relation seed creates missing relations by `sourceProductId + targetProductId + relationType` and does not remove extra relations;
- demo product review seed skips an existing `productId + userId` review and does not overwrite edited review fields.
- demo order seed creates a missing order by `orderNumber` and does not restore edited order, item, snapshot, reservation, or transaction fields.

Current partial-completion seed behavior:

- demo user seed creates missing users, missing credentials, and missing role assignments;
- demo user seed does not overwrite existing user profile fields;
- demo user seed does not overwrite an existing credential password;
- super admin bootstrap creates a missing user, missing credential, and missing `SUPER_ADMIN` assignment;
- super admin bootstrap does not overwrite an existing credential password.

Current state-affecting exceptions:

- demo address seed creates missing addresses, but when a new seeded default address is inserted it clears the previous default flag for that user and address type;
- demo product review seed recalculates product rating averages after inserting new seeded reviews, so product `rating` may change when new review rows are added.
- demo order seed may increase `reservedQuantity` for active reservations or decrease `onHandQuantity` for committed demo delivery scenarios when it inserts a new order for the first time.

If a future seed must restore system-owned fields back to canonical seed values, that seed should be documented explicitly as authoritative before implementation.

<a id="sql-bootstrap-scripts"></a>

## SQL Bootstrap Scripts

SQL bootstrap scripts are allowed for explicit operational bootstrap steps.

They should be used when:

- a deployment or local setup needs a direct one-time operation;
- the operation is easier and safer as explicit SQL;
- the script is not pretending to be a general module seed service.

SQL bootstrap scripts must be:

- idempotent when possible;
- clearly named;
- scoped to one purpose;
- safe to review before execution.

Example:

```sql
ON CONFLICT DO NOTHING;
```

SQL scripts should not become the default place for module seed data.

If a seed belongs to a module's normal bootstrap behavior, prefer a module seed service.

<a id="local-seed-reset-helper"></a>

## Local Seed Reset Helper

The project may use a destructive SQL helper for local seed reset testing:

```txt
scripts/sql/drop-all-app-tables.sql
```

This script drops application tables with `CASCADE` so the local database can be tested as a clean database again.

It must only be used against local or disposable test databases.

It must not be used against production, staging, shared QA, or any database with data that must be preserved.

When `.env` contains the database connection values, the script can be run with:

```bash
set -a
source .env
set +a

PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USERNAME" \
  -d "$DB_DATABASE" \
  -f scripts/sql/drop-all-app-tables.sql
```

After the tables are dropped, restart the application.

With the current development setup, `synchronize: true` recreates the tables and startup seed services recreate baseline records according to seed policy and environment values.

<a id="super-admin-bootstrap"></a>

## Super Admin Bootstrap

The first super admin is an explicit operational bootstrap step.

It must not be created as demo seed or automatic startup seed.

For a clean database, use the TypeScript bootstrap command.

If the bootstrap values are defined in `.env`, load them into the shell first:

```bash
set -a
source .env
set +a

pnpm bootstrap:super-admin
```

`set -a` exports variables loaded from `.env` so `src/cli/bootstrap-super-admin.ts` can read them from `process.env`.

For a one-off password override, use:

```bash
BOOTSTRAP_SUPER_ADMIN_PASSWORD='<password>' pnpm bootstrap:super-admin
```

Optional environment variables:

- `BOOTSTRAP_SUPER_ADMIN_EMAIL` defaults to `admin@example.com`;
- `BOOTSTRAP_SUPER_ADMIN_USERNAME` defaults to `super.admin`;
- `BOOTSTRAP_SUPER_ADMIN_NAME` defaults to `Super`;
- `BOOTSTRAP_SUPER_ADMIN_SURNAME` defaults to `Admin`;
- `BOOTSTRAP_SUPER_ADMIN_PHONE` defaults to `null`.

The bootstrap command should:

- require `BOOTSTRAP_SUPER_ADMIN_PASSWORD`;
- create the super admin user when missing;
- create the password credential when missing;
- never overwrite an existing credential password;
- assign the `SUPER_ADMIN` role when missing;
- fail clearly if the `SUPER_ADMIN` role does not exist;
- be safe to run more than once.

The SQL script `scripts/sql/check-super-admin-bootstrap.sql` is only an inspection helper for checking whether the expected super admin user, credential, role, and role assignment exist.

It must not mutate data.

For a new empty database, use the TypeScript bootstrap command instead of SQL mutation helpers.

<a id="when-to-add-seed-data"></a>

## When to Add Seed Data

Add seed data when the application cannot be used safely or tested realistically without known baseline records.

Good seed candidates:

- RBAC permissions needed by guards;
- baseline roles needed by admin flows;
- checkout reference data needed by checkout screens;
- shipping carrier + service combinations needed by shipping selection screens;
- conditional kapida capability defaults needed by shipping-aware payment selection;
- non-production demo users for role-based manual and Postman testing;
- controlled demo catalog data for local development only.

Avoid seed data when:

- the data should be created by users through normal admin flows;
- the data is temporary for one test run;
- the data belongs in a Postman collection variable flow;
- the data would hide missing API or admin functionality.

<a id="review-checklist"></a>

## Review Checklist

Before adding or changing seed data, check:

1. Which seed category is this?
2. Is it production-safe?
3. Is it idempotent?
4. Which module owns it?
5. Which stable key prevents duplicates?
6. Can it overwrite business-managed data?
7. Does it belong in code seed, SQL bootstrap, or Postman setup?
8. Does it need documentation in an API, RBAC, entity, or feature request document?
9. If it creates demo users, is `SEED_DEMO_DATA=true` required and is production blocked?
10. If it creates credentials, does the password come from environment and get stored only as a hash?
