# RBAC Role Permission Matrix

<a id="purpose"></a>

## Purpose

This document defines the project-specific RBAC role scope matrix.

It explains:

- which roles exist in the e-commerce backend;
- what each role is responsible for;
- which permission groups belong to each role;
- which endpoint groups each role may access;
- which operations are intentionally denied;
- how RBAC differs from ownership checks;
- which Postman token variables should be used for role-based testing.

This document complements:

- `rbac-module-guide.md` for RBAC design principles;
- `rbac-api-contract.md` for RBAC endpoint contracts;
- `architectureguide.md` for security and authorization protocol;
- `nestjs-api-contract.md` for customer-facing API contracts.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Role List](#role-list)
- [Authorization Model](#authorization-model)
- [Permission Groups](#permission-groups)
- [Role Scope Summary](#role-scope-summary)
- [Role Details](#role-details)
- [Endpoint Access Matrix](#endpoint-access-matrix)
- [Postman Token Variables](#postman-token-variables)
- [Ownership Rules](#ownership-rules)
- [Seed Expectations](#seed-expectations)
- [Testing Checklist](#testing-checklist)
- [Change Rules](#change-rules)

<a id="role-list"></a>

## Role List

The project currently uses these roles:

- `SUPER_ADMIN`
- `CATALOG_MANAGER`
- `ORDER_MANAGER`
- `SUPPORT_STAFF`
- `CUSTOMER`

Roles represent business responsibility.

Permissions represent technical actions.

A user may have more than one role, but the default project model should avoid unnecessary role combinations unless a clear operational need exists.

<a id="authorization-model"></a>

## Authorization Model

RBAC answers:

- may this user perform this action in general?

Ownership answers:

- may this user perform this action on this specific resource instance?

These must remain separate.

Examples:

- `CUSTOMER` may read their own cart but not another user's cart.
- `ORDER_MANAGER` may manage order-related admin flows but should not manage RBAC roles.
- `SUPPORT_STAFF` may read selected support data but should not create/update/delete system reference data.
- `SUPER_ADMIN` may access all admin management areas.

`isAdmin` is a derived convenience field. It must not replace role and permission checks.

<a id="permission-groups"></a>

## Permission Groups

### Catalog Permissions

- `catalog.category.read`
- `catalog.category.create`
- `catalog.category.update`
- `catalog.category.delete`
- `catalog.product.read`
- `catalog.product.create`
- `catalog.product.update`
- `catalog.product.delete`
- `catalog.review.moderate`

### Order Permissions

- `order.read_all`
- `order.update_status`
- `order.cancel`
- `order.refund`

### User Support Permissions

- `user.read`
- `user.update`
- `user.disable`

### Checkout Reference Permissions

- `shipping_carrier.read`
- `shipping_carrier.create`
- `shipping_carrier.update`
- `shipping_carrier.delete`
- `payment_method.read`
- `payment_method.create`
- `payment_method.update`
- `payment_method.delete`

### RBAC Permissions

- `rbac.role.read`
- `rbac.role.create`
- `rbac.role.update`
- `rbac.role.delete`
- `rbac.role.assign_permission`
- `rbac.role.replace_permissions`
- `rbac.role.remove_permission`
- `rbac.permission.read`
- `rbac.permission.create`
- `rbac.permission.update`
- `rbac.permission.delete`
- `rbac.user_role.read`
- `rbac.user_role.assign`
- `rbac.user_role.replace`
- `rbac.user_role.remove`
- `rbac.user_access.read`

<a id="role-scope-summary"></a>

## Role Scope Summary

| Role              | Main Responsibility                     | Access Level                            |
| ----------------- | --------------------------------------- | --------------------------------------- |
| `SUPER_ADMIN`     | Full system administration              | Full admin access                       |
| `CATALOG_MANAGER` | Category and product management         | Catalog admin access                    |
| `ORDER_MANAGER`   | Order and checkout reference management | Order and shipping/payment admin access |
| `SUPPORT_STAFF`   | Support-oriented read access            | Limited read access                     |
| `CUSTOMER`        | Normal customer usage                   | Own data only                           |

<a id="role-details"></a>

## Role Details

<a id="super-admin"></a>

### `SUPER_ADMIN`

Purpose:

- full system administration;
- emergency access to all operational areas;
- RBAC management;
- catalog, order, shipping carrier, payment method, and user-support management.

Expected permissions:

- all permissions.

Expected access:

- `/api/admin/rbac/...`
- `/api/admin/categories/...`
- `/api/admin/products/...`
- `/api/admin/shipping-carriers/...`
- `/api/admin/payment-methods/...`
- future `/api/admin/orders/...`
- future user-support admin endpoints

Must not be used for:

- normal customer testing;
- everyday support actions when a narrower role is enough.

Postman token variable:

- `super_admin_access_token`

<a id="catalog-manager"></a>

### `CATALOG_MANAGER`

Purpose:

- manage the product catalog;
- manage categories and products;
- moderate catalog-related content when needed.

Expected permission groups:

- catalog permissions.

Expected access:

- category admin endpoints;
- product admin endpoints;
- future product media/relation admin endpoints if added;
- product review moderation if implemented.

Expected denial:

- RBAC management;
- shipping carrier management;
- payment method management;
- order status/refund management unless explicitly granted;
- user-role assignment.

Possible permissions:

- `catalog.category.read`
- `catalog.category.create`
- `catalog.category.update`
- `catalog.category.delete`
- `catalog.product.read`
- `catalog.product.create`
- `catalog.product.update`
- `catalog.product.delete`
- `catalog.review.moderate`

Postman token variable:

- `catalog_manager_access_token`

<a id="order-manager"></a>

### `ORDER_MANAGER`

Purpose:

- manage order operations;
- manage checkout reference data used by order flow;
- prepare and maintain shipping/payment options.

Expected permission groups:

- order permissions;
- checkout reference permissions.

Expected access:

- future order admin endpoints;
- shipping carrier admin endpoints;
- payment method admin endpoints.

Expected denial:

- RBAC role/permission management;
- catalog create/update/delete unless explicitly granted;
- user-role assignment.

Possible permissions:

- `order.read_all`
- `order.update_status`
- `order.cancel`
- `order.refund`
- `shipping_carrier.read`
- `shipping_carrier.create`
- `shipping_carrier.update`
- `shipping_carrier.delete`
- `payment_method.read`
- `payment_method.create`
- `payment_method.update`
- `payment_method.delete`

Postman token variable:

- `order_manager_access_token`

<a id="support-staff"></a>

### `SUPPORT_STAFF`

Purpose:

- support customers;
- read operational data needed for support;
- avoid write access unless explicitly required.

Expected permission groups:

- limited user support read permissions;
- limited order read permissions;
- limited checkout reference read permissions.

Expected access:

- read-only admin endpoints where support visibility is needed;
- shipping carrier read;
- payment method read;
- future order read support screens.

Expected denial:

- create/update/delete shipping carriers;
- create/update/delete payment methods;
- RBAC management;
- catalog mutation;
- order refund/cancel unless explicitly granted.

Possible permissions:

- `user.read`
- `order.read_all`
- `catalog.product.read`
- `catalog.category.read`
- `shipping_carrier.read`
- `payment_method.read`

Postman token variable:

- `support_staff_access_token`

<a id="customer"></a>

### `CUSTOMER`

Purpose:

- normal storefront user;
- manage own account, addresses, cart, reviews, and orders.

Expected permission groups:

- no admin permission group by default.

Expected access:

- public catalog reads;
- own profile;
- own addresses;
- own cart;
- own reviews where supported;
- own orders.

Expected denial:

- all `/api/admin/...` endpoints;
- RBAC endpoints;
- catalog admin endpoints;
- shipping carrier admin endpoints;
- payment method admin endpoints;
- order admin endpoints.

Important rule:

- customer access is primarily authenticated user context plus ownership checks, not admin RBAC permissions.

Postman token variable:

- `customer_access_token`

<a id="endpoint-access-matrix"></a>

## Endpoint Access Matrix

| Endpoint Group                           | Public | Customer |           Support Staff | Catalog Manager | Order Manager | Super Admin |
| ---------------------------------------- | -----: | -------: | ----------------------: | --------------: | ------------: | ----------: |
| `GET /api/categories`                    |    Yes |      Yes |                     Yes |             Yes |           Yes |         Yes |
| `GET /api/products`                      |    Yes |      Yes |                     Yes |             Yes |           Yes |         Yes |
| `GET /api/shipping-carriers`             |    Yes |      Yes |                     Yes |             Yes |           Yes |         Yes |
| `GET /api/payment-methods`               |    Yes |      Yes |                     Yes |             Yes |           Yes |         Yes |
| `/api/users/me/...`                      |     No | Own only |                Own only |        Own only |      Own only |    Own only |
| `/api/cart/...`                          |     No | Own only |                Own only |        Own only |      Own only |    Own only |
| `/api/orders` customer endpoints         |     No | Own only |                Own only |        Own only |      Own only |    Own only |
| `/api/admin/categories/...`              |     No |       No | Usually read only or No |             Yes |            No |         Yes |
| `/api/admin/products/...`                |     No |       No | Usually read only or No |             Yes |            No |         Yes |
| `/api/admin/shipping-carriers/...` read  |     No |       No |                     Yes |              No |           Yes |         Yes |
| `/api/admin/shipping-carriers/...` write |     No |       No |                      No |              No |           Yes |         Yes |
| `/api/admin/payment-methods/...` read    |     No |       No |                     Yes |              No |           Yes |         Yes |
| `/api/admin/payment-methods/...` write   |     No |       No |                      No |              No |           Yes |         Yes |
| `/api/admin/orders/...` future           |     No |       No |    Read only if granted |              No |           Yes |         Yes |
| `/api/admin/rbac/...`                    |     No |       No |                      No |              No |            No |         Yes |

Notes:

- `Own only` means access is controlled by authenticated user context and ownership checks.
- `Usually read only or No` should be decided per endpoint and permission seed.
- The endpoint matrix must follow actual permission metadata in code.

<a id="postman-token-variables"></a>

## Postman Token Variables

Use separate Postman environment variables for role-based testing.

| Variable                       | Expected Role     |
| ------------------------------ | ----------------- |
| `customer_access_token`        | `CUSTOMER`        |
| `super_admin_access_token`     | `SUPER_ADMIN`     |
| `catalog_manager_access_token` | `CATALOG_MANAGER` |
| `order_manager_access_token`   | `ORDER_MANAGER`   |
| `support_staff_access_token`   | `SUPPORT_STAFF`   |

Recommended environment variable:

- `Backend_URL`

Example usage:

```txt
{{Backend_URL}}/api/admin/shipping-carriers
```

Token usage:

```txt
Authorization: Bearer {{order_manager_access_token}}
```

<a id="ownership-rules"></a>

## Ownership Rules

RBAC must not replace ownership.

Customer-owned resources:

- profile;
- addresses;
- cart;
- cart items;
- reviews;
- orders.

These flows should use:

- authenticated user context;
- service/repository ownership filtering;
- not request body `userId`.

Recommended behavior:

- if another user's owned resource is requested, return `NotFoundException` or equivalent not-found response to avoid leaking ownership information.

<a id="seed-expectations"></a>

## Seed Expectations

Seed should be idempotent.

Role seed should include:

- `SUPER_ADMIN`
- `CATALOG_MANAGER`
- `ORDER_MANAGER`
- `SUPPORT_STAFF`
- `CUSTOMER`

Recommended initial assignment:

- `SUPER_ADMIN`: all permissions;
- `CATALOG_MANAGER`: catalog permissions;
- `ORDER_MANAGER`: order and checkout reference permissions;
- `SUPPORT_STAFF`: limited read permissions;
- `CUSTOMER`: no admin permissions by default.

Permission and role assignment changes must be reflected in:

- RBAC seed data;
- this matrix document;
- Postman role test collections when relevant.

<a id="testing-checklist"></a>

## Testing Checklist

### Public Reference Data

- tokenless `GET /api/shipping-carriers` returns `200`;
- tokenless `GET /api/payment-methods` returns `200`.

### Customer Restrictions

- `CUSTOMER` cannot access `/api/admin/rbac/roles`;
- `CUSTOMER` cannot create/update/delete shipping carriers;
- `CUSTOMER` cannot create/update/delete payment methods.

### Super Admin Access

- `SUPER_ADMIN` can access RBAC admin endpoints;
- `SUPER_ADMIN` can access shipping carrier admin endpoints;
- `SUPER_ADMIN` can access payment method admin endpoints.

### Order Manager Access

- `ORDER_MANAGER` can manage shipping carriers;
- `ORDER_MANAGER` can manage payment methods;
- `ORDER_MANAGER` cannot manage RBAC roles.

### Support Staff Restrictions

- `SUPPORT_STAFF` can read shipping carriers where read permission is granted;
- `SUPPORT_STAFF` can read payment methods where read permission is granted;
- `SUPPORT_STAFF` cannot create/update/delete shipping carriers;
- `SUPPORT_STAFF` cannot create/update/delete payment methods.

<a id="change-rules"></a>

## Change Rules

When adding a new admin feature:

1. Define the permission group.
2. Decide which role owns the permission.
3. Update RBAC seed data.
4. Update API permission metadata.
5. Update this role matrix.
6. Update Postman role-based test collections.

When adding a new role:

1. Define the business responsibility.
2. Define allowed permission groups.
3. Define explicit denied areas.
4. Add seed data.
5. Add role-based tests.
6. Update this document.

When changing permission scope:

- avoid silently broadening support roles;
- avoid giving `CUSTOMER` admin permissions;
- keep `SUPER_ADMIN` as the only role with full RBAC management unless a dedicated security-admin role is intentionally introduced.
