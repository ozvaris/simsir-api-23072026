# Product Hard Delete OrderItem Verification Result

This document records the verification result for `docs/verify-product-delete-orderitem-check-codex-task.md`.

No source, documentation contract, or Postman files were modified as part of this verification result.

## Summary

Result: **IMPLEMENTATION DOES NOT MATCH CONTRACT**

The product delete flow blocks cart items, media, reviews, and product relations, but it does **not** check related `OrderItem` records before hard delete.

## Files Inspected

- `src/modules/products/products-admin.controller.ts`
- `src/modules/products/products.service.ts`
- `src/modules/products/repositories/products.repository.ts`
- `src/modules/orders/orders.module.ts`
- `docs/basearchitecturedocs/nestjs-api-contract.md`
- `docs/basearchitecturedocs/nestjs-entities-and-relations.md`

## Delete Flow

- Controller: `src/modules/products/products-admin.controller.ts`
- Controller method: `deleteProduct(@Param('productId') productId: string)`
- Service called: `this.productsService.deleteProduct(productId)`
- Service: `src/modules/products/products.service.ts`
- Service method: `deleteProduct(productId: string)`
- Repository/helper methods used:
  - `findProductById(productId)`
  - `countCartItems(productId)`
  - `countMedia(productId)`
  - `countReviews(productId)`
  - `countRelations(productId)`
  - `removeProduct(product)`

## Blocking Checks

| Related record            | Present? | Location / notes                                                              |
| ------------------------- | -------: | ----------------------------------------------------------------------------- |
| CartItem                  |      yes | `ProductsService.deleteProduct()` calls `ProductsRepository.countCartItems()` |
| OrderItem                 |       no | No `OrderItem` entity/check found under `src`; no `countOrderItems()` method  |
| ProductMedia              |      yes | `ProductsService.deleteProduct()` calls `ProductsRepository.countMedia()`     |
| ProductReview             |      yes | `ProductsService.deleteProduct()` calls `ProductsRepository.countReviews()`   |
| ProductRelation as source |      yes | `ProductsRepository.countRelations()` checks `sourceProductId`                |
| ProductRelation as target |      yes | `ProductsRepository.countRelations()` checks `targetProductId`                |

## Gap

The product delete implementation does not currently check related `OrderItem` records before hard delete.

`docs/basearchitecturedocs/nestjs-entities-and-relations.md` documents `OrderItem` and `Product 1 - N OrderItem`, and `docs/basearchitecturedocs/nestjs-api-contract.md` says order items block product delete. However, the current source tree only has `src/modules/orders/orders.module.ts` and order enums; no `OrderItem` entity exists in `src`.

## Recommended Follow-Up

Minimal follow-up implementation task:

Add an `OrderItem` product relation check to product hard delete once the `OrderItem` entity/repository exists.

Likely files/methods to update:

- `src/modules/products/repositories/products.repository.ts`
  - add `countOrderItems(productId: string): Promise<number>`
- `src/modules/products/products.service.ts`
  - call `countOrderItems(productId)` inside `deleteProduct()`
  - return `409 Conflict` when count is greater than zero

Do not apply this until the actual `OrderItem` entity/table mapping is present or confirmed.
