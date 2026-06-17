# 12 State Consistency Cross Module Tests
## API Contract and Protocol Compliance Audit

## Purpose

This document captures the design basis for a future Postman/Newman audit-style collection focused on cross-module API contract consistency, protocol compliance, response behavior, state transitions, deletion behavior, and runtime hygiene.

This is not implementation yet. The `12` collection has not been created. The goal is to preserve a practical, implementation-ready audit plan before any Postman collection or backend code is changed.

The collection is intended to reveal risks such as:

- inconsistent response envelopes across modules
- inconsistent status-code semantics
- unclear error-body conventions
- route parameter and identifier inconsistencies
- pagination/filter/sort drift
- create/update/delete state mismatch between related endpoints
- hard delete vs inactive visibility differences that are not documented or not intentionally verified
- stale Newman runtime state leaking across runs

## Scope

This collection should test:

- API contract consistency
- protocol compliance
- response body consistency
- HTTP status code consistency
- auth and role error consistency
- validation error shape consistency
- route parameter behavior
- pagination/filter/sort behavior
- cross-module read-after-write behavior
- create/update/delete state transitions
- missing resource behavior
- hard delete behavior
- soft delete / inactive visibility behavior
- method/header/content-type compliance
- runtime environment and cleanup hygiene

It should explicitly distinguish:

- modules that physically remove records
- modules that keep records but hide them by status or active/inactive filtering
- modules whose list and detail visibility differ after a state transition
- modules whose cleanup semantics are business deletes vs disposable test cleanup

## Out of Scope

This collection should not cover:

- deep business-flow testing already covered by `01-08`
- backend refactor proposals as the main output
- frontend or UI testing
- performance or load testing
- security penetration testing
- forced unification of all modules under one delete strategy
- assumptions that soft delete is the only valid deletion model

## Baseline References

Behavioral references should include at minimum:

- `postman/01-user-role-token-setup.postman_collection.json`
- `postman/02-category-product-role-tests.postman_collection.json`
- `postman/03-cart-endpoint-tests.postman_collection.json`
- `postman/04-checkout-reference-role-tests.postman_collection.json`
- `postman/05-inventory-admin-tests.postman_collection.json`
- `postman/06-product-media-submodule-tests.postman_collection.json`
- `postman/07-product-relations-submodule-tests.postman_collection.json`
- `postman/08-product-reviews-submodule-tests.postman_collection.json`

Relevant backend areas worth using as supporting references:

- `src/modules/categories`
- `src/modules/products`
- `src/modules/cart`
- `src/modules/shipping-carriers`
- `src/modules/payment-methods`
- `src/modules/inventory`
- `src/modules/product-media`
- `src/modules/product-relations`
- `src/modules/product-reviews`
- `src/modules/addresses`
- common guards, DTOs, and response classes used by those modules

## Proposed Test Areas

### 12.01 Shared API Protocol Baseline

Objective:
- establish shared assumptions for JSON APIs, auth headers, request scripting patterns, and repeatable base setup

Candidate endpoints / modules to inspect:
- public `GET /api/products`
- public `GET /api/categories`
- `GET /api/auth/me/access`
- existing admin list endpoints from products, shipping carriers, inventory, reviews

Suggested request types:
- `GET`
- selected no-auth and bearer-auth baseline requests

Expected assertions:
- response is JSON where the API claims JSON behavior
- baseline auth header usage is consistent
- reusable response-time sanity checks are optional and only if aligned with project style
- collection script patterns are consistent with accepted `01-08` collections

Required environment variables, if any:
- `Backend_URL`
- shared role tokens from `01`

Cleanup considerations:
- none beyond runtime temp-variable hygiene

Risk revealed by this area:
- inconsistent baseline assumptions will make all later audit folders noisy and hard to trust

### 12.02 Response Envelope Consistency

Objective:
- compare success and error body shapes across public, customer, and admin endpoints

Candidate endpoints / modules to inspect:
- product/category public lists
- cart responses
- inventory read responses
- product media list/detail responses
- relation list/detail responses
- review public/admin responses
- operation result responses like `{ success: true }`

Suggested request types:
- `GET`
- `POST`
- `PATCH`
- `DELETE`

Expected assertions:
- identify whether list endpoints return `items`
- identify whether list endpoints also return `pagination`
- compare direct entity responses vs wrapped responses
- compare operation-result delete responses
- compare error responses that expose `message`, and whether `error` / `statusCode` are stable

Required environment variables, if any:
- collection-owned ids for created resources when needed

Cleanup considerations:
- only use disposable data created by this collection

Risk revealed by this area:
- inconsistent body shapes create client branching and hidden contract drift

### 12.03 HTTP Status Code Contract

Objective:
- verify whether `200`, `201`, `204`, `400`, `401`, `403`, `404`, and `409` are used consistently enough to be predictable

Candidate endpoints / modules to inspect:
- category delete conflict behavior
- product delete conflict behavior
- cart item create/update/delete
- shipping carrier and payment method CRUD
- media/relation/review create/delete flows

Suggested request types:
- `GET`
- `POST`
- `PATCH`
- `PUT`
- `DELETE`

Expected assertions:
- `200` vs `201` behavior for create endpoints
- `404` for missing resources where already proven
- `409` for known conflict paths such as category/product delete constraints
- repeated delete and update-after-delete behavior where safely testable

Required environment variables, if any:
- disposable ids created during the run

Cleanup considerations:
- do not rely on shared seeded records for destructive audit flows unless visibility-only checks are enough

Risk revealed by this area:
- status-code drift hides business meaning and makes error handling inconsistent

### 12.04 Authentication and Authorization Error Protocol

Objective:
- compare how modules expose `401`, `403`, and related error-body behavior

Candidate endpoints / modules to inspect:
- cart
- admin products
- admin inventory
- admin media
- admin relations
- admin reviews
- admin shipping carriers

Suggested request types:
- `GET`
- selected `POST` / `PATCH` / `DELETE` denials where already covered by accepted collections

Expected assertions:
- no-auth returns `401` where already proven
- wrong-role returns `403` where already proven
- compare whether auth failures return consistent JSON error structure

Required environment variables, if any:
- shared role tokens from `01`

Cleanup considerations:
- avoid unnecessary state creation

Risk revealed by this area:
- modules may implement auth failure semantics differently without intentional policy

### 12.05 Validation Error Shape Consistency

Objective:
- compare invalid payload handling and error-body shape across modules

Candidate endpoints / modules to inspect:
- admin product create/update
- cart item create/update
- inventory set/adjustment
- media create/update
- relation create
- review create/update
- shipping/payment admin create/update

Suggested request types:
- invalid `POST`
- invalid `PATCH`
- invalid `PUT`

Expected assertions:
- status-only first pass where behavior is not yet standardized
- minimal error-shape checks where stable fields are actually proven
- compare missing required field, invalid enum, invalid number, malformed body handling

Required environment variables, if any:
- stable disposable parent ids such as product/category ids

Cleanup considerations:
- prefer invalid requests rejected before persistence

Risk revealed by this area:
- validation may exist but expose inconsistent body shapes or inconsistent status semantics

### 12.06 Resource Identifier and Route Parameter Contract

Objective:
- compare malformed id, non-existing id, wrong id type, and route parameter behavior across modules

Candidate endpoints / modules to inspect:
- admin category/product detail
- cart item routes
- inventory product route
- media/relation/review detail routes
- shipping/payment detail routes
- public product slug and category slug routes

Suggested request types:
- `GET`
- `PATCH`
- `DELETE`

Expected assertions:
- malformed UUID handling
- syntactically valid but non-existing id behavior
- slug route behavior vs UUID route behavior
- wrong parent/wrong child nested route behavior where safe

Required environment variables, if any:
- disposable ids and slugs

Cleanup considerations:
- no extra cleanup for malformed or non-existing-id checks

Risk revealed by this area:
- inconsistent identifier semantics complicate consumers and weaken predictability

### 12.07 Pagination Sorting and Filtering Contract

Objective:
- compare list endpoint query behavior and response metadata

Candidate endpoints / modules to inspect:
- public products list
- admin products list
- admin shipping carriers list
- admin media list
- admin relations list
- public/admin reviews list

Suggested request types:
- `GET` with `page`, `limit`, `status`, and other supported query params

Expected assertions:
- default pagination presence or absence
- invalid page/limit behavior
- `items` array presence
- `pagination` metadata consistency where implemented
- sort/filter visibility after inactive/delete transitions where applicable

Required environment variables, if any:
- none beyond auth where needed

Cleanup considerations:
- none for read-only list checks

Risk revealed by this area:
- list endpoint behavior may look uniform but differ in metadata and query semantics

### 12.08 Cross-Module Read-After-Write Consistency

Objective:
- verify that created or updated state is visible consistently from related endpoints

Candidate endpoints / modules to inspect:
- category create/update reflected in public category visibility
- product create/update reflected in public/admin product views
- inventory changes reflected in product inventory summary
- media changes reflected in admin detail and possibly public product detail
- relation changes reflected in public product detail relation shape
- review create/update reflected in admin review list/detail and public review list

Suggested request types:
- `POST`
- `PATCH`
- `PUT`
- follow-up `GET`

Expected assertions:
- create then read consistency
- update then read consistency
- public/admin representation consistency where intentionally expected
- list/detail visibility agreement

Required environment variables, if any:
- disposable ids/slugs for created records

Cleanup considerations:
- all created entities must be disposable and owned by this collection

Risk revealed by this area:
- write success may not guarantee immediate consistent read visibility across related endpoints

### 12.09 Create Update Delete State Transition Contract

Objective:
- audit create/update/delete lifecycle behavior across modules

Candidate endpoints / modules to inspect:
- category/product
- shipping carriers and payment methods
- media
- relations
- reviews
- cart items

Suggested request types:
- `POST`
- `PATCH`
- `PUT`
- `DELETE`
- follow-up `GET`

Expected assertions:
- create then read
- create then update then read
- create then delete then read
- repeated delete
- update after delete
- related-resource behavior after delete
- distinction between cleanup delete and business delete

Required environment variables, if any:
- disposable ids for every created test record

Cleanup considerations:
- cleanup order must respect relations and child records

Risk revealed by this area:
- modules may handle the same lifecycle transitions very differently, and some differences may be unintentional

### 12.10 Missing Resource and Deletion Protocol

Objective:
- distinguish missing-resource semantics from deletion-strategy semantics across modules

Candidate endpoints / modules to inspect:
- category/product public and admin reads
- shipping carrier and payment method detail
- media/relation/review detail after delete
- list visibility after inactive transitions
- relation visibility after related resource removal or invisibility

Suggested request types:
- `GET`
- `PATCH`
- `DELETE`

Expected assertions:
- non-existing resource id behavior
- malformed but syntactically accepted id behavior
- hard-deleted resource behavior
- inactive or hidden resource behavior
- repeated delete behavior
- read-after-delete behavior
- update-after-delete behavior
- list visibility after delete/inactive transition
- cross-module visibility after delete

Required environment variables, if any:
- ids of created then deleted records
- ids/slugs of inactive-status records where intentionally created

Cleanup considerations:
- verify cleanup according to each module’s actual deletion strategy
- do not assume every module should become unreadable in the same way

Risk revealed by this area:
- hidden inconsistency between hard delete, inactive visibility, and relation visibility can produce contract ambiguity

### 12.11 Content Type Method and Header Compliance

Objective:
- compare method, content-type, and header handling across modules

Candidate endpoints / modules to inspect:
- customer write endpoints
- admin create/update endpoints
- public read endpoints

Suggested request types:
- method mismatch requests where safe
- JSON requests without `Content-Type`
- requests with unexpected `Accept`
- optional `OPTIONS`/`405` exploration only if consistent with current API patterns

Expected assertions:
- method mismatch behavior
- unsupported or missing content-type behavior
- JSON requirement handling
- whether content negotiation expectations are stable enough to document

Required environment variables, if any:
- auth tokens where needed

Cleanup considerations:
- none if using rejected requests only

Risk revealed by this area:
- protocol-level inconsistencies may never surface in happy-path regression tests

### 12.12 Runtime Environment and Cleanup Hygiene

Objective:
- enforce collection repeatability and prevent stale runtime state from leaking across runs

Candidate endpoints / modules to inspect:
- all modules touched by `12`
- exported runtime environment behavior
- cleanup sections from accepted collections as pattern references

Suggested request types:
- final verification `GET`
- script-only cleanup checks

Expected assertions:
- collection-owned variable naming standard
- final `unset` coverage
- shared auth/base variables preserved
- no stale ids/slugs/status markers remain
- cleanup ordering respects hard-delete vs inactive-visibility differences

Required environment variables, if any:
- shared role tokens
- collection-owned `stateConsistencyContract...` variables

Cleanup considerations:
- clean only resources created by this collection
- verify absence according to actual delete strategy, not by assumption

Risk revealed by this area:
- stale Newman runtime state can invalidate the audit and contaminate later collections

## Folder-Level Candidate Matrix

### 12.01 Shared API Protocol Baseline

| Request | Method | Endpoint | Module Area | Protocol Scenario | Expected Status | Expected Assertion Focus | Required Env | Cleanup | Risk Revealed |
|---|---|---|---|---|---|---|---|---|---|
| Public products baseline | `GET` | `/api/products` | products | public JSON baseline | `200` | JSON body, `items`, optional `pagination` | `Backend_URL` | No | baseline response drift |
| Public categories baseline | `GET` | `/api/categories` | categories | public JSON baseline | `200` | JSON body, `items` | `Backend_URL` | No | inconsistent public baseline |
| Customer access summary baseline | `GET` | `/api/auth/me/access` | auth | bearer auth baseline | `200` | JSON body, token/header pattern, role summary | `customer_access_token` | No | auth header inconsistency |
| Admin products baseline | `GET` | `/api/admin/products` | products admin | admin JSON baseline | `200` | JSON body, `items`, shared script conventions | `catalog_manager_access_token` | No | admin baseline mismatch |

### 12.02 Response Envelope Consistency

| Request | Method | Endpoint | Module Area | Protocol Scenario | Expected Status | Expected Assertion Focus | Required Env | Cleanup | Risk Revealed |
|---|---|---|---|---|---|---|---|---|---|
| Public product list envelope | `GET` | `/api/products` | products | list envelope | `200` | `items`, optional `pagination` | none | No | list envelope drift |
| Cart aggregate envelope | `GET` | `/api/cart` | cart | customer aggregate response | `200` | `id`, `items`, `summary` | `customer_access_token` | No | aggregate shape inconsistency |
| Inventory detail envelope | `GET` | `/api/admin/products/:productId/inventory` | inventory | nested detail envelope | `200` | `productId`, `inventory` object | `catalog_manager_access_token`, product id | No | nested response inconsistency |
| Delete operation result | `DELETE` | disposable delete endpoints | mixed | delete body contract | `200` | `{ success: true }` vs direct resource body | created ids | Yes | delete envelope drift |
| Deleted detail error envelope | `GET` | deleted detail endpoints | mixed | post-delete error body | `404` | status-only or JSON + `message` depending on module | deleted ids | No | error envelope inconsistency |

### 12.03 HTTP Status Code Contract

| Request | Method | Endpoint | Module Area | Protocol Scenario | Expected Status | Expected Assertion Focus | Required Env | Cleanup | Risk Revealed |
|---|---|---|---|---|---|---|---|---|---|
| Category delete with related product | `DELETE` | `/api/admin/categories/:categoryId` | categories | conflict delete | `409` | conflict preserved | created category/product ids | Yes | conflict semantics drift |
| Product create | `POST` | `/api/admin/products` | products admin | create status | `200/201` | create status consistency | `catalog_manager_access_token`, category id | Yes | create status inconsistency |
| Cart item create | `POST` | `/api/cart/items` | cart | create status | `200/201` | customer create semantics | `customer_access_token`, product id | Yes | customer create semantics drift |
| Media create | `POST` | `/api/admin/products/:productId/media` | media | create status | `200/201` | admin create semantics | `catalog_manager_access_token`, product id | Yes | create status inconsistency |
| Deleted review detail | `GET` | `/api/admin/products/reviews/:reviewId` | reviews | post-delete status | `404` | missing-resource semantics | deleted review id | No | delete/read contract mismatch |

### 12.04 Authentication and Authorization Error Protocol

| Request | Method | Endpoint | Module Area | Protocol Scenario | Expected Status | Expected Assertion Focus | Required Env | Cleanup | Risk Revealed |
|---|---|---|---|---|---|---|---|---|---|
| No-auth cart read | `GET` | `/api/cart` | cart | missing token | `401` | status, optional JSON if present | none | No | unauthenticated contract drift |
| Customer denied admin products | `GET` | `/api/admin/products` | products admin | wrong role | `403` | status | `customer_access_token` | No | wrong-role semantics mismatch |
| Customer denied inventory read | `GET` | `/api/admin/products/:productId/inventory` | inventory | wrong role | `403` | status | `customer_access_token`, product id | No | admin denial inconsistency |
| No-auth review create | `POST` | `/api/products/:productId/reviews` | reviews | missing token on write | `401` | status | product id | No | write-auth semantics drift |
| Customer denied admin review detail | `GET` | `/api/admin/products/reviews/:reviewId` | reviews admin | wrong role | `403` | status | `customer_access_token`, review id | No | admin detail denial inconsistency |

### 12.05 Validation Error Shape Consistency

| Request | Method | Endpoint | Module Area | Protocol Scenario | Expected Status | Expected Assertion Focus | Required Env | Cleanup | Risk Revealed |
|---|---|---|---|---|---|---|---|---|---|
| Invalid product payload | `POST` | `/api/admin/products` | products admin | missing/invalid required field | candidate | status-first, error-shape candidate | `catalog_manager_access_token`, category id | No | validation semantics unclear |
| Invalid cart payload | `POST` | `/api/cart/items` | cart | missing `productId` / bad quantity | candidate | status-first | `customer_access_token` | No | customer validation drift |
| Invalid inventory adjustment | `POST` | `/api/admin/products/:productId/inventory/adjustments` | inventory | invalid enum/quantity | candidate | status-first | `catalog_manager_access_token`, product id | No | inventory validation drift |
| Invalid media payload | `POST` | `/api/admin/products/:productId/media` | media | missing `src` / bad `sortOrder` | candidate | status-first | `catalog_manager_access_token`, product id | No | media validation drift |
| Invalid review payload | `POST` | `/api/products/:productId/reviews` | reviews | missing rating / out-of-range value | candidate | status-first | `customer_access_token`, product id | No | review validation drift |

### 12.06 Resource Identifier and Route Parameter Contract

| Request | Method | Endpoint | Module Area | Protocol Scenario | Expected Status | Expected Assertion Focus | Required Env | Cleanup | Risk Revealed |
|---|---|---|---|---|---|---|---|---|---|
| Public product slug detail | `GET` | `/api/products/:slug` | products public | slug route baseline | `200` | slug/detail consistency | product slug | No | slug contract inconsistency |
| Deleted media detail | `GET` | `/api/admin/products/media/:mediaId` | media | non-existing after delete | `404` | missing-resource behavior | deleted media id | No | route/id inconsistency |
| Deleted relation detail | `GET` | `/api/admin/products/relations/:relationId` | relations | non-existing after delete | `404` | missing-resource behavior | deleted relation id | No | route/id inconsistency |
| Deleted payment method detail | `GET` | `/api/admin/payment-methods/:paymentMethodId` | payment methods | deleted id behavior | `404` | missing-resource behavior | deleted payment method id | No | id contract inconsistency |
| Malformed UUID candidate | mixed | multiple `:id` routes | mixed | malformed route parameter | candidate | status-first | none | No | route parameter contract unclear |

### 12.07 Pagination Sorting and Filtering Contract

| Request | Method | Endpoint | Module Area | Protocol Scenario | Expected Status | Expected Assertion Focus | Required Env | Cleanup | Risk Revealed |
|---|---|---|---|---|---|---|---|---|---|
| Public products list with page/limit | `GET` | `/api/products?page=1&limit=2` | products | default pagination contract | `200` | `items`, `pagination` | none | No | pagination drift |
| Admin products inactive filter | `GET` | `/api/admin/products?status=inactive` | products admin | inactive filtering | `200` | filter response and metadata | `catalog_manager_access_token` | No | filter semantics drift |
| Admin shipping carriers list | `GET` | `/api/admin/shipping-carriers?page=1&limit=2` | shipping carriers | explicit pagination | `200` | `items`, `pagination` | `order_manager_access_token` | No | admin pagination mismatch |
| Admin media list | `GET` | `/api/admin/products/:productId/media?page=1&limit=5` | media | paged nested list | `200` | `items`, `pagination`, sort order | `catalog_manager_access_token`, product id | No | nested list metadata drift |
| Public/admin reviews list | `GET` | review list endpoints | reviews | list metadata comparison | `200` | public vs admin pagination shape | tokens if admin | No | public/admin list drift |

### 12.08 Cross-Module Read-After-Write Consistency

| Request | Method | Endpoint | Module Area | Protocol Scenario | Expected Status | Expected Assertion Focus | Required Env | Cleanup | Risk Revealed |
|---|---|---|---|---|---|---|---|---|---|
| Create category then public list | `POST` + `GET` | category create + `/api/categories` | categories | create/read consistency | create then `200` | public visibility after create | `catalog_manager_access_token` | Yes | create/read mismatch |
| Create product then public/admin reads | `POST` + `GET` | product create + product reads | products | create/read consistency | create + reads succeed | id/slug/inventory consistency | `catalog_manager_access_token`, category id | Yes | public/admin read drift |
| Inventory update then product detail | `PUT` + `GET` | inventory set + public product detail | inventory/products | cross-module summary consistency | `200` then `200` | on-hand/reserved/available coherence | `catalog_manager_access_token`, product id | Restore required | write/read mismatch |
| Create media then admin/public reads | `POST` + `GET` | media create + admin/public reads | media/products | related read consistency | create then reads | media visibility and order | `catalog_manager_access_token`, product id | Yes | related read drift |
| Create review then public/admin reads | `POST` + `GET` | review create + public/admin reads | reviews | public/admin read-after-write | create then reads | review visibility consistency | `customer_access_token`, `catalog_manager_access_token`, product id | Yes | read-after-write drift |
| Create address then list mine | `POST` + `GET` | `/api/users/me/addresses` | addresses | user-owned create/read consistency | create then `200` | created address appears in own list with stable `userId` and default flags | `customer_access_token` | Yes | user-owned read-after-write drift |

### 12.09 Create Update Delete State Transition Contract

| Request | Method | Endpoint | Module Area | Protocol Scenario | Expected Status | Expected Assertion Focus | Required Env | Cleanup | Risk Revealed |
|---|---|---|---|---|---|---|---|---|---|
| Product create -> update -> read | `POST` + `PATCH` + `GET` | admin/public product endpoints | products | update lifecycle | success statuses | updated field visibility | `catalog_manager_access_token`, category id | Yes | update/read mismatch |
| Media create -> update -> detail | `POST` + `PATCH` + `GET` | media endpoints | media | update lifecycle | success statuses | updated alt/sortOrder visible | `catalog_manager_access_token`, product id | Yes | detail staleness |
| Review create -> update -> admin detail | `POST` + `PATCH` + `GET` | review endpoints | reviews | update lifecycle | success statuses | updated rating/comment visible | `customer_access_token`, `catalog_manager_access_token`, product id | Yes | update/read mismatch |
| Address create -> update -> list | `POST` + `PATCH` + `GET` | `/api/users/me/addresses` + `/api/users/me/addresses/:addressId` | addresses | user-owned update lifecycle | success statuses | updated label/default fields visible in own list | `customer_access_token` | Yes | user-owned update/read mismatch |
| Create -> delete -> read | mixed | disposable module resources | mixed | delete lifecycle | success then `404`/hidden | post-delete behavior | created ids | Yes | delete contract inconsistency |
| Repeated delete / update-after-delete candidate | mixed | same deleted resources | mixed | repeated transition | candidate | status-first | deleted ids | No | repeated delete semantics unclear |

### 12.10 Missing Resource and Deletion Protocol

| Request | Method | Endpoint | Module Area | Protocol Scenario | Expected Status | Expected Assertion Focus | Required Env | Cleanup | Risk Revealed |
|---|---|---|---|---|---|---|---|---|---|
| Deleted shipping carrier detail | `GET` | `/api/admin/shipping-carriers/:id` | shipping carriers | hard-deleted detail | `404` | deleted detail missing | deleted carrier id | No | hard-delete semantics drift |
| Deleted payment method detail | `GET` | `/api/admin/payment-methods/:id` | payment methods | hard-deleted detail | `404` | deleted detail missing | deleted payment method id | No | hard-delete semantics drift |
| Deleted media detail | `GET` | `/api/admin/products/media/:mediaId` | media | hard-deleted detail | `404` | deleted detail missing + message if stable | deleted media id | No | delete protocol drift |
| Inactive product absent from public list | `GET` | `/api/products` after status inactive | products | inactive visibility | `200` | not listed publicly | inactive product id/slug | cleanup after delete | inactive visibility mismatch |
| Inactive category absent from public list | `GET` | `/api/categories` after status inactive | categories | inactive visibility | `200` | not listed publicly | inactive category id/slug | cleanup after delete | inactive visibility mismatch |
| Deleted relation detail | `GET` | `/api/admin/products/relations/:relationId` | relations | hard-deleted detail | `404` | missing relation | deleted relation id | No | relation delete protocol drift |
| Deleted review detail | `GET` | `/api/admin/products/reviews/:reviewId` | reviews | hard-deleted detail | `404` | missing review | deleted review id | No | review delete protocol drift |
| Deleted address absent from own list | `GET` | `/api/users/me/addresses` after delete | addresses | user-owned delete visibility | `200` | deleted address no longer appears in owner list | `customer_access_token`, deleted address id | No | user-owned delete/list drift |

### 12.11 Content Type Method and Header Compliance

| Request | Method | Endpoint | Module Area | Protocol Scenario | Expected Status | Expected Assertion Focus | Required Env | Cleanup | Risk Revealed |
|---|---|---|---|---|---|---|---|---|---|
| Missing JSON content type on write | `POST` | selected JSON write endpoints | mixed | content-type handling | candidate | status-first | auth if needed | No | content-type inconsistency |
| Unsupported method candidate | wrong method | selected endpoints | mixed | method contract | candidate | status-first | auth if needed | No | method compliance unclear |
| Unexpected `Accept` header candidate | `GET` | public/admin read endpoints | mixed | accept-header behavior | candidate | status/body behavior | auth if needed | No | negotiation inconsistency |
| No-auth read with standard JSON accept | `GET` | public endpoints | mixed | header baseline | `200` | content-type and body coherence | none | No | header baseline drift |

### 12.12 Runtime Environment and Cleanup Hygiene

| Request | Method | Endpoint | Module Area | Protocol Scenario | Expected Status | Expected Assertion Focus | Required Env | Cleanup | Risk Revealed |
|---|---|---|---|---|---|---|---|---|---|
| Final cleanup verification read | `GET` | safe public endpoint | shared | final collection closeout | `200` | cleanup script runs after assertions | `Backend_URL` | No | stale runtime leakage |
| Variable absence check | script-only | n/a | shared | exported runtime hygiene | n/a | all `stateConsistencyContract...` vars absent | collection-owned vars | Yes | stale ids/slugs remain |
| Shared auth preservation check | script-only | n/a | shared | shared env safety | n/a | role tokens/base vars preserved | shared vars | No | shared env corruption |
| Post-delete visibility verification | mixed | module-specific follow-up reads/lists | mixed | cleanup according to actual delete strategy | mixed | hard-delete vs inactive-hide both respected | created ids/slugs | Yes | false cleanup assumptions |

## Proposed Collection Flow

The future collection should run in a safe, repeatable Newman-compatible order:

1. verify shared auth/base variables from `01`
2. capture or create only disposable fixtures needed by `12`
3. run shared protocol and response-baseline checks first
4. run read-only consistency checks before destructive lifecycle checks
5. group stateful create/update/delete audit flows by module family
6. perform follow-up read/list checks immediately after each mutation while context is fresh
7. clean child/dependent records before parent records
8. reserve final folder for runtime-environment cleanup and stale-variable verification

The collection should:

- reuse role tokens from `01-user-role-token-setup`
- avoid destructive actions against real or shared non-disposable data
- create only its own disposable test records where necessary
- clean up only data it created
- avoid depending on stale ids from previous runs

## Environment Variable Design

Recommended `12` collection prefix:

- `stateConsistencyContract...`

Examples:

- `stateConsistencyContractCategoryId`
- `stateConsistencyContractCategorySlug`
- `stateConsistencyContractProductId`
- `stateConsistencyContractProductSlug`
- `stateConsistencyContractInventoryProductId`
- `stateConsistencyContractReviewId`
- `stateConsistencyContractRelationId`
- `stateConsistencyContractMediaId`
- `stateConsistencyContractAddressId`
- `stateConsistencyContractShippingCarrierId`
- `stateConsistencyContractPaymentMethodId`
- `stateConsistencyContractInactiveProductId`
- `stateConsistencyContractDeletedProductId`
- `stateConsistencyContractHardDeletedMediaId`

Variables expected before the run:

- `Backend_URL`
- `super_admin_access_token`
- `customer_access_token`
- `catalog_manager_access_token`
- `order_manager_access_token`
- `support_staff_access_token`
- role user ids created by `01`

Variables created during the run:

- all `stateConsistencyContract...` ids, slugs, statuses, and disposable resource markers

Variables removed during final cleanup:

- only `stateConsistencyContract...` variables actually used by `12`

Shared variables that must never be removed:

- base URL
- role tokens
- role user ids
- any canonical shared seed variables intentionally owned by earlier setup flows

## Assertion Standards

Common assertion standards for `12` should include:

- status code checks
- JSON body existence checks where JSON is expected
- response envelope shape checks
- error body shape checks only where stable enough to assert
- id/slug consistency checks
- create-then-read consistency checks
- update-then-read consistency checks
- delete result checks
- read-after-delete checks
- repeated delete checks where safe
- list visibility checks after delete/inactive transition
- cleanup verification checks
- environment variable absence checks after final cleanup

Optional:

- response-time sanity checks only if aligned with existing collection style and not noisy

## Repeatability Rules

This collection should:

- tolerate already-existing setup data where appropriate
- not depend on stale ids from previous runs
- not leave module-specific test artifacts behind
- not delete data it did not create
- not assume all delete operations behave the same way
- verify cleanup according to each module’s actual delete strategy
- distinguish hard delete from inactive/hidden visibility
- keep child/parent cleanup ordering explicit

## Coverage Verification Notes

Outcome: `B` - the document was already mostly sufficient, but it needed stronger repo-grounded verification notes and explicit user-owned resource representation.

### Module Coverage Status

| Module | Status | Verification Note |
|---|---|---|
| categories | Covered | Accepted collections and service logic both show admin lifecycle, conflict delete behavior, and public active-only visibility. |
| products | Covered | Strong baseline from `02`, plus repo support for slug/detail/list consistency, conflict delete checks, and status-driven visibility. |
| product-media | Covered | `06` and service logic provide parent-child lifecycle, hard delete, detail `404`, and pagination signals. |
| product-relations | Covered | `07` and service logic provide relation create/delete/detail signals, uniqueness conflict, and missing-resource behavior. |
| product-reviews | Covered | `08` and service logic provide public/admin read split, user-owned mutation path, delete/read-after-delete, and rating recalculation signal. |
| payment-methods | Covered | `04` and service logic provide public/admin reference behavior, status toggles, provider nesting, hard delete, and delete-after-detail `404`. |
| shipping-carriers | Covered | `04` and service logic provide public/admin reference behavior, status toggles, nested service/capability lifecycle, hard delete, and post-delete `404`. |
| addresses | Gap | Repo clearly has user-owned create/update/delete/list behavior, but accepted `01-08` collections do not currently exercise it. `12` should keep address coverage as a representative user-owned candidate, not as already-proven baseline behavior. |

### Resource Type Coverage Status

| Resource Type | Status | Representative Module(s) |
|---|---|---|
| Main resource | Covered | categories, products |
| Parent-child submodule | Covered | product-media, shipping carrier services, payment providers |
| Relation resource | Covered | product-relations |
| User-owned resource | Covered with gap note | product-reviews are baseline-backed; addresses are repo-backed but not yet collection-backed |
| Reference/config resource | Covered | shipping-carriers, payment-methods |

### Observed Repo Signals

- categories: admin delete uses hard remove with conflict guards for children/products; public reads filter active records.
- products: list/detail expose pagination and slug-based public lookup; delete is hard remove guarded by cart/media/review/relation counts.
- product-media: parent product existence is required; media detail/delete use hard missing-resource semantics.
- product-relations: source/target existence is validated; self-relation and duplicate relation are conflict paths; delete is hard remove.
- product-reviews: public list requires a public product, while customer update/delete are owner-scoped and return `NotFound` when the scoped record is absent.
- payment-methods: public list is filtered through active payment methods and optional shipping-service context; admin lifecycle includes status toggles, nested providers, and hard delete.
- shipping-carriers: public list is assembled from active carriers/services/payment capabilities; admin lifecycle includes status toggles, nested resources, and hard delete.
- addresses: owner-scoped list/update/delete rely on `findByIdAndUserId`; delete may also reassign default address state inside the same owner scope.

### Open Questions

- addresses are now represented as a valuable user-owned audit target, but the lack of accepted `01-08` collection coverage means their future `12` assertions should start conservative and repo-grounded.
- malformed route parameter behavior is still only partially evidenced by accepted collections; `12.06` should keep malformed-id checks as targeted candidates rather than assume a global `400` rule.
- repeated delete and update-after-delete behavior remain representative audit targets, but not every module currently provides enough accepted-collection evidence to lock exact status codes in advance.

## Risks and Open Questions

Important audit questions already visible from the repository:

- some modules use physical `remove(...)` semantics for deletes
- some modules rely on `status` fields and active-only public visibility
- some list endpoints include `pagination`, others may expose only `items`
- some delete flows return `{ success: true }`, while other endpoints return full resource shapes
- some accepted collections assert only status, while others assert status plus JSON `message`

Open questions to surface later as audit findings:

- should error response envelopes be standardized further across modules?
- should repeated delete behavior be documented per module where it intentionally differs?
- are inactive resources consistently hidden from public lists and details?
- do relation or nested endpoints ever surface references to resources that are no longer publicly visible?
- are malformed route parameter behaviors intentionally consistent across modules?
- can every cleanup path be safely verified without relying on shared data?

## Acceptance Criteria

This design-plan is complete when:

- all `12` sub-folders have a clear audit purpose
- candidate endpoints/modules are identified
- hard delete and inactive/visibility-based behavior are both considered
- missing resource and deletion behavior are documented separately
- environment variable strategy is documented
- cleanup strategy is documented
- Newman repeatability is considered
- no backend code or Postman implementation has been changed
- this Markdown file is created in the repository
