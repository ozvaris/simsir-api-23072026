# Codex Task: Add OrderItem Blocking Rule To Product Hard Delete Contract

## Goal

Update the product hard delete API contract so that existing order items also block product deletion.

The entity relationship documentation already treats `OrderItem` as related to `Product`. Therefore, the API contract should explicitly say that a product cannot be hard-deleted when related order items exist.

## Scope

Modify only this file:

```txt
docs/basearchitecturedocs/nestjs-api-contract.md
```

## Required Change

Find the `Admin Products API` section and the endpoint:

```md
### `DELETE /api/admin/products/:productId`
```

Update the delete purpose line from:

```md
- hard delete the product when it has no related cart, media, review, or product relation records.
```

to:

```md
- hard delete the product when it has no related cart, order item, media, review, or product relation records.
```

Then update the delete rules list by adding this rule:

```md
- order items block delete with `409 Conflict`;
```

The rules should include order items alongside the other blocking records.

Recommended final rule block:

```md
Rules:

- `DELETE` does not change product `status`;
- cart items block delete with `409 Conflict`;
- order items block delete with `409 Conflict`;
- media records block delete with `409 Conflict`;
- reviews block delete with `409 Conflict`;
- source or target product relations block delete with `409 Conflict`;
- use `PATCH /api/admin/products/:productId` to change `status`.
```

## Constraints

- Do not modify entity files.
- Do not modify Postman files.
- Do not change implementation code.
- Do not rename endpoints.
- Do not introduce soft delete wording.
- Do not change category delete behavior.
- Do not reformat the whole document.
- Keep the update minimal and targeted.

## Verification

After the change, verify:

1. `nestjs-api-contract.md` contains:

```txt
order item
```

or:

```txt
order items block delete with `409 Conflict`
```

2. The old purpose wording no longer appears exactly as:

```txt
hard delete the product when it has no related cart, media, review, or product relation records.
```

3. The updated purpose wording appears as:

```txt
hard delete the product when it has no related cart, order item, media, review, or product relation records.
```

4. No unrelated files were modified.

Suggested checks:

```bash
grep -Rni "order items block delete" docs/basearchitecturedocs/nestjs-api-contract.md
grep -Rni "hard delete the product when it has no related cart" docs/basearchitecturedocs/nestjs-api-contract.md
git diff -- docs/basearchitecturedocs/nestjs-api-contract.md
git status --short
```

## Expected Result Report

Return a concise result report with:

- files changed;
- exact before/after purpose line;
- added rule line;
- verification command outputs;
- confirmation that no unrelated files were changed.
