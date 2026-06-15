# Postman JSON Generation Protocol

## Purpose

This document defines how Postman collections and environment files should be maintained for this backend project.

The goal is to keep Postman artifacts:

- importable;
- modular;
- flat in filesystem layout;
- easy to run in a predictable order;
- synchronized with shared environment usage.

## Core Rule

When the user asks for a Postman artifact, generate or update an importable `.postman_collection.json` file instead of only pasting raw JSON.

For this project:

- each module or scenario should have its own separate collection JSON file;
- collection files should live directly under `postman/`;
- avoid per-collection folders unless the user explicitly requests a special structure;
- avoid auxiliary `README.txt` files for collection usage notes;
- usage notes should live in markdown docs under `docs/`.

## Filesystem Layout Rule

Use a flat `postman/` layout.

Preferred structure:

```txt
postman/
  01-user-role-token-setup.postman_collection.json
  02-category-product-role-tests.postman_collection.json
  03-cart-endpoint-tests.postman_collection.json
  04-checkout-reference-role-tests.postman_collection.json
  05-inventory-admin-tests.postman_collection.json
  06-product-media-submodule-tests.postman_collection.json
  07-product-relations-submodule-tests.postman_collection.json
  08-product-reviews-submodule-tests.postman_collection.json
  simsir-local.postman_environment.json
```

Do not default to:

- `postman/<collection-name>/...`
- zip bundles
- README sidecar files

unless the user explicitly asks for them.

## Shared Environment Rule

When multiple collections target the same local backend context, prefer one shared environment instead of creating a separate environment per collection.

Current project-level shared local environment:

```txt
Simsir - Local
```

Environment file:

```txt
postman/simsir-local.postman_environment.json
```

Use a separate environment only when the execution context is meaningfully different, such as:

- local vs staging;
- different backend base URL;
- different tenant or dataset;
- different secrets that should not live in the common local workflow.

For ordinary collection additions inside the same local backend workflow:

- reuse `Simsir - Local`;
- add new variables there when needed;
- do not create a collection-specific environment by default.

## Setup Collection Dependency Rule

If a collection depends on:

- bearer tokens;
- role assignment results;
- generated user ids;
- temporary ids created by an earlier setup flow;

then document and preserve that dependency explicitly.

Current project rule:

- `01-user-role-token-setup.postman_collection.json` is the setup collection;
- downstream RBAC-aware collections should run after it;
- Newman runs should use the exported generated environment file produced by that setup step.

Preferred Newman pattern:

```bash
newman run postman/04-checkout-reference-role-tests.postman_collection.json \
  -e postman/simsir-local.newman-runtime.postman_environment.json \
  --export-environment postman/simsir-local.newman-runtime.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export postman/reports/04-checkout-reference-role-tests-report.json \
  2>&1 | tee postman/reports/04-checkout-reference-role-tests-output.txt
```

This produces both:

- a machine-readable JSON report under `postman/reports/`
- a plain-text CLI output log under `postman/reports/`

## Collection Naming Rule

Every collection display name should use:

```txt
Simsir - XX <Domain Name>
```

Examples:

```txt
Simsir - 01 User Role Token Setup
Simsir - 02 Category Product Role Tests
Simsir - 03 Cart Endpoint Tests
Simsir - 04 Checkout Reference Role Tests
Simsir - 05 Inventory Admin Tests
```

Rules:

- `XX` should match the project-level run order;
- use two digits;
- keep the domain name stable and descriptive;
- do not use `V2`, `V3`, or similar version suffixes in collection names.

If the collection changes, update the same file and same display name instead of creating a versioned duplicate.

## Collection Filename Rule

File names should also reflect run order and domain:

```txt
01-user-role-token-setup.postman_collection.json
02-category-product-role-tests.postman_collection.json
03-cart-endpoint-tests.postman_collection.json
```

Rules:

- lowercase;
- hyphen-separated;
- numbered to match run order;
- one file per module or scenario;
- no version suffixes such as `-v2`, `-v3`, or `-final`.

## Modular Collection Rule

Keep collections modular.

Do not merge unrelated workflows into one mega collection unless the user explicitly asks for that.

Preferred model:

- one collection for RBAC token setup;
- one collection for category/product role tests;
- one collection for cart;
- one collection for checkout reference flows;
- one collection for inventory admin;
- one collection per product submodule test area;
- future order runtime should also become its own collection.

Reason:

- files stay smaller;
- updates stay localized;
- run-order dependencies remain easier to understand;
- review and maintenance become simpler.

## Folder Rule Inside A Collection

Inside a collection, use numbered folders when execution order matters.

Example:

```txt
01 Public Checks
02 CUSTOMER Access
03 SUPER_ADMIN Access
04 Manager CRUD
05 Negative Role Checks
```

Collections may still be multi-folder internally even though the filesystem layout is flat.

## Postman Environment Variables

Use Postman environment variables instead of hardcoded values.

Base URL:

```txt
{{Backend_URL}}
```

Common token variables:

```txt
{{customer_access_token}}
{{super_admin_access_token}}
{{catalog_manager_access_token}}
{{order_manager_access_token}}
{{support_staff_access_token}}
```

Common auth/bootstrap variables:

```txt
{{Demo_User_Password}}
{{Bootstrap_Super_Admin_Password}}
{{super_admin_email}}
{{catalog_manager_email}}
{{order_manager_email}}
{{support_staff_email}}
```

Common generated id variables:

```txt
{{customer_user_id}}
{{order_manager_user_id}}
{{support_staff_user_id}}
```

Collection-owned temporary variables should use collection-specific names rather than generic names when they are not intended to be shared across the full suite.

Preferred examples:

```txt
{{categoryProductRoleTestCategoryId}}
{{categoryProductRoleTestCategorySlug}}
{{categoryProductRoleTestProductId}}
{{categoryProductRoleTestProductSlug}}
```

Avoid introducing new generic names such as:

```txt
{{test_category_id}}
{{test_category_slug}}
{{test_product_id}}
{{test_product_slug}}
```

unless they are intentionally shared across multiple collections.

When a collection creates temporary records and later hard-deletes them, unset the collection-owned temporary variables before the collection ends so they do not pollute exported generated environment files.

Do not hardcode real tokens.

## URL Rule

Always use `{{Backend_URL}}`.

Correct:

```txt
{{Backend_URL}}/api/categories
```

Wrong:

```txt
http://localhost:4000/api/categories
```

## Authorization Rule

### Public endpoint

Use `noauth`.

### Authenticated endpoint

Use bearer token variables.

### Role-specific endpoint

Use the matching role token:

```txt
CUSTOMER         -> {{customer_access_token}}
SUPER_ADMIN      -> {{super_admin_access_token}}
CATALOG_MANAGER  -> {{catalog_manager_access_token}}
ORDER_MANAGER    -> {{order_manager_access_token}}
SUPPORT_STAFF    -> {{support_staff_access_token}}
```

## Request Naming Rule

Request names should include:

- role or access type;
- method/path summary;
- expected status.

Examples:

```txt
Public - GET /api/categories should return 200
CUSTOMER - GET /api/admin/categories should return 403
CATALOG_MANAGER - POST /api/admin/products should return 200 or 201
SUPPORT_STAFF - PATCH /api/admin/products/:id should return 403
```

## Status Code Test Rule

Every request should assert the expected status code.

Common cases:

- `200`
- `200 or 201`
- `401`
- `403`
- `404`

Create endpoints may accept `200` or `201` when backend behavior may vary.

## Response Shape Rule

Collections should verify meaningful response shape, not just status code.

Examples:

- `items` array checks for list endpoints;
- `success: true` checks for operation endpoints;
- required id/slug/code presence checks for create/detail endpoints;
- inventory summary checks for inventory-aware product responses.

## Variable Capture Rule

When a request returns an id, slug, code, or token needed later, save it into the active environment.

Examples:

- created category ids/slugs;
- created product ids/slugs;
- role user ids;
- access tokens;
- created shipping/payment reference ids;
- captured seeded demo product ids.

Later requests in the same collection may depend on these variables.

## CRUD Flow Rule

A CRUD folder should test the lifecycle in order:

1. create;
2. list/read;
3. detail;
4. update;
5. status update when supported;
6. delete hard-delete attempt or expected business error;
7. public/admin visibility follow-up when applicable.

Delete and deactivate must not be treated as the same operation.

## RBAC Role Test Rule

A role-based collection should verify both positive and negative access.

Typical pattern:

- customer denied admin endpoint;
- elevated role allowed expected domain action;
- unrelated role denied write actions;
- support role may read if explicitly allowed, but should still fail write paths when not granted.

## Documentation Rule

Collection usage guidance should live in markdown docs, not in sidecar `README.txt` files.

Use docs for:

- required environment;
- project-level run order;
- reset and rerun workflow;
- seed assumptions;
- cross-collection dependencies.

Current project-level run-order document:

```txt
docs/basearchitecturedocs/postman-run-order-guide.md
```

## Postman Change Propagation Rule

When a Postman collection is added or updated, the surrounding Postman artifacts must also be reviewed.

At minimum, check whether the change requires updates in:

1. `postman/simsir-local.postman_environment.json`
2. `docs/basearchitecturedocs/postman-run-order-guide.md`
3. collection display name numbering
4. collection filename numbering
5. role token setup collection
6. any upstream collection that creates prerequisite variables or records

### Shared environment update triggers

Update `postman/simsir-local.postman_environment.json` when:

- a collection introduces a new required environment variable;
- a new common token, email, password, slug, or reusable id variable is introduced;
- a collection stops needing a variable and cleanup is appropriate.

### Run order update triggers

Update `docs/basearchitecturedocs/postman-run-order-guide.md` when:

- a new collection is added;
- a collection now depends on variables created by another collection;
- a collection must move earlier or later in the recommended sequence.

### Naming update triggers

Review collection display names and filenames when:

- a new collection is inserted in the run order;
- the project-level ordering changes;
- an old versioned name such as `V2` or `V3` still exists.

### Token setup review triggers

Review the user-role token setup collection when:

- a new role token becomes part of the regular workflow;
- login response handling changes;
- bootstrap password or shared auth assumptions change.

## Generation Checklist

Before handing off a generated or updated Postman artifact, verify:

1. It uses Postman Collection v2.1 schema.
2. It remains modular and does not merge unrelated scenarios by default.
3. It lives directly under `postman/`.
4. It uses `{{Backend_URL}}`.
5. It does not hardcode real tokens.
6. Public requests use `noauth`.
7. Role requests use the correct role token variable.
8. POST/PATCH bodies are raw JSON when needed.
9. Create tests accept `200` or `201` when appropriate.
10. Forbidden tests assert `403`.
11. Unauthorized tests assert `401`.
12. Later requests reuse captured variables correctly.
13. Shared environment impact was reviewed.
14. Run-order document impact was reviewed.
15. Collection display name and filename numbering are still correct.
16. No unnecessary `V2`/`V3` duplication remains.

## Recommended Handoff Format

When handing off updated Postman artifacts, keep the response short and point to the actual JSON files and relevant docs.

Example:

```md
Hazırladım.

- [01-user-role-token-setup.postman_collection.json](...)
- [02-category-product-role-tests.postman_collection.json](...)

Run order:
- [postman-run-order-guide.md](./postman-run-order-guide.md)

Shared environment:
- [simsir-local.postman_environment.json](...)
```
