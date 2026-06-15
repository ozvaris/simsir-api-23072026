# Codex Task: Verify Product Hard Delete Blocks Existing Order Items

## Goal

Verify whether the actual implementation already blocks product hard delete when related `OrderItem` records exist.

The documentation contract now states that product hard delete should be blocked when the product has related cart items, order items, media records, reviews, or product relations.

This task is verification-only. Do not modify code yet.

## Scope

Inspect the backend implementation related to product hard delete.

Likely relevant areas may include, but are not limited to:

```txt
src/products/
src/orders/
src/**/product*.repository.ts
src/**/product*.service.ts
src/**/order*.entity.ts
src/**/order-item*.entity.ts
```

Use the actual project structure rather than assuming exact paths.

## Questions To Answer

Determine whether `DELETE /api/admin/products/:productId` or the equivalent product admin delete service flow checks for related `OrderItem` records before deleting a product.

Specifically verify:

1. Does the product delete flow check for related cart items?
2. Does the product delete flow check for related media records?
3. Does the product delete flow check for related reviews?
4. Does the product delete flow check for source product relations?
5. Does the product delete flow check for target product relations?
6. Does the product delete flow check for related order items?
7. If order items are checked, where is the check implemented?
8. If order items are not checked, which file and method should be updated in a follow-up implementation task?

## Expected Behavior

Product hard delete should be allowed only when the product has no related records that preserve business or historical data.

Expected blocking records:

```txt
CartItem
OrderItem
ProductMedia
ProductReview
ProductRelation as source product
ProductRelation as target product
```

If any of these related records exist, the delete operation should fail with `409 Conflict`.

## Constraints

- Do not modify files.
- Do not implement the missing check in this task.
- Do not change documentation.
- Do not change Postman collections.
- Do not rename files.
- Do not refactor product services or repositories.
- This is a verification/reporting task only.

## Suggested Search Commands

Use commands similar to these, adapted to the real project structure:

```bash
grep -Rni "delete.*product\|remove.*product\|hard delete\|ConflictException\|cart items\|media records\|reviews\|relations\|order item\|OrderItem" src
grep -Rni "order_items\|orderItems\|OrderItem\|OrderItemEntity" src
grep -Rni "DELETE /api/admin/products\|admin/products" src docs/basearchitecturedocs
```

Also inspect the actual product delete service method manually after locating it.

## Verification Expectations

Return a concise report with:

1. Product delete entry point:
   - controller file;
   - method name;
   - service method called.

2. Product delete implementation:
   - service file;
   - method name;
   - repository/helper methods used.

3. Existing blocking checks:
   - cart item check: present/missing;
   - media check: present/missing;
   - review check: present/missing;
   - source relation check: present/missing;
   - target relation check: present/missing;
   - order item check: present/missing.

4. Result:
   - `IMPLEMENTATION MATCHES CONTRACT`
   - or
   - `IMPLEMENTATION DOES NOT MATCH CONTRACT`

5. If implementation does not match contract:
   - list exact missing check;
   - list exact file/method that should be changed;
   - suggest the minimal follow-up implementation task;
   - do not make the change yet.

## Expected Result Report Format

Use this format:

```md
# Product Hard Delete OrderItem Verification Result

## Summary

Result: IMPLEMENTATION MATCHES CONTRACT / IMPLEMENTATION DOES NOT MATCH CONTRACT

## Files Inspected

- `...`

## Delete Flow

- Controller:
- Controller method:
- Service:
- Service method:

## Blocking Checks

| Related record | Present? | Location / notes |
|---|---:|---|
| CartItem | yes/no | ... |
| OrderItem | yes/no | ... |
| ProductMedia | yes/no | ... |
| ProductReview | yes/no | ... |
| ProductRelation as source | yes/no | ... |
| ProductRelation as target | yes/no | ... |

## Gap

If no gap exists, write:

No implementation gap found.

If a gap exists, write:

The product delete implementation does not currently check related `OrderItem` records before hard delete.

## Recommended Follow-Up

If a gap exists, provide the exact minimal implementation task needed, but do not apply it in this verification task.
```
