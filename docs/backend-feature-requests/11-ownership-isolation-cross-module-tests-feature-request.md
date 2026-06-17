# Ownership Isolation Cross Module Tests Feature Request

## Status

Future Feature Request / Design Captured

## Related Feature Area

- Ownership and Data Isolation Guardrail Coverage
- RBAC Permission Granularity Review
- API Contract and Protocol Compliance Audit

## Purpose

This document captures the planned design basis for a future Postman/Newman guardrail collection focused on cross-user ownership and data-isolation behavior across the accepted `01-08` regression suite.

This is not implementation yet. The `11` collection has not been created. This request exists to preserve the intended scope, fixture requirements, evidence rules, mutation boundaries, and low-risk rollout strategy before any collection work begins.

## Planned Collection

- File: `postman/11-ownership-isolation-cross-module-tests.postman_collection.json`
- Display Name: `Simsir - 11 Ownership Isolation Cross Module Tests`
- Scope: cross-module baseline ownership-isolation coverage built on top of accepted `01-08` collections

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

- Customer A create/read/update/delete baseline
- Customer B same-resource read denial
- Customer B same-resource update denial
- Customer B same-resource delete denial
- admin read visibility vs customer ownership boundary
- cross-user error behavior
- cleanup and temporary-state hygiene

## Out of Scope

- auth boundary
- negative validation
- invalid UUID / invalid payload
- happy path regression
- full API contract audit
- CORS / security headers
- pagination standardization
- backend permission refactor

## Proposed Folder Structure

- `00 Prerequisite - Verify Users And Capture Stable Fixtures`
- `01 Cart Ownership Isolation`
- `02 Checkout And Order Ownership Isolation`
- `03 Product Reviews Ownership Isolation`
- `04 Customer Profile Or User-Owned Resource Isolation`
- `05 Admin Read Boundary vs Customer Ownership`
- `06 Cross-User Mutation Denial`
- `07 Cross-User Delete Denial`
- `08 Common Ownership Error Behavior`
- `09 Final Environment Hygiene`

## Required Test Fixtures

The most important current design finding is that accepted setup coverage does not yet prove a second customer fixture.

Current accepted evidence shows:

- `01` sets `customer_access_token` and `customer_user_id`
- accepted collections use only that single customer fixture
- cross-user ownership behavior is not directly proven by current accepted coverage

This means a future `11` implementation requires a second customer test user and token. That should be treated as a separate fixture task, likely connected to future setup work, and should not be solved implicitly during the design-capture stage.

Potential future fixture names:

- `customer_a_access_token`
- `customer_b_access_token`
- `customer_a_user_id`
- `customer_b_user_id`

Collection-owned working names for `11`:

- `ownershipIsolationCustomerAUserId`
- `ownershipIsolationCustomerBUserId`
- `ownershipIsolationCustomerAToken`
- `ownershipIsolationCustomerBToken`

## Proposed Scope For First 11 Version

The strongest early ownership-isolation candidates are:

- product review ownership isolation
- cart item ownership isolation
- admin read visibility contrasted against customer-to-customer denial

The weakest or highest-risk early candidates are:

- checkout/order ownership isolation
- profile or user-detail cross-user visibility
- generalized ownership error-body standardization

A minimum practical first version should likely start with review ownership isolation. Cart can follow as the second expansion area once the second customer fixture is available and the denial semantics are confirmed.

## First Version Strategy

The first version should include only resource models that are already clearly visible in accepted collections and can be cleaned safely after cross-user denial checks.

That strongly favors:

- Customer A creates review
- Customer B attempts update/delete on that review
- authorized admin can still read that review
- Customer A performs cleanup
- final collection hygiene clears only `11`-owned temporary variables

Cart isolation is a strong second candidate, but review isolation is the clearest first starting point because the accepted suite already proves create, update, delete, and admin detail visibility on the same owned resource family.

## Evidence Policy

Ownership-isolation expectations that are not directly supported by accepted `01-08` collection evidence should not be silently promoted into the first implementation set.

The collection must not be designed by probing live endpoints first and then backfilling expected ownership statuses. If the accepted suite proves only the endpoint model but not the cross-user outcome, the future collection should explicitly mark that behavior as a design-confirmation point rather than pretending the result is already known.

## 403 vs 404 Policy

Cross-user denial can legitimately be designed in more than one way:

- `403` means the resource exists but the actor is not allowed
- `404` means the resource existence is hidden from peer users

Accepted coverage does not yet prove which strategy is used for customer-to-customer ownership isolation. A future implementation should not assume one status blindly. The ownership policy for reviews and carts should be confirmed before a strict PASS-oriented suite is finalized.

## Mutation Policy

Ownership isolation usually requires state creation. The safest general strategy is:

- Customer A creates the resource
- Customer B attempts read/update/delete denial checks
- Customer A confirms the resource still exists if needed
- Customer A performs cleanup
- optional safe absence check runs after owner cleanup

High-risk areas should remain deferred at first, especially:

- checkout/order ownership flows
- any user-detail or profile isolation path without a proven endpoint model
- cross-user scenarios that require complex nested setup or business-state transitions

## Runtime Variable Policy

Any temporary state used by a future `11` collection should use collection-owned names such as:

- `ownershipIsolationTestProductId`
- `ownershipIsolationTestProductSlug`
- `ownershipIsolationCustomerAUserId`
- `ownershipIsolationCustomerBUserId`
- `ownershipIsolationCustomerAToken`
- `ownershipIsolationCustomerBToken`
- `ownershipIsolationCustomerAReviewId`
- `ownershipIsolationCustomerACartItemId`
- `ownershipIsolationCustomerAOrderId`

Shared auth, base URL, and existing user identity variables must remain preserved and must not be overridden or unset.

## Folder-Level Candidate Matrix

### 00 Prerequisite - Verify Users And Capture Stable Fixtures

Purpose:

- verify whether current runtime state is sufficient for real ownership isolation
- confirm second customer fixture requirements
- capture stable public product fixtures when needed

Candidate requests:

| Request | Method | Endpoint | Actor | Target Resource Owner | Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Required Fixture | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Verify Customer A runtime fixture | script-only | n/a | collection | Customer A | existing primary customer fixture | n/a | n/a | 01 collection’dan yalnızca tek customer fixture kanıtlandı | High | Low | No | current runtime | baseline only |
| Verify Customer B runtime fixture | script-only | n/a | collection | Customer B | second customer requirement | n/a | n/a | not directly covered, candidate only | Medium | Low | No | future second customer fixture | currently missing |
| Capture stable active product | `GET` | `/api/products?limit=1` | no auth | n/a | shared fixture for cart/review tests | `200` | n/a | 03 collection’dan cart ownership endpoint modeli kanıtlandı; 08 collection’dan review ownership endpoint modeli kanıtlandı | High | Low | No | public product fixture | can set `ownershipIsolationTestProductId` and `ownershipIsolationTestProductSlug` |

Recommendation:

- this folder is mandatory
- the most important output is explicit confirmation that a second customer fixture is required

### 01 Cart Ownership Isolation

Purpose:

- test whether one customer can read, update, or delete another customer’s cart item

Candidate requests:

| Request | Method | Endpoint | Actor | Target Resource Owner | Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Required Fixture | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Customer A creates cart item | `POST` | `/api/cart/items` | Customer A | Customer A | owner baseline create | `200/201` | n/a | 03 collection’dan cart ownership endpoint modeli kanıtlandı | High | Medium | Yes | Customer A + product id | create shape already proven |
| Customer B reads own cart after A create | `GET` | `/api/cart` | Customer B | Customer A | cross-user visibility candidate | needs confirmation | status-only first version | 03 collection’dan cart ownership endpoint modeli kanıtlandı | Medium | Low | No | Customer B token | likely indirect ownership proof |
| Customer B updates Customer A cart item | `PATCH` | `/api/cart/items/:itemId` | Customer B | Customer A | cross-user update denial | needs confirmation | status-only first version | 03 collection’dan cart ownership endpoint modeli kanıtlandı | Medium | Medium | No | Customer B + A item id | strongest cart mutation candidate |
| Customer B deletes Customer A cart item | `DELETE` | `/api/cart/items/:itemId` | Customer B | Customer A | cross-user delete denial | needs confirmation | status-only first version | 03 collection’dan cart ownership endpoint modeli kanıtlandı | Medium | Medium | No | Customer B + A item id | should not remove resource |
| Customer A verifies item still exists | `GET` | `/api/cart` | Customer A | Customer A | verify denial did not mutate state | `200` | n/a | 03 collection’dan cart ownership endpoint modeli kanıtlandı | High | Low | No | Customer A token + item id | useful post-denial check |
| Customer A cleanup deletes item | `DELETE` | `/api/cart/items/:itemId` | Customer A | Customer A | owner cleanup | `200` | n/a | 03 collection’dan cart ownership endpoint modeli kanıtlandı | High | Medium | Yes | Customer A item id | cleanup path already proven |

Recommendation:

- include only after second customer fixture is available
- exact denial status remains a design-confirmation point

### 02 Checkout And Order Ownership Isolation

Purpose:

- evaluate whether user-owned order or checkout resources should be part of the first ownership-isolation suite

Candidate requests:

| Request | Method | Endpoint | Actor | Target Resource Owner | Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Required Fixture | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Customer A creates order/checkout resource | mixed | customer order/checkout endpoints | Customer A | Customer A | owner baseline setup | candidate only | future scope | 04 collection’dan checkout/order endpoint modeli kanıtlanmadı; mostly reference/admin coverage exists | Low | High | Yes | second customer + order flow | endpoint model itself is weak here |
| Customer B reads Customer A order | mixed | customer order detail | Customer B | Customer A | cross-user read candidate | needs confirmation | future scope | not directly covered, candidate only | Low | High | Yes | second customer + order id | too weak for first version |

Recommendation:

- defer
- phase 2 candidate only

### 03 Product Reviews Ownership Isolation

Purpose:

- test whether one customer can update or delete another customer’s review

Candidate requests:

| Request | Method | Endpoint | Actor | Target Resource Owner | Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Required Fixture | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Customer A creates review | `POST` | `/api/products/:productId/reviews` | Customer A | Customer A | owner baseline create | `200/201` | n/a | 08 collection’dan review ownership endpoint modeli kanıtlandı | High | Medium | Yes | Customer A + product id | strongest first-version candidate |
| Customer B updates Customer A review | `PATCH` | `/api/products/:productId/reviews/:reviewId` | Customer B | Customer A | cross-user update denial | needs confirmation | status-only first version | 08 collection’dan review ownership endpoint modeli kanıtlandı | Medium | Medium | No | Customer B + A review id | strongest mutation-denial candidate |
| Customer B deletes Customer A review | `DELETE` | `/api/products/:productId/reviews/:reviewId` | Customer B | Customer A | cross-user delete denial | needs confirmation | status-only first version | 08 collection’dan review ownership endpoint modeli kanıtlandı | Medium | Medium | No | Customer B + A review id | should not remove review |
| Admin reads created review | `GET` | `/api/admin/products/reviews/:reviewId` | CATALOG_MANAGER | Customer A | admin visibility contrast | `200` | n/a | 08 collection’dan review ownership endpoint modeli kanıtlandı | High | Low | No | created review id | helps separate ownership from admin access |
| Customer A cleanup deletes review | `DELETE` | `/api/products/:productId/reviews/:reviewId` | Customer A | Customer A | owner cleanup | `200` | n/a | 08 collection’dan review ownership endpoint modeli kanıtlandı | High | Medium | Yes | Customer A review id | proven cleanup path |

Recommendation:

- best first-version ownership folder
- exact denial status still needs confirmation

### 04 Customer Profile Or User-Owned Resource Isolation

Purpose:

- determine whether there is a proven self-only or cross-user customer profile surface suitable for ownership testing

Candidate requests:

| Request | Method | Endpoint | Actor | Target Resource Owner | Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Required Fixture | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Customer A gets own access summary | `GET` | `/api/auth/me/access` | Customer A | Customer A | self-only baseline | `200` | n/a | 01 collection’dan yalnızca tek customer fixture kanıtlandı | High | Low | No | Customer A token | self endpoint only |
| Customer B reads Customer A user-owned profile | unknown | unknown | Customer B | Customer A | cross-user profile candidate | not directly covered | future scope | not directly covered, candidate only | Low | Low | No | second customer + target endpoint | no proven endpoint model today |

Recommendation:

- defer / not applicable for first version unless a separate proven user-owned endpoint is identified

### 05 Admin Read Boundary vs Customer Ownership

Purpose:

- separate peer-customer denial from authorized admin visibility on the same owned resource

Candidate requests:

| Request | Method | Endpoint | Actor | Target Resource Owner | Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Required Fixture | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Customer B cannot mutate Customer A review | `PATCH/DELETE` | public review endpoints | Customer B | Customer A | ownership denial candidate | needs confirmation | status-only first version | 08 collection’dan review ownership endpoint modeli kanıtlandı | Medium | Medium | No | second customer + review id | ownership side |
| Admin reads Customer A review detail | `GET` | `/api/admin/products/reviews/:reviewId` | CATALOG_MANAGER | Customer A | admin visibility allowed | `200` | n/a | 08 collection’dan review ownership endpoint modeli kanıtlandı | High | Low | No | created review id | best ownership-vs-admin contrast |
| Customer cannot use admin review detail | `GET` | `/api/admin/products/reviews/:reviewId` | CUSTOMER | Customer A | non-admin boundary contrast | `403` | status-only first version | 08 collection’dan review ownership endpoint modeli kanıtlandı | High | Low | No | any customer token | useful contrast, but not cross-user alone |

Recommendation:

- include only as a supporting folder for review isolation
- avoid expanding this into a general RBAC suite

### 06 Cross-User Mutation Denial

Purpose:

- isolate cross-user update denial as a dedicated security behavior

Candidate requests:

| Request | Method | Endpoint | Actor | Target Resource Owner | Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Required Fixture | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Customer B updates Customer A cart item | `PATCH` | `/api/cart/items/:itemId` | Customer B | Customer A | cross-user update denial | needs confirmation | status-only first version | 03 collection’dan cart ownership endpoint modeli kanıtlandı | Medium | Medium | No | second customer + cart item id | valuable but less direct than review |
| Customer B updates Customer A review | `PATCH` | `/api/products/:productId/reviews/:reviewId` | Customer B | Customer A | cross-user update denial | needs confirmation | status-only first version | 08 collection’dan review ownership endpoint modeli kanıtlandı | Medium | Medium | No | second customer + review id | strongest first update-denial case |

Recommendation:

- first version can include review update denial
- cart update denial can be the next expansion

### 07 Cross-User Delete Denial

Purpose:

- isolate cross-user delete denial as a separate critical security behavior

Candidate requests:

| Request | Method | Endpoint | Actor | Target Resource Owner | Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Required Fixture | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Customer B deletes Customer A cart item | `DELETE` | `/api/cart/items/:itemId` | Customer B | Customer A | cross-user delete denial | needs confirmation | status-only first version | 03 collection’dan cart ownership endpoint modeli kanıtlandı | Medium | Medium | No | second customer + cart item id | denial must leave item intact |
| Customer B deletes Customer A review | `DELETE` | `/api/products/:productId/reviews/:reviewId` | Customer B | Customer A | cross-user delete denial | needs confirmation | status-only first version | 08 collection’dan review ownership endpoint modeli kanıtlandı | Medium | Medium | No | second customer + review id | strongest first delete-denial case |
| Customer A owner cleanup succeeds after denial | owner delete | original owner endpoint | Customer A | Customer A | confirm resource remains owner-deletable | `200` | n/a | 03 and 08 collection endpoint models proven | High | Medium | Yes | owner token + resource id | practical proof that denial did not mutate state |

Recommendation:

- include review delete denial before cart if first scope must stay small

### 08 Common Ownership Error Behavior

Purpose:

- make cross-user denial status and error-body behavior visible without pretending it is already standardized

Candidate requests:

| Request | Method | Endpoint | Actor | Target Resource Owner | Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Required Fixture | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Cross-user review update denial | `PATCH` | review endpoint | Customer B | Customer A | ownership denial error behavior | needs confirmation | minimal error-shape candidate | 08 collection’dan review ownership endpoint modeli kanıtlandı | Medium | Medium | No | second customer + review id | key `403 vs 404` discussion point |
| Cross-user review delete denial | `DELETE` | review endpoint | Customer B | Customer A | ownership denial error behavior | needs confirmation | minimal error-shape candidate | 08 collection’dan review ownership endpoint modeli kanıtlandı | Medium | Medium | No | second customer + review id | strong candidate |
| Cross-user cart mutation denial | `PATCH/DELETE` | cart item endpoint | Customer B | Customer A | ownership denial error behavior | needs confirmation | status-only first version | 03 collection’dan cart ownership endpoint modeli kanıtlandı | Medium | Medium | No | second customer + cart item id | weaker error-shape evidence |
| Admin still reads same review | `GET` | admin review detail | CATALOG_MANAGER | Customer A | visibility leak contrast | `200` | n/a | 08 collection’dan review ownership endpoint modeli kanıtlandı | High | Low | No | created review id | useful comparison point |

Recommendation:

- use a status-first approach in the first implementation
- treat shared ownership error-shape rules as future scope

### 09 Final Environment Hygiene

Purpose:

- clean only `11`-owned temporary variables
- ensure owner-created resources are cleaned safely after denial assertions

Candidate requests:

| Request | Method | Endpoint | Actor | Target Resource Owner | Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Required Fixture | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Final cleanup request with unset script | `GET` | public fixture endpoint | no auth | n/a | final hygiene | `200` | n/a | 03 collection’dan cart ownership endpoint modeli kanıtlandı; 08 collection’dan review ownership endpoint modeli kanıtlandı | High | Low | No | any public fixture endpoint | final test-script cleanup only |
| Owner cleanup delete | owner-owned delete endpoint | cart/review delete | Customer A | Customer A | remove created resource | `200` | n/a | 03 and 08 collection endpoint models proven | High | Medium | Yes | owner token + resource id | must run after all denial assertions |

Recommendation:

- final folder is mandatory
- unset only actually used `11`-owned temporary variables

## Deferred / Needs Confirmation

The following areas should stay outside the first implementation set unless separate confirmation or new accepted evidence is added:

- second customer fixture sourcing strategy
- cart cross-user read semantics
- cart cross-user update/delete exact status
- review cross-user update/delete exact status
- any order/customer-owned checkout isolation flow
- any profile or user-detail cross-user endpoint
- ownership-denial error-body standardization
- wrong admin role visibility on customer-owned review resources

## Expected Behavior Risks

The main risk areas are ownership-policy risks rather than endpoint-shape risks:

- accepted coverage proves endpoint models, not peer-customer denial outcomes
- `403` vs `404` for cross-user denial is unresolved
- ownership-denial error-body shape is unresolved
- customer-owned order/profile endpoint models are not clearly proven today
- admin visibility vs owner-only visibility may differ by resource family

## Mutation And Cleanup Risks

Ownership isolation is inherently stateful in most useful cases. Strong tests usually require:

- Customer A resource creation
- Customer B denial attempts that must not mutate resource state
- Customer A cleanup
- optional safe absence or owner-verification checks after cleanup

Risk level by likely first-scope areas:

- reviews: medium
- cart: medium
- checkout/order: high
- profile or unknown user-owned resources: low evidence, undefined design risk

## Recommended First Implementation Strategy

The future first implementation should follow this sequence:

1. solve second customer fixture setup as a separate prerequisite task
2. start only with product reviews ownership isolation
3. use the flow:
   - Customer A create review
   - Customer B update denial
   - Customer B delete denial
   - admin detail still reads review
   - Customer A cleanup delete
   - final cleanup unsets only `11`-owned variables
4. expand next into cart ownership isolation
5. defer checkout/order ownership flows to phase 2

## Future Feature Request Notes

This design capture is well aligned with:

- Ownership and Data Isolation Guardrail Coverage
- RBAC Permission Granularity Review
- API Contract and Protocol Compliance Audit

But it does not close those areas. In particular, it does not settle:

- peer-user data visibility policy
- `403 vs 404` ownership strategy
- admin-read vs owner-only separation consistency
- user-owned resource modeling across modules

## Coverage Verification Notes

Outcome: `B` - the document is mostly sufficient, but future implementation quality benefits from clearer separation between accepted-suite baseline coverage and repo-backed candidate coverage.

### Module Coverage Status

| Module | Status | Verification Note |
|---|---|---|
| product-reviews | Covered | Strongest first-version candidate. Accepted `08` proves owner create/update/delete path, admin visibility, customer-to-admin denial, and post-delete absence. Cross-user denial is still a future candidate, not an accepted baseline fact. |
| cart | Covered | Accepted `03` proves customer-scoped item lifecycle and shows owner-scoped repository/service patterns. Cross-user customer behavior still depends on a second customer fixture and confirmation of exact denial status. |
| checkout/orders | Deferred | Accepted `04` is primarily reference/admin coverage, not customer-owned order isolation. Repo has orders, but the endpoint model for cross-user ownership testing is not strong enough for first-version inclusion. |
| addresses | Gap | Repo clearly contains a user-owned resource model under `/api/users/me/addresses`, but accepted `01-08` collections do not currently exercise it. Keep it as a repo-backed candidate, not as a baseline-backed first-scope guarantee. |
| products/categories | Not Applicable | These are useful contrast surfaces for public-read vs protected-mutation boundaries, but they are not the core owned-resource target of `11`. |
| product-media | Not Applicable | Media is protected admin submodule coverage, not peer-customer ownership coverage. Better handled by `09` and `12` unless a future user-owned media model appears. |
| product-relations | Not Applicable | Relations are admin/catalog surfaces, not peer-customer owned resources. |
| inventory | Not Applicable | Inventory is an admin mutation boundary, not a customer ownership boundary. |
| payment-methods | Not Applicable | Reference/config resource; relevant to auth and protocol guardrails, not core peer-customer ownership isolation. |
| shipping-carriers | Not Applicable | Reference/config resource; relevant to auth and protocol guardrails, not core peer-customer ownership isolation. |

### Actor And Boundary Coverage Status

| Actor / Boundary | Status | Verification Note |
|---|---|---|
| owner customer | Covered | Reviews and cart both have accepted owner-baseline CRUD-style behavior. |
| other customer / wrong owner | Covered with gap note | Core purpose of `11`, but still candidate coverage because accepted collections use only one customer fixture today. |
| unauthenticated user | Gap | The document focuses on peer ownership and admin contrast; it should still treat no-token access to owner-protected endpoints as a supporting guardrail, especially for reviews, cart, and addresses. |
| wrong role | Covered | Admin contrast is represented through review admin detail and accepted `03/04/08` wrong-role patterns. |
| admin/catalog role | Covered | Review admin detail is the best representative contrast between peer denial and authorized staff visibility. |

### Accepted Baseline vs Repo-Backed Candidate

- Accepted baseline:
  - `03` proves cart owner lifecycle, no-auth `401`, support-staff denial against customer cart item mutation, and cleanup hygiene.
  - `08` proves review owner lifecycle, no-auth review-create `401`, customer denial on admin review surfaces, admin review visibility, and post-delete absence.
- Repo-backed candidate:
  - `cart` service and repository use owner-scoped lookup patterns such as `findByIdAndUserId`, which supports ownership-isolation planning but does not itself prove cross-customer runtime behavior.
  - `product-reviews` service uses owner-scoped lookup for update/delete and returns `NotFoundException('Review not found')` when the scoped record is absent.
  - `addresses` service uses `/api/users/me/addresses` with owner-scoped lookup and delete/update behavior, making it a strong future ownership candidate once explicit collection coverage is desired.
- Open question:
  - whether peer-customer denial should surface as `403` or `404` remains unresolved and should stay status-first until confirmed.

### Observed Repo Signals

- cart: owner-scoped item mutation uses `findByIdAndUserId`, which suggests customer-isolated mutation behavior and supports `11` as a meaningful guardrail candidate.
- product-reviews: owner update/delete paths rely on owner-and-product scoped lookup and return `Review not found` when that scope fails, making hidden-by-ownership `404` a plausible design.
- addresses: owner list/create/update/delete are implemented under `/api/users/me/addresses`, and delete may also reassign the next default address within the same owner scope.
- orders: order entities and seeded demo orders exist, but accepted collections do not yet establish a strong customer-owned order endpoint model for safe first-version ownership testing.

### Main Gaps

- second customer fixture is still the primary implementation blocker
- unauthenticated access to owner-protected resources is not yet called out strongly enough as a supporting ownership guardrail
- addresses are repo-backed but not accepted-suite backed
- orders remain too weakly evidenced for first-version ownership implementation

### Cleanup And Repeatability Notes

- Cleanup strategy is sound for reviews and cart because owner-side delete paths are already baseline-backed.
- A future `11` implementation should never rely on Customer B for cleanup; Customer A must remain the cleanup actor for created owner resources.
- Only collection-owned `ownershipIsolation...` variables should be removed during final hygiene.
- Shared auth/base variables from `01` must remain untouched.

## Not Implementation Yet

This feature request explicitly does not mean:

- the `11` collection already exists
- second customer fixtures are already available
- cross-user expected statuses are already confirmed
- ownership denial semantics should be inferred from ad-hoc probing

The actual collection, when created later, should be implemented only after this design capture is intentionally used as the backlog source.
