# Codex Task: Add OrderItem Block Check To Product Hard Delete When OrderItem Exists

## Goal

Update the product hard delete implementation so that existing `OrderItem` records block product deletion with `409 Conflict`.

This task must be applied only if the actual `OrderItem` entity/table mapping exists in the current source tree.

The documentation contract already says that product hard delete should be blocked when related order items exist. Previous verification found that the current product delete flow checks cart items, media, reviews, and product relations, but does not check order items. The same verification also found that no `OrderItem` entity currently exists in `src` at that time.

## Current Verified Gap

Product delete currently uses this flow:

- Controller: `src/modules/products/products-admin.controller.ts`
- Controller method: `deleteProduct(@Param('productId') productId: string)`
- Service: `src/modules/products/products.service.ts`
- Service method: `deleteProduct(productId: string)`
- Existing repository/helper checks:
  - `findProductById(productId)`
  - `countCartItems(productId)`
  - `countMedia(productId)`
  - `countReviews(productId)`
  - `countRelations(productId)`
  - `removeProduct(product)`

Existing blocking checks:

- `CartItem`: present
- `ProductMedia`: present
- `ProductReview`: present
- `ProductRelation` as source: present
- `ProductRelation` as target: present
- `OrderItem`: missing

## Precondition

Before changing code, verify whether an actual `OrderItem` entity/table mapping exists.

Search the source tree for the real order item entity and table mapping.

Suggested commands:

```bash
grep -Rni "class OrderItem\|OrderItem" src
grep -Rni "order_items\|orderItems\|order_item" src
grep -Rni "productId" src/modules/orders src/modules/products
```

## Stop Condition

If no actual `OrderItem` entity/table mapping exists in `src`, do not modify any source file.

Return a result report saying:

```txt
No implementation change applied because OrderItem entity/table mapping does not exist yet.
```

Also identify the future file/method locations that should be updated once `OrderItem` exists.

## Scope If Precondition Is Met

If `OrderItem` entity/table mapping exists, modify only the minimum required implementation files.

Likely files:

```txt
src/modules/products/repositories/products.repository.ts
src/modules/products/products.service.ts
```

Only update additional files if required by the actual project structure, such as module imports or repository dependency registration.

Do not modify documentation files in this task.

Do not modify Postman collections in this task.

## Required Implementation If OrderItem Exists

### 1. Repository

Add a repository/helper method that counts order items referencing the product.

Recommended method name:

```ts
countOrderItems(productId: string): Promise<number>
```

The method should count records where `OrderItem.productId` equals the provided product id.

Use the actual `OrderItem` entity and repository pattern used in the current codebase.

### 2. Service

Update `ProductsService.deleteProduct(productId: string)` so it checks order items before hard deleting the product.

Expected logical behavior:

```txt
if countOrderItems(productId) > 0:
  throw 409 Conflict
```

The conflict message should be consistent with existing conflict messages in `deleteProduct()`.

Recommended message meaning:

```txt
Product cannot be deleted because it has related order items.
```

Use the current project’s existing error wording style if different.

### 3. Delete Rules

After implementation, product hard delete must be blocked by:

- cart items;
- order items;
- media records;
- reviews;
- product relations as source product;
- product relations as target product.

## Constraints

- Keep the change minimal.
- Do not refactor product delete flow.
- Do not rename existing methods unless required.
- Do not change endpoint paths.
- Do not introduce soft delete behavior.
- Do not change product status behavior.
- Do not change category delete behavior.
- Do not modify API contract documentation in this task.
- Do not modify entity documentation in this task.
- Do not modify Postman collections in this task.
- Do not create `OrderItem` entity in this task unless it already exists as part of the current source state and only needs to be referenced.

## Verification

After implementation, run or provide the closest available verification commands.

Suggested checks:

```bash
grep -Rni "countOrderItems" src/modules/products
grep -Rni "OrderItem" src/modules/products src/modules/orders
git diff -- src/modules/products/repositories/products.repository.ts src/modules/products/products.service.ts
git status --short
```

If tests exist for product delete, run the relevant test subset.

Suggested test intent:

1. Product with no related records can be hard-deleted.
2. Product with cart items returns `409 Conflict`.
3. Product with order items returns `409 Conflict`.
4. Product with media records returns `409 Conflict`.
5. Product with reviews returns `409 Conflict`.
6. Product with source product relations returns `409 Conflict`.
7. Product with target product relations returns `409 Conflict`.

If no automated test exists, report that no relevant automated test was found and describe the manual verification path.

## Expected Result Report

Return a concise result report with:

- whether `OrderItem` entity/table mapping exists;
- files changed;
- repository method added or reused;
- service method updated;
- exact blocking behavior added;
- verification command outputs;
- tests run, if any;
- confirmation that documentation and Postman files were not modified.

## Expected Result Report Format

Use this format:

```md
# Product Delete OrderItem Block Implementation Result

## Summary

Result: IMPLEMENTED / NOT APPLIED

## Precondition Check

OrderItem entity/table mapping: found / not found

Evidence:
- `...`

## Files Changed

- `...`

## Implementation

Repository:
- `...`

Service:
- `...`

## Blocking Rules After Change

| Related record | Blocks delete? | Notes |
|---|---:|---|
| CartItem | yes | existing |
| OrderItem | yes | added |
| ProductMedia | yes | existing |
| ProductReview | yes | existing |
| ProductRelation as source | yes | existing |
| ProductRelation as target | yes | existing |

## Verification

Commands run:

```bash
...
```

Results:

```txt
...
```

## Notes

- Documentation files modified: no
- Postman files modified: no
```
