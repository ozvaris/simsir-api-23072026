# RBAC API Contract

<a id="purpose"></a>

## Purpose

This document defines the REST API surface for RBAC and admin authorization management.

It complements:

- `architectureguide.md` for architectural rules;
- `rbac-module-guide.md` for RBAC design principles;
- `nestjs-entities-and-relations.md` for entity and relationship definitions;
- `nestjs-api-contract.md` for customer-facing commerce API contracts.

This document intentionally focuses on endpoint contracts, request JSON, response JSON, and access expectations.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Conventions](#conventions)
- [Access Model Summary](#access-model-summary)
- [Role API](#role-api)
- [Permission API](#permission-api)
- [Role Permission API](#role-permission-api)
- [User Role API](#user-role-api)
- [Access Summary API](#access-summary-api)
- [E-commerce Admin Permission Groups](#e-commerce-admin-permission-groups)
- [Seed Strategy](#seed-strategy)
- [Common Error JSON](#common-error-json)
- [Recommended Build Order](#recommended-build-order)

<a id="conventions"></a>

## Conventions

- Base path examples use `/api`.
- RBAC management endpoints are protected admin/internal endpoints.
- IDs are strings.
- Role `code` values are stable business identifiers.
- Permission `code` values are stable technical identifiers.
- Request bodies are represented by DTO classes.
- Response bodies are represented by `Response` suffix classes.
- `isAdmin` is derived from authorization summary, not used as the primary authorization model.
- Tenant fields are intentionally omitted for the current single-store e-commerce phase.

<a id="access-model-summary"></a>

## Access Model Summary

RBAC answers whether a user may perform an action in general.

Ownership checks answer whether a user may perform that action on a specific resource instance.

Recommended access split for the e-commerce project:

- public catalog reads use explicit public metadata;
- customer-owned flows use `JwtAuthGuard` plus ownership checks;
- admin and staff flows use `JwtAuthGuard` plus role or permission guards;
- RBAC management flows are admin/internal only.

JWT payload should stay minimal:

```json
{
  "sub": "usr_001",
  "sessionId": "ses_001"
}
```

Enriched request user context may look like:

```json
{
  "userId": "usr_001",
  "email": "admin@example.com",
  "roles": ["SUPER_ADMIN"],
  "permissions": [
    "rbac.role.read",
    "rbac.role.create",
    "catalog.product.update",
    "order.read_all"
  ],
  "isAdmin": true
}
```

<a id="role-api"></a>

## Role API

### `GET /api/admin/rbac/roles`

Purpose:

- list roles;
- support admin role management screens;
- support filtering by status, system role flag, and search term.

Query params:

- `page`
- `limit`
- `status=active|inactive`
- `isSystem=true|false`
- `search`

Required permission:

- `rbac.role.read`

Response JSON:

```json
{
  "items": [
    {
      "id": "role_001",
      "code": "CATALOG_MANAGER",
      "name": "Catalog Manager",
      "description": "Can manage category and product catalog data.",
      "isSystem": true,
      "status": "active"
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

### `GET /api/admin/rbac/roles/:roleId`

Purpose:

- fetch role detail;
- include assigned permissions;
- optionally include assigned user count.

Required permission:

- `rbac.role.read`

Response JSON:

```json
{
  "id": "role_001",
  "code": "CATALOG_MANAGER",
  "name": "Catalog Manager",
  "description": "Can manage category and product catalog data.",
  "isSystem": true,
  "status": "active",
  "permissions": [
    {
      "id": "perm_001",
      "code": "catalog.product.create",
      "name": "Create product",
      "resource": "catalog.product",
      "action": "create"
    }
  ],
  "assignedUserCount": 3
}
```

### `POST /api/admin/rbac/roles`

Purpose:

- create a new business role.

Required permission:

- `rbac.role.create`

Request JSON:

```json
{
  "code": "SUPPORT_STAFF",
  "name": "Support Staff",
  "description": "Can read customer and order information for support operations.",
  "status": "active"
}
```

Response JSON:

```json
{
  "id": "role_004",
  "code": "SUPPORT_STAFF",
  "name": "Support Staff",
  "description": "Can read customer and order information for support operations.",
  "isSystem": false,
  "status": "active"
}
```

### `PATCH /api/admin/rbac/roles/:roleId`

Purpose:

- update role display fields or status;
- do not update role `code` by default.

Required permission:

- `rbac.role.update`

Request JSON:

```json
{
  "name": "Customer Support Staff",
  "description": "Can read customer-owned data needed for support operations.",
  "status": "active"
}
```

Response JSON:

```json
{
  "id": "role_004",
  "code": "SUPPORT_STAFF",
  "name": "Customer Support Staff",
  "description": "Can read customer-owned data needed for support operations.",
  "isSystem": false,
  "status": "active"
}
```

### `DELETE /api/admin/rbac/roles/:roleId`

Purpose:

- remove or deactivate a role;
- system roles should not be hard-deleted;
- roles assigned to users should usually be deactivated instead of deleted.

Required permission:

- `rbac.role.delete`

Response JSON:

```json
{
  "success": true
}
```

<a id="permission-api"></a>

## Permission API

### `GET /api/admin/rbac/permissions`

Purpose:

- list permissions;
- support filtering by resource, action, status, and search term.

Query params:

- `page`
- `limit`
- `resource`
- `action`
- `status=active|inactive`
- `search`

Required permission:

- `rbac.permission.read`

Response JSON:

```json
{
  "items": [
    {
      "id": "perm_001",
      "code": "catalog.product.create",
      "name": "Create product",
      "description": "Allows creating products from admin catalog management.",
      "resource": "catalog.product",
      "action": "create",
      "isSystem": true,
      "status": "active"
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

### `GET /api/admin/rbac/permissions/:permissionId`

Purpose:

- fetch permission detail.

Required permission:

- `rbac.permission.read`

Response JSON:

```json
{
  "id": "perm_001",
  "code": "catalog.product.create",
  "name": "Create product",
  "description": "Allows creating products from admin catalog management.",
  "resource": "catalog.product",
  "action": "create",
  "isSystem": true,
  "status": "active"
}
```

### `POST /api/admin/rbac/permissions`

Purpose:

- create a permission.

Required permission:

- `rbac.permission.create`

Request JSON:

```json
{
  "code": "catalog.review.moderate",
  "name": "Moderate product review",
  "description": "Allows hiding or approving product reviews.",
  "resource": "catalog.review",
  "action": "moderate"
}
```

Response JSON:

```json
{
  "id": "perm_020",
  "code": "catalog.review.moderate",
  "name": "Moderate product review",
  "description": "Allows hiding or approving product reviews.",
  "resource": "catalog.review",
  "action": "moderate",
  "isSystem": false,
  "status": "active"
}
```

### `PATCH /api/admin/rbac/permissions/:permissionId`

Purpose:

- update permission display fields or status;
- do not update permission `code` by default.

Required permission:

- `rbac.permission.update`

Request JSON:

```json
{
  "name": "Moderate review",
  "description": "Allows review moderation actions.",
  "status": "active"
}
```

Response JSON:

```json
{
  "id": "perm_020",
  "code": "catalog.review.moderate",
  "name": "Moderate review",
  "description": "Allows review moderation actions.",
  "resource": "catalog.review",
  "action": "moderate",
  "isSystem": false,
  "status": "active"
}
```

### `DELETE /api/admin/rbac/permissions/:permissionId`

Purpose:

- remove or deactivate a permission;
- system permissions should not be hard-deleted;
- permissions assigned to roles should usually be deactivated or detached intentionally.

Required permission:

- `rbac.permission.delete`

Response JSON:

```json
{
  "success": true
}
```

<a id="role-permission-api"></a>

## Role Permission API

### `POST /api/admin/rbac/roles/:roleId/permissions`

Purpose:

- add permissions to a role without replacing the current set.

Required permission:

- `rbac.role.assign_permission`

Request JSON:

```json
{
  "permissionCodes": ["catalog.product.create", "catalog.product.update"]
}
```

Response JSON:

```json
{
  "roleId": "role_001",
  "permissionCodes": ["catalog.product.create", "catalog.product.update"]
}
```

### `PUT /api/admin/rbac/roles/:roleId/permissions`

Purpose:

- replace a role's full permission set;
- best suited for admin permission matrix screens.

Required permission:

- `rbac.role.replace_permissions`

Request JSON:

```json
{
  "permissionCodes": [
    "catalog.category.read",
    "catalog.category.create",
    "catalog.category.update",
    "catalog.product.read",
    "catalog.product.create",
    "catalog.product.update"
  ]
}
```

Response JSON:

```json
{
  "roleId": "role_001",
  "permissionCodes": [
    "catalog.category.read",
    "catalog.category.create",
    "catalog.category.update",
    "catalog.product.read",
    "catalog.product.create",
    "catalog.product.update"
  ]
}
```

### `DELETE /api/admin/rbac/roles/:roleId/permissions/:permissionId`

Purpose:

- remove a single permission from a role.

Required permission:

- `rbac.role.remove_permission`

Response JSON:

```json
{
  "success": true
}
```

<a id="user-role-api"></a>

## User Role API

### `GET /api/admin/users/:userId/roles`

Purpose:

- list roles assigned to a user;
- optionally include effective permissions.

Required permission:

- `rbac.user_role.read`

Response JSON:

```json
{
  "userId": "usr_002",
  "roles": [
    {
      "id": "role_004",
      "code": "SUPPORT_STAFF",
      "name": "Support Staff"
    }
  ],
  "permissions": ["order.read_all", "user.read"]
}
```

### `POST /api/admin/users/:userId/roles`

Purpose:

- assign roles to a user without replacing existing roles.

Required permission:

- `rbac.user_role.assign`

Request JSON:

```json
{
  "roleCodes": ["SUPPORT_STAFF"]
}
```

Response JSON:

```json
{
  "userId": "usr_002",
  "roleCodes": ["SUPPORT_STAFF"]
}
```

### `PUT /api/admin/users/:userId/roles`

Purpose:

- replace the user's full role set.

Required permission:

- `rbac.user_role.replace`

Request JSON:

```json
{
  "roleCodes": ["SUPPORT_STAFF", "ORDER_MANAGER"]
}
```

Response JSON:

```json
{
  "userId": "usr_002",
  "roleCodes": ["SUPPORT_STAFF", "ORDER_MANAGER"]
}
```

### `DELETE /api/admin/users/:userId/roles/:roleId`

Purpose:

- remove a single role from a user.

Required permission:

- `rbac.user_role.remove`

Response JSON:

```json
{
  "success": true
}
```

<a id="access-summary-api"></a>

## Access Summary API

### `GET /api/auth/me/access-summary`

Purpose:

- return current authenticated user's authorization summary;
- useful for frontend menu visibility and admin UI controls.

Required access:

- authenticated user

Response JSON:

```json
{
  "userId": "usr_001",
  "roles": ["SUPER_ADMIN"],
  "permissions": [
    "catalog.product.create",
    "catalog.product.update",
    "order.read_all",
    "rbac.role.read"
  ],
  "isAdmin": true
}
```

### `GET /api/admin/users/:userId/access-summary`

Purpose:

- return another user's authorization summary for admin inspection.

Required permission:

- `rbac.user_access.read`

Response JSON:

```json
{
  "userId": "usr_002",
  "roles": ["SUPPORT_STAFF"],
  "permissions": ["order.read_all", "user.read"],
  "isAdmin": false
}
```

<a id="e-commerce-admin-permission-groups"></a>

## E-commerce Admin Permission Groups

### Catalog permissions

- `catalog.category.read`
- `catalog.category.create`
- `catalog.category.update`
- `catalog.category.delete`
- `catalog.product.read`
- `catalog.product.create`
- `catalog.product.update`
- `catalog.product.delete`
- `catalog.review.moderate`

### Order permissions

- `order.read_all`
- `order.update_status`
- `order.cancel`
- `order.refund`

### User support permissions

- `user.read`
- `user.update`
- `user.disable`

### Checkout reference permissions

- `shipping_carrier.read`
- `shipping_carrier.create`
- `shipping_carrier.update`
- `shipping_carrier.delete`
- `payment_method.read`
- `payment_method.create`
- `payment_method.update`
- `payment_method.delete`

### RBAC permissions

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

<a id="seed-strategy"></a>

## Seed Strategy

Recommended seed order:

1. permissions;
2. roles;
3. role-permission assignments;
4. first admin user role assignment.

Recommended initial roles:

- `SUPER_ADMIN`
- `CATALOG_MANAGER`
- `ORDER_MANAGER`
- `SUPPORT_STAFF`
- `CUSTOMER`

Seed behavior must be idempotent and based on stable `code` values.

<a id="common-error-json"></a>

## Common Error JSON

Forbidden example:

```json
{
  "statusCode": 403,
  "message": "Missing required permission: catalog.product.update",
  "error": "Forbidden"
}
```

Conflict example:

```json
{
  "statusCode": 409,
  "message": "Role code already exists",
  "error": "Conflict"
}
```

System role protection example:

```json
{
  "statusCode": 400,
  "message": "System role cannot be deleted",
  "error": "Bad Request"
}
```

<a id="recommended-build-order"></a>

## Recommended Build Order

1. Add `Role`, `Permission`, `UserRole`, and `RolePermission` entities.
2. Add idempotent permission and role seed data.
3. Add role and permission read/list endpoints.
4. Add role and permission create/update/deactivate endpoints.
5. Add role-permission assignment and replacement endpoints.
6. Add user-role assignment and replacement endpoints.
7. Add authorization summary service.
8. Enrich request user context from JWT strategy.
9. Add roles and permissions guards/decorators.
10. Protect admin catalog, order, user-support, checkout-reference, and RBAC endpoints.
