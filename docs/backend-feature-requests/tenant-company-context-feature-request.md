# Tenant Company Context Feature Request

## Current State

The current backend works as a single operational e-commerce backend.

RBAC can decide whether a user may perform an action in general through roles and permissions.

User-owned flows use the authenticated `userId` for ownership checks where needed.

The request user context does not currently include tenant, company, store, seller, organization, or similar scope information.

In the current model, an admin user manages products, orders, and operational data as a global backend operator.

This is acceptable for a single-store or single-operation e-commerce backend, but it does not yet answer which company, store, seller, or organization a request is acting for.

## Missing Point

The backend does not yet have a tenant/company context model.

When the same backend application is used by multiple companies, stores, sellers, institutions, or organizations, each request must know which operational scope it belongs to.

Example:

```txt
User A -> admin of Company 1 store
User B -> admin of Company 2 store
```

Both users may have the `catalog.product.update` permission.

Permission alone only answers whether the action is allowed in general. It does not decide whether User A may update Company 2 products.

The request context would need an additional scope field such as:

```ts
{
  userId: 'usr_001',
  roles: ['STORE_ADMIN'],
  permissions: ['catalog.product.update'],
  tenantId: 'company_001',
}
```

Depending on the future product model, this field may be named `tenantId`, `companyId`, `storeId`, `sellerId`, or `organizationId`.

Missing capabilities include:

- representing companies, stores, sellers, tenants, or organizations;
- linking users to one or more tenant/company scopes;
- resolving active tenant/company context per request;
- restricting admin or staff actions to their allowed tenant/company data;
- filtering catalog, order, stock, customer, and operational data by tenant/company scope;
- combining RBAC permissions with tenant/company ownership rules.

## Why It Is Not Blocking

The current main backend cycle can continue with the single-store/single-operation model.

RBAC and user-owned ownership checks are enough for the current implementation phase.

This feature should be planned after the main cycle is complete, when marketplace, multi-store, seller, or company-scoped requirements are ready to be designed.

## Why It Matters Later

Tenant/company context is required when the same backend serves more than one operational scope.

It enables:

- marketplace seller isolation;
- multi-store product and order separation;
- company-specific admin access;
- staff users limited to their assigned operational scope;
- safer reporting and data filtering;
- future SaaS-style or B2B expansion.

RBAC answers whether a user may perform an action in general. Tenant/company context answers which company's, store's, seller's, or organization's data the user may access.

Without this context, future marketplace or multi-store admins with the same permission could not be safely limited to their own operational data.

## Status

Future Feature Request
