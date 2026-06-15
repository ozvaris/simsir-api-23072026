# Verify Project Architecture / Protocol Documents

## Purpose

This is a **verification-only** task.

Please inspect the repository and verify which project architecture, protocol, RBAC, prompt-preparation, and Postman-related documents currently exist.

Do **not** modify, create, rename, or delete any files.

The goal is to confirm the actual file paths in the repository and report whether the expected documentation set is present, missing, duplicated, renamed, or outdated.

---

## Verification Scope

Please check the following expected documentation groups.

---

## 1. Core Architecture Documents

Expected files:

```text
docs/basearchitecturedocs/architectureguide.md
docs/basearchitecturedocs/nestjs-api-contract.md
docs/basearchitecturedocs/nestjs-entities-and-relations.md
docs/basearchitecturedocs/backend-module-patterns.md
```

Please verify:

- Whether each file exists.
- Whether the path is exact.
- Whether there are similarly named duplicates or older versions.
- Whether the documents appear to be active/current based on their content.

---

## 2. RBAC / Role Permission Documents

Expected files:

```text
docs/basearchitecturedocs/rbac-module-guide.md
docs/basearchitecturedocs/rbac-api-contract.md
docs/basearchitecturedocs/rbac-role-permission-matrix.md
```

Please verify:

- Whether each file exists.
- Whether they define the current role model.
- Whether the following roles are documented consistently:

```text
CUSTOMER
SUPER_ADMIN
CATALOG_MANAGER
ORDER_MANAGER
SUPPORT_STAFF
```

Please also check whether category/product permissions are consistent with the current expected behavior:

```text
CUSTOMER:
- Public read only
- Admin endpoints should return 403

SUPER_ADMIN:
- Admin read/write/delete/status access

CATALOG_MANAGER:
- Category/Product CRUD access

ORDER_MANAGER:
- Category/Product admin operations should return 403

SUPPORT_STAFF:
- Admin read access allowed
- Write/delete/status operations should return 403
```

---

## 3. Code Update / Prompt Preparation Protocol

Expected current file:

```text
docs/basearchitecturedocs/code-update-prompt-preparation-protocolV2.md
```

Older/problematic file that may also exist:

```text
docs/mainprotocols/code-update-prompt-preparation-protocol.md
```

Please verify:

- Whether `code-update-prompt-preparation-protocolV2.md` exists.
- Whether it is the current intended version.
- Whether the older `code-update-prompt-preparation-protocol.md` still exists.
- If both exist, report the difference at a high level.
- Do not rename or delete anything.

Please specifically check whether the V2 protocol contains guidance around:

```text
- Preparing short, focused Codex prompts
- Avoiding unnecessary large changes
- Separating code implementation from Postman update steps
- Reviewing result documents before deciding next actions
- Not generating Postman collections unless explicitly requested
- Mentioning Postman/Test Impact when relevant
```

---

## 4. Markdown Link / Docs Index Protocol

Expected or previously referenced files:

```text
docs/basearchitecturedocs/backend-docs-index.md
docs/mainprotocols/markdown-link-protocol.md
docs/basearchitecturedocs/markdown-link-protocol-updated.md
```

Please verify:

- Which of these files actually exist.
- Whether there is a current preferred version.
- Whether the backend docs index links correctly to the architecture/protocol documents.
- Whether any markdown links are broken or pointing to outdated filenames.

---

## 5. Category/Product Implementation Result Documents

Expected or previously referenced working/result documents:

```text
category-product-hard-delete-result.md
category-product-status-update-prompt.md
```

Please search the repository for these files.

Please verify:

- Whether they exist.
- Their exact paths.
- Whether they document the latest category/product behavior.
- Whether the hard delete result confirms the current rule:

```text
DELETE = hard delete attempt
PATCH status = active/inactive update
If related records exist, DELETE returns 409 Conflict
Related active or inactive records both count as blocking relations
```

---

## 6. Product Submodule Refactor / Admin Endpoint Prompt Documents

Expected or previously referenced files:

```text
product-submodules-refactor-prompt.md
product-submodules-admin-endpoint-revision-prompt.md
```

Please verify:

- Whether they exist.
- Their exact paths.
- Whether they are still relevant/current.
- Whether they mention product submodules such as media, reviews, or relations.

---

## 7. Postman Collection Files

Expected Postman folder:

```text
postman/
```

Expected or previously referenced collections:

```text
postman/category-product-role-tests.postman_collection.json
postman/user-role-token-setup.postman_collection.json
postman/checkout-reference-role-tests.postman_collection.json
postman/cart-endpoint-tests.postman_collection.json
```

Also search for product submodule collections such as:

```text
product-media-submodule-tests.postman_collection.json
product-reviews-submodule-tests.postman_collection.json
product-relations-submodule-tests.postman_collection.json
README.txt
```

Please verify:

- Which files exist.
- Their exact paths.
- Whether `category-product-role-tests.postman_collection.json` exists.
- Whether the Postman folder structure matches the current repository state.

Do not modify any Postman collection.

---

## 8. Current Category/Product Behavioral Rules To Cross-Check

Please verify whether the documentation and/or implementation consistently reflect the following decisions:

```text
1. DELETE should attempt hard delete.
2. DELETE should not simply set status to inactive.
3. PATCH status should be responsible for active/inactive updates.
4. Category/Product delete should return 409 Conflict when related records exist.
5. Related inactive records still count as relations and should block delete.
6. Public endpoints should expose only active records.
7. Admin endpoints should be able to access active and inactive records.
8. Public endpoints:
   - /api/categories
   - /api/products
9. Admin endpoints:
   - /api/admin/categories
   - /api/admin/products
10. Public/admin response class separation should not be introduced unless admin responses actually require clearly different fields.
11. Entities should not be moved into one global shared entities folder.
12. Modular entity organization should be preserved for future growth:
   - category
   - product
   - order
   - order-detail
   - cart
   - checkout
   - etc.
```

---

## 9. Suggested Commands

You may use commands similar to the following, but adapt them to the repository as needed:

```bash
find docs -type f | sort
find . -type f -iname "*protocol*.md" | sort
find . -type f -iname "*architecture*.md" | sort
find . -type f -iname "*rbac*.md" | sort
find . -type f -iname "*category*product*.md" | sort
find . -type f -iname "*product*submodule*.md" | sort
find postman -type f | sort
```

You may also grep for important terms:

```bash
grep -Rni "hard delete\|409 Conflict\|PATCH status\|inactive\|active" docs ./*.md 2>/dev/null
grep -Rni "Postman\|Test Impact\|collection" docs ./*.md 2>/dev/null
grep -Rni "CATALOG_MANAGER\|SUPPORT_STAFF\|ORDER_MANAGER\|SUPER_ADMIN\|CUSTOMER" docs ./*.md 2>/dev/null
```

---

## Required Output

Please return a markdown report with the following sections:

```md
# Project Architecture Documents Verification Report

## 1. Summary

## 2. Confirmed Existing Files

## 3. Missing Expected Files

## 4. Renamed / Duplicate / Possibly Outdated Files

## 5. Current Core Architecture Docs

## 6. Current RBAC Docs

## 7. Current Prompt / Code Update Protocol Docs

## 8. Current Markdown Link / Docs Index Files

## 9. Category/Product Decision Documents

## 10. Postman Collections Found

## 11. Category/Product Behavior Consistency Check

## 12. Issues / Mismatches Found

## 13. Recommended Next Action
```

The report should be factual and based only on the repository contents.

Again: **do not change any files**.
