# Seed Flow Detail

<a id="purpose"></a>

## Purpose

This document explains how seed data is created in the current backend application.

It expands the Current Seed Flow section in `seed-data-guide.md`.

It focuses on:

- seed execution contexts;
- automatic application startup seed;
- seed execution policy;
- current module seed order;
- manual super admin bootstrap;
- why seed data does not require a super admin token.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Seed Execution Contexts](#seed-execution-contexts)
- [Automatic Application Startup Seed](#automatic-application-startup-seed)
- [Seed Execution Policy](#seed-execution-policy)
- [Current Seed Order](#current-seed-order)
- [Manual Super Admin Bootstrap](#manual-super-admin-bootstrap)
- [Clean Database Setup Flow](#clean-database-setup-flow)

<a id="seed-execution-contexts"></a>

## Seed Execution Contexts

Seed data is created in two main contexts:

- automatic application startup seed;
- manual operational bootstrap.

Automatic seed is owned by module seed services and runs during the Nest application lifecycle.

Manual operational bootstrap is used for explicit setup actions, such as creating the first real super admin account for human login.

<a id="automatic-application-startup-seed"></a>

## Automatic Application Startup Seed

When the application starts, Nest module lifecycle hooks run the registered seed services.

Each seed service checks `shouldRunSeed(...)` before writing data.

Seed services write directly to the database through repositories or TypeORM repositories.

They do not call HTTP endpoints.

They do not pass through guards, JWT authentication, or RBAC checks.

Because of this, automatic seed does not require an authenticated super admin token.

<a id="seed-execution-policy"></a>

## Seed Execution Policy

The project uses three seed categories.

`system` seed:

- may run by default in development or local environments;
- runs in production only when `ENABLE_PRODUCTION_SEED=true` and `SEED_SYSTEM_DATA=true`.

`reference` seed:

- may run by default in development or local environments;
- runs in production only when `ENABLE_PRODUCTION_SEED=true` and `SEED_REFERENCE_DATA=true`.

`demo` seed:

- runs only outside production;
- runs only when `SEED_DEMO_DATA=true`;
- never runs automatically in production.

Demo users also require:

```txt
SEED_DEFAULT_USER_PASSWORD
```

If this value is missing, demo user seed must not create login credentials.

<a id="current-seed-order"></a>

## Current Seed Order

The seed order follows the current module import and lifecycle structure.

The practical order is:

1. **Shipping carriers reference seed**  
   `src/modules/shipping-carriers/seed/shipping-carriers-seed.service.ts`  
   Creates baseline shipping carrier records, shipping carrier service records, and service-level kapida payment capability records.

2. **Payment methods reference seed**  
   `src/modules/payment-methods/seed/payment-methods-seed.service.ts`  
   Creates baseline payment method records including base methods, conditional kapida methods, and payment provider/channel child records.

3. **Categories demo seed**  
   `src/modules/categories/seed/demo-categories-seed.service.ts`  
   Creates demo categories.

4. **Products demo seed**  
   `src/modules/products/seed/demo-products-seed.service.ts`  
   Creates demo products.  
   Depends on category slugs created by the categories demo seed.

5. **Inventory demo seed**  
   `src/modules/inventory/seed/demo-inventory-seed.service.ts`  
   Creates `inventory_items` for demo products.  
   Depends on product slugs created by the products demo seed.

6. **Product media demo seed**  
   `src/modules/product-media/seed/demo-product-media-seed.service.ts`  
   Creates demo product media.  
   Depends on product slugs created by the products demo seed.

7. **Product relations demo seed**  
   `src/modules/product-relations/seed/demo-product-relations-seed.service.ts`  
   Creates demo relations between products.  
   Depends on product slugs created by the products demo seed.

8. **RBAC system seed**  
   `src/modules/rbac/services/rbac-seed.service.ts`  
   Creates roles, permissions, and role-permission links.

9. **Demo users seed**  
   `src/modules/rbac/seed/demo-users-seed.service.ts`  
   Creates non-production users for role-based testing.  
   Requires `SEED_DEMO_DATA=true`.  
   Requires `SEED_DEFAULT_USER_PASSWORD`.  
   Does not create `SUPER_ADMIN`.

10. **Addresses demo seed**  
   `src/modules/addresses/seed/demo-addresses-seed.service.ts`  
   Creates shipping and billing addresses for `customer@example.com`.  
   Uses `OnApplicationBootstrap` so it can run after demo user creation.

11. **Product reviews demo seed**  
    `src/modules/product-reviews/seed/demo-product-reviews-seed.service.ts`  
    Creates demo reviews from `customer@example.com` for demo products.  
    Recalculates product rating averages after review creation.  
    Uses `OnApplicationBootstrap` so it can run after demo user creation.

12. **Orders demo seed**  
    `src/modules/orders/seed/demo-orders-seed.service.ts`  
    Creates sample orders, order items, order address snapshots, payment and shipment snapshots, status history rows, inventory reservations, and inventory transactions.  
    Depends on demo users, demo addresses, checkout reference data, demo products, and demo inventory records.  
    Uses `OnApplicationBootstrap` so it can run after user and address creation.

<a id="manual-super-admin-bootstrap"></a>

## Manual Super Admin Bootstrap

Super admin creation is not demo seed.

Super admin creation is not required for automatic seed services to write baseline records.

It is a separate operational bootstrap step for creating the first real admin login.

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

The command:

- creates `admin@example.com` when the user does not exist;
- creates a credential with a hashed password;
- assigns the `SUPER_ADMIN` role;
- does not overwrite an existing credential password.

The `SUPER_ADMIN` role must already exist before this command can assign it.

That means RBAC system seed should run before super admin bootstrap.

<a id="clean-database-setup-flow"></a>

## Clean Database Setup Flow

For a new empty database, the expected setup flow is:

```txt
Start the application
-> system/reference seed creates baseline records
-> demo seed creates local/demo data when enabled
-> run pnpm bootstrap:super-admin when a real admin login is needed
```

Seed data is inserted at database level and does not need a logged-in admin user.

The super admin is needed only when a human operator needs to log in and call protected admin endpoints.

For local reset testing, an existing disposable database can be dropped back to an empty application-table state with:

```txt
scripts/sql/drop-all-app-tables.sql
```

This helper is destructive and must only be used for local or disposable test databases.
