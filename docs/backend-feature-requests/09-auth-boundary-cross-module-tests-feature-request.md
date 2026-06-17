# Auth Boundary Cross Module Tests Feature Request

## Status

Future Feature Request / Design Captured

## Related Feature Area

- RBAC Permission Granularity Review
- Cross-module authorization guardrail coverage

## Purpose

This document captures the planned design basis for a future Postman/Newman guardrail collection focused on cross-module auth and RBAC boundaries across the accepted `01-08` regression suite.

This is not implementation yet. The `09` collection has not been created. This request exists to preserve the intended scope, evidence rules, safety boundaries, and low-risk rollout strategy before any collection work begins.

## Planned Collection

- File: `postman/09-auth-boundary-cross-module-tests.postman_collection.json`
- Display Name: `Simsir - 09 Auth Boundary Cross Module Tests`
- Scope: cross-module baseline auth boundary coverage built on top of accepted `01-08` collections

## Source Collections Reviewed

The design basis for this feature request was extracted from the accepted collections below:

- `postman/01-user-role-token-setup.postman_collection.json`
- `postman/02-category-product-role-tests.postman_collection.json`
- `postman/03-cart-endpoint-tests.postman_collection.json`
- `postman/04-checkout-reference-role-tests.postman_collection.json`
- `postman/05-inventory-admin-tests.postman_collection.json`
- `postman/06-product-media-submodule-tests.postman_collection.json`
- `postman/07-product-relations-submodule-tests.postman_collection.json`
- `postman/08-product-reviews-submodule-tests.postman_collection.json`

Reference protocol:

- `docs/basearchitecturedocs/postman-newman-analysis-protocol.md`

## Scope

- public endpoint -> no token returns `200`
- protected endpoint -> no token returns `401`
- wrong role -> `403`
- correct role -> allowed response

## Out of Scope

- ownership isolation
- negative validation
- invalid UUID / invalid payload
- full API contract audit
- CORS / security headers
- backend permission refactor

## Proposed Folder Structure

- `00 Prerequisite - Verify Runtime Variables And Capture Stable Fixtures`
- `01 Public Product Endpoint Auth Boundary`
- `02 Catalog Admin Auth Boundary`
- `03 Cart Customer Auth Boundary`
- `04 Checkout And Order Auth Boundary`
- `05 Inventory Admin Auth Boundary`
- `06 Product Media Admin Auth Boundary`
- `07 Product Relations Admin Auth Boundary`
- `08 Product Reviews Auth Boundary`
- `09 Final Environment Hygiene`

## Proposed Scope For First 09 Version

The first safe version should include only High-confidence boundary requests directly supported by accepted suite evidence.

Recommended first-version coverage:

- public product endpoints
  - `GET /api/products`
  - `GET /api/products/:slug`
  - `GET /api/products/:productId/reviews`
- catalog admin read boundary
  - `GET /api/admin/products`
    - `CUSTOMER -> 403`
    - `CATALOG_MANAGER -> 200`
    - `ORDER_MANAGER -> 403`
    - `SUPPORT_STAFF -> 200`
    - `SUPER_ADMIN -> 200`
- cart boundary
  - `GET /api/cart`
    - `no token -> 401`
    - `CUSTOMER -> 200`
- checkout/reference boundary
  - `GET /api/shipping-carriers -> 200`
  - `GET /api/payment-methods -> 200`
  - `GET /api/admin/shipping-carriers`
    - `CUSTOMER -> 403`
    - `ORDER_MANAGER -> 200`
    - `SUPPORT_STAFF -> 200`
    - `SUPER_ADMIN -> 200`
- inventory admin read boundary
  - `GET /api/admin/products/:productId/inventory`
    - `CUSTOMER -> 403`
    - `CATALOG_MANAGER -> 200`
    - `ORDER_MANAGER -> 200`
    - `SUPPORT_STAFF -> 200`
- product media admin read boundary
  - `GET /api/admin/products/:productId/media`
    - `CUSTOMER -> 403`
    - `CATALOG_MANAGER -> 200`
- product relations admin read boundary
  - `GET /api/admin/products/:productId/relations`
    - `CUSTOMER -> 403`
    - `CATALOG_MANAGER -> 200`
- product reviews boundary
  - `GET /api/products/:productId/reviews`
    - `no token -> 200`
  - `POST /api/products/:productId/reviews`
    - `no token -> 401`
  - `GET /api/admin/products/:productId/reviews`
    - `CUSTOMER -> 403`
    - `CATALOG_MANAGER -> 200`

## First Version Strategy

The first version should start only with High-confidence, low-risk requests that are already evidenced by accepted `01-08` collections. Public read endpoints, protected read/list/detail endpoints, and clearly proven role-denial cases should be preferred over broader exploratory coverage.

Where the accepted suite already proves stable behavior, the initial `09` collection can add a focused auth guardrail layer without expanding into speculative permission assumptions.

The initial release should behave as a minimum safe cross-module guardrail suite, not as a broad permission exploration layer.

## Evidence Policy

Endpoints and role expectations that are not directly supported by accepted `01-08` collection evidence should not be included in the first implementation. This is especially important for avoiding a false "PASS by matching whatever the backend currently does" pattern.

The intended boundary and the accepted/proven boundary must be evaluated separately. If a role or endpoint remains ambiguous, it should stay outside the first version until a clearer behavioral basis exists.

This means the collection should not be designed by probing live endpoints first and then backfilling expected statuses. Where accepted collections do not already prove a boundary clearly, that case belongs in a deferred list rather than in the first implementation set.

## Mutation Policy

The first version should prefer read, list, and detail endpoints wherever possible. If mutation is ever needed for auth boundary coverage, it should be treated as a later-phase candidate with explicit cleanup and absence-verification rules rather than being forced into the first release.

The only narrow exception acceptable in a first version is a mutation-like request that proves an auth boundary without creating state, such as a no-auth denial request that should stop before any persistence path is reached.

## Runtime Variable Policy

Any temporary state used by a future `09` collection should use collection-owned names such as:

- `authBoundaryTestProductId`
- `authBoundaryTestProductSlug`
- `authBoundaryTestMediaId`
- `authBoundaryTestRelationId`
- `authBoundaryTestReviewId`
- `authBoundaryTestCartItemId`
- `authBoundaryTestOrderId`

Shared auth, base URL, and user identity variables must remain preserved and must not be overridden or unset.

## Folder-Level Candidate Matrix

### 00 Prerequisite - Verify Runtime Variables And Capture Stable Fixtures

Purpose:

- confirm stable public fixture availability
- capture a safe product id and slug for downstream boundary requests
- keep runtime preparation minimal

Candidate requests:

| Request | Method | Endpoint | Auth Mode / Role | Expected Status | Evidence Source | Confidence | Notes |
|---|---|---|---|---|---|---|---|
| Capture stable active product | `GET` | `/api/products?limit=1` | no auth | `200` | 03, 06, 08 collections | High | can capture `authBoundaryTestProductId` and `authBoundaryTestProductSlug` |
| Verify runtime role tokens exist | script-only | n/a | n/a | n/a | not directly covered, candidate only | Medium | hygiene-only, not endpoint behavior |

Recommendation:

- include the public product capture request
- keep token existence checks optional and lightweight

### 01 Public Product Endpoint Auth Boundary

Purpose:

- make public product visibility explicit

Candidate requests:

| Request | Method | Endpoint | Auth Mode / Role | Expected Status | Evidence Source | Confidence | Notes |
|---|---|---|---|---|---|---|---|
| Public products list | `GET` | `/api/products` | no auth | `200` | 02 collection | High | minimal shape: `items` array |
| Public product detail | `GET` | `/api/products/:slug` | no auth | `200` | 06, 07 collections | High | minimal shape: `id`, `slug` |
| Public product reviews list | `GET` | `/api/products/:productId/reviews` | no auth | `200` | 08 collection | High | minimal shape: `items` array |

Recommendation:

- all three can be included in the first version

### 02 Catalog Admin Auth Boundary

Purpose:

- prove wrong-role and correct-role boundaries on catalog admin read access

Candidate requests:

| Request | Method | Endpoint | Auth Mode / Role | Expected Status | Evidence Source | Confidence | Notes |
|---|---|---|---|---|---|---|---|
| Customer denied catalog admin list | `GET` | `/api/admin/products` | CUSTOMER | `403` | 02 collection | High | wrong-role guard |
| Catalog manager allowed catalog admin list | `GET` | `/api/admin/products` | CATALOG_MANAGER | `200` | 02 collection | High | correct role |
| Order manager denied catalog admin list | `GET` | `/api/admin/products` | ORDER_MANAGER | `403` | 02 collection | High | wrong-role guard |
| Support staff allowed catalog admin list | `GET` | `/api/admin/products` | SUPPORT_STAFF | `200` | 02 collection | High | accepted current behavior |
| Super admin allowed catalog admin list | `GET` | `/api/admin/products` | SUPER_ADMIN | `200` | 02 collection | High | global admin path |
| No-auth catalog admin list | `GET` | `/api/admin/products` | no auth | `401` | not directly covered, candidate only | Medium | not directly proven by accepted suite |

Recommendation:

- include only the role-based High-confidence matrix
- defer no-auth admin catalog read

### 03 Cart Customer Auth Boundary

Purpose:

- prove protected customer-cart access without assuming broader authenticated-role behavior

Candidate requests:

| Request | Method | Endpoint | Auth Mode / Role | Expected Status | Evidence Source | Confidence | Notes |
|---|---|---|---|---|---|---|---|
| No-auth cart read denied | `GET` | `/api/cart` | no auth | `401` | 03 collection | High | protected area |
| Customer cart read allowed | `GET` | `/api/cart` | CUSTOMER | `200` | 03 collection | High | minimal shape: cart object and `items` array |
| Catalog manager cart read denied | `GET` | `/api/cart` | CATALOG_MANAGER | candidate only | not directly covered, candidate only | Low | no direct evidence |
| Order manager cart read denied | `GET` | `/api/cart` | ORDER_MANAGER | candidate only | not directly covered, candidate only | Low | no direct evidence |
| Support staff cart read denied | `GET` | `/api/cart` | SUPPORT_STAFF | candidate only | not directly covered, candidate only | Low | no direct evidence |

Recommendation:

- first version should include only no-auth `401` and customer `200`

### 04 Checkout And Order Auth Boundary

Purpose:

- separate public checkout/reference access from admin shipping/reference access

Candidate requests:

| Request | Method | Endpoint | Auth Mode / Role | Expected Status | Evidence Source | Confidence | Notes |
|---|---|---|---|---|---|---|---|
| Public shipping carriers | `GET` | `/api/shipping-carriers` | no auth | `200` | 04 collection | High | public reference |
| Public payment methods | `GET` | `/api/payment-methods` | no auth | `200` | 04 collection | High | public reference |
| Customer denied admin shipping list | `GET` | `/api/admin/shipping-carriers` | CUSTOMER | `403` | 04 collection | High | wrong-role guard |
| Order manager allowed admin shipping list | `GET` | `/api/admin/shipping-carriers` | ORDER_MANAGER | `200` | 04 collection | High | correct role |
| Support staff allowed admin shipping list | `GET` | `/api/admin/shipping-carriers` | SUPPORT_STAFF | `200` | 04 collection | High | accepted current behavior |
| Super admin allowed admin shipping list | `GET` | `/api/admin/shipping-carriers` | SUPER_ADMIN | `200` | 04 collection | High | global admin path |
| No-auth admin shipping list | `GET` | `/api/admin/shipping-carriers` | no auth | `401` | not directly covered, candidate only | Medium | not directly proven by accepted suite |
| Catalog manager admin shipping list | `GET` | `/api/admin/shipping-carriers` | CATALOG_MANAGER | candidate only | not directly covered, candidate only | Low | no direct evidence |

Recommendation:

- include public `200` requests and High-confidence admin shipping role cases
- defer no-auth admin shipping and catalog-manager shipping assumptions

### 05 Inventory Admin Auth Boundary

Purpose:

- make inventory admin read boundaries explicit without introducing mutation/restore flows

Candidate requests:

| Request | Method | Endpoint | Auth Mode / Role | Expected Status | Evidence Source | Confidence | Notes |
|---|---|---|---|---|---|---|---|
| Customer denied inventory admin read | `GET` | `/api/admin/products/:productId/inventory` | CUSTOMER | `403` | 05 collection | High | wrong-role guard |
| Catalog manager allowed inventory admin read | `GET` | `/api/admin/products/:productId/inventory` | CATALOG_MANAGER | `200` | 05 collection | High | correct role |
| Order manager allowed inventory admin read | `GET` | `/api/admin/products/:productId/inventory` | ORDER_MANAGER | `200` | 05 collection | High | accepted current behavior |
| Support staff allowed inventory admin read | `GET` | `/api/admin/products/:productId/inventory` | SUPPORT_STAFF | `200` | 05 collection | High | accepted current behavior |
| No-auth inventory admin read | `GET` | `/api/admin/products/:productId/inventory` | no auth | `401` | not directly covered, candidate only | Medium | not directly proven by accepted suite |

Recommendation:

- include only the High-confidence role matrix
- defer no-auth inventory read

### 06 Product Media Admin Auth Boundary

Purpose:

- prove that media admin read access is blocked from customer and open to catalog-authorized access already evidenced by accepted coverage

Candidate requests:

| Request | Method | Endpoint | Auth Mode / Role | Expected Status | Evidence Source | Confidence | Notes |
|---|---|---|---|---|---|---|---|
| Customer denied media admin list | `GET` | `/api/admin/products/:productId/media` | CUSTOMER | `403` | 06 collection | High | wrong-role guard |
| Catalog manager allowed media admin list | `GET` | `/api/admin/products/:productId/media` | CATALOG_MANAGER | `200` | 06 collection | High | correct role |
| No-auth media admin list | `GET` | `/api/admin/products/:productId/media` | no auth | `401` | not directly covered, candidate only | Medium | not directly proven by accepted suite |
| Order manager media admin list | `GET` | `/api/admin/products/:productId/media` | ORDER_MANAGER | candidate only | not directly covered, candidate only | Low | no direct evidence |
| Support staff media admin list | `GET` | `/api/admin/products/:productId/media` | SUPPORT_STAFF | candidate only | not directly covered, candidate only | Low | no direct evidence |

Recommendation:

- first version should include only customer `403` and catalog manager `200`

### 07 Product Relations Admin Auth Boundary

Purpose:

- prove that relations admin read access is blocked from customer and open to catalog-authorized access already evidenced by accepted coverage

Candidate requests:

| Request | Method | Endpoint | Auth Mode / Role | Expected Status | Evidence Source | Confidence | Notes |
|---|---|---|---|---|---|---|---|
| Customer denied relations admin list | `GET` | `/api/admin/products/:productId/relations` | CUSTOMER | `403` | 07 collection | High | wrong-role guard |
| Catalog manager allowed relations admin list | `GET` | `/api/admin/products/:productId/relations` | CATALOG_MANAGER | `200` | 07 collection | High | correct role |
| No-auth relations admin list | `GET` | `/api/admin/products/:productId/relations` | no auth | `401` | not directly covered, candidate only | Medium | not directly proven by accepted suite |
| Order manager relations admin list | `GET` | `/api/admin/products/:productId/relations` | ORDER_MANAGER | candidate only | not directly covered, candidate only | Low | no direct evidence |
| Support staff relations admin list | `GET` | `/api/admin/products/:productId/relations` | SUPPORT_STAFF | candidate only | not directly covered, candidate only | Low | no direct evidence |

Recommendation:

- first version should include only customer `403` and catalog manager `200`

### 08 Product Reviews Auth Boundary

Purpose:

- cover public reviews read, no-auth review create denial, and admin reviews list boundary

Candidate requests:

| Request | Method | Endpoint | Auth Mode / Role | Expected Status | Evidence Source | Confidence | Notes |
|---|---|---|---|---|---|---|---|
| Public reviews list | `GET` | `/api/products/:productId/reviews` | no auth | `200` | 08 collection | High | minimal shape: `items` array |
| No-auth review create denied | `POST` | `/api/products/:productId/reviews` | no auth | `401` | 08 collection | High | no side effect expected |
| Customer denied admin reviews list | `GET` | `/api/admin/products/:productId/reviews` | CUSTOMER | `403` | 08 collection | High | wrong-role guard |
| Catalog manager allowed admin reviews list | `GET` | `/api/admin/products/:productId/reviews` | CATALOG_MANAGER | `200` | 08 collection | High | correct role |
| Customer denied admin review detail | `GET` | `/api/admin/products/reviews/:reviewId` | CUSTOMER | `403` | 08 collection | Medium | requires stable review id |
| Catalog manager allowed admin review detail | `GET` | `/api/admin/products/reviews/:reviewId` | CATALOG_MANAGER | `200` | 08 collection | Medium | requires stable review id |
| Customer create/update/delete own review allowed | mixed | review mutation endpoints | CUSTOMER | allowed | 08 collection | Medium | mutation-heavy for first version |
| Order manager admin reviews list denied | `GET` | `/api/admin/products/:productId/reviews` | ORDER_MANAGER | candidate only | not directly covered, candidate only | Low | no direct evidence |
| Support staff admin reviews list allowed | `GET` | `/api/admin/products/:productId/reviews` | SUPPORT_STAFF | candidate only | not directly covered, candidate only | Low | no direct evidence |

Recommendation:

- include only public reviews `200`, no-auth create `401`, customer admin list `403`, and catalog manager admin list `200`
- defer detail and own-review mutation flows to a later phase

### 09 Final Environment Hygiene

Purpose:

- clean only `09`-owned temporary variables

Candidate requests:

| Request | Method | Endpoint | Auth Mode / Role | Expected Status | Evidence Source | Confidence | Notes |
|---|---|---|---|---|---|---|---|
| Final cleanup request with unset script | `GET` | `/api/products/:slug` or `/api/products` | no auth | `200` | 02, 06, 07 collections | High | primary purpose is test-script cleanup |

Recommendation:

- final folder should remain
- only actually used `authBoundaryTest*` variables should be unset

## Deferred / Needs Confirmation

The following areas should stay outside the first implementation set unless separate confirmation or new accepted evidence is added:

- `GET /api/admin/products` with no auth expecting `401`
- cart read behavior for authenticated non-customer roles
- `GET /api/admin/shipping-carriers` with no auth expecting `401`
- `CATALOG_MANAGER` behavior on checkout/order admin read paths
- inventory admin read with no auth
- product media admin read for `ORDER_MANAGER`, `SUPPORT_STAFF`, and no-auth
- product relations admin read for `ORDER_MANAGER`, `SUPPORT_STAFF`, and no-auth
- product reviews admin read for `ORDER_MANAGER` and `SUPPORT_STAFF`
- admin review detail without a clearly justified stable review-id strategy
- customer own review create/update/delete auth boundary as a first-version concern

## Expected Behavior Risks

The main risk areas are not implementation risks but evidence risks:

- a generic rule like "protected admin endpoint without token returns `401`" may be broadly true, but the accepted suite does not prove it for every planned module
- cart wrong-role behavior cannot safely be generalized from the accepted suite
- media, relations, and reviews admin read behavior for `ORDER_MANAGER` and `SUPPORT_STAFF` is not consistently proven across accepted collections
- checkout/order admin behavior for `CATALOG_MANAGER` is not directly established
- review-detail boundary coverage requires a stable review-id strategy that the minimum first version does not need

## Recommended First Implementation Strategy

The future first implementation should follow this sequence:

1. include only High-confidence requests
2. prefer `GET` list/detail/read endpoints
3. avoid mutation-heavy allowed-path flows
4. allow only narrow no-side-effect denial requests such as no-auth review create `401`
5. capture only one stable product id and slug
6. use only `09`-owned temp variable names
7. keep final cleanup limited to variables actually used by the collection
8. treat the suite as a minimum safe cross-module auth guardrail, not as a permission exploration project

## Deferred / Future Coverage

Possible later follow-up suites can cover:

- `10` negative validation cross-module tests
- `11` ownership isolation cross-module tests
- `12` state consistency cross-module tests

## Acceptance Criteria

This feature request can be considered complete later when:

- the `09` collection is implemented separately from this document
- the first version uses only evidence-backed, low-risk auth boundary requests
- shared runtime/auth variables remain protected
- collection-owned temporary variables are cleaned correctly
- the resulting suite provides a reliable behavioral guardrail layer without pretending to be a full security or protocol audit

## Not Implementation Yet

This feature request explicitly does not mean:

- the `09` collection already exists
- the endpoint matrix is automatically approved for live execution
- expected statuses should be inferred from ad-hoc probing
- ambiguous auth behavior should be forced into a PASS-oriented suite

The actual collection, when created later, should be implemented only after this design capture is intentionally used as the backlog source.
