# Category Delete / Status Update Prompt

## Task

Update Category delete/status behavior according to the canonical backend architecture documents.

Read first:

- `docs/basearchitecturedocs/architectureguide.md`
- `docs/basearchitecturedocs/nestjs-api-contract.md`
- `docs/basearchitecturedocs/nestjs-entities-and-relations.md`
- `docs/basearchitecturedocs/backend-module-patterns.md`
- `docs/basearchitecturedocs/rbac-module-guide.md`

## Goal

Separate **delete** from **status update** for Category.

`DELETE` must mean a hard delete attempt.

`PATCH` must remain the way to change `status` between `active` and `inactive`.

## Required Behavior

### `DELETE /api/admin/categories/:categoryId`

Implement this flow:

1. Check whether the category exists.
   - If not found, return `404 Not Found`.
2. Check child category count.
   - The blocking relation check must include both `active` and `inactive` child categories.
   - If any child category exists, return `409 Conflict`.
3. Check product count.
   - The blocking relation check must include both `active` and `inactive` products.
   - If any product exists for this category, return `409 Conflict`.
4. If no blocking relation exists, hard delete the category.
5. If an unexpected FK/database conflict happens during delete, convert it to a meaningful `409 Conflict` response.

Important:

- `DELETE` must not set `status = inactive`.
- `DELETE` must not change category status.
- `DELETE` must not remove related child categories or products to make deletion succeed.

### `PATCH /api/admin/categories/:categoryId`

Keep status update here.

Examples:

```json
{ "status": "inactive" }
```

```json
{ "status": "active" }
```

Expected behavior:

- `PATCH` can update category status.
- `inactive` categories remain hidden from public category endpoints.
- `active` categories remain visible on public category endpoints according to existing public filtering rules.

## Permissions

Do not change permission names.

Expected permissions remain:

- Delete category: `catalog.category.delete`
- Update category/status: `catalog.category.update`
- Read/list category admin endpoints: `catalog.category.read`

## Scope

Only update Category delete/status behavior.

Do not change:

- Product delete behavior
- User delete behavior
- ShippingCarrier delete behavior
- PaymentMethod delete behavior
- ProductMedia/ProductReview/ProductRelation behavior
- RBAC permission model
- Order/checkout flow
- Postman collections

## Expected Result Report

After implementation, write a short result markdown summary including:

- Files changed
- Final delete behavior
- Final status update behavior
- How child category count is checked
- How product count is checked
- Whether active and inactive related records are both counted
- Build/lint/test results
- Any migration note, if applicable
