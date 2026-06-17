# Negative Validation Cross Module Tests Feature Request

## Status

Future Feature Request / Design Captured

## Related Feature Area

- Admin Validation and Error Behavior Standardization
- API Contract and Protocol Compliance Audit
- Cross-module negative-validation guardrail coverage

## Purpose

This document captures the planned design basis for a future Postman/Newman guardrail collection focused on cross-module negative validation behavior across the accepted `01-08` regression suite.

This is not implementation yet. The `10` collection has not been created. This request exists to preserve the intended scope, evidence rules, mutation boundaries, and low-risk rollout strategy before any collection work begins.

## Planned Collection

- File: `postman/10-negative-validation-cross-module-tests.postman_collection.json`
- Display Name: `Simsir - 10 Negative Validation Cross Module Tests`
- Scope: cross-module baseline negative-validation coverage built on top of accepted `01-08` collections

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

- missing required field
- invalid UUID / malformed id
- valid UUID but non-existing resource
- invalid enum
- invalid numeric range
- invalid relation / reference
- invalid payload shape
- deleted/non-existing entity behavior

## Out of Scope

- auth boundary
- ownership isolation
- happy path regression
- full API contract audit
- CORS / security headers
- pagination standardization
- backend validation refactor
- permission model refactor

## Proposed Folder Structure

- `00 Prerequisite - Verify Runtime Variables And Capture Stable Fixtures`
- `01 Category And Product Negative Validation`
- `02 Cart Negative Validation`
- `03 Checkout And Order Negative Validation`
- `04 Inventory Negative Validation`
- `05 Product Media Negative Validation`
- `06 Product Relations Negative Validation`
- `07 Product Reviews Negative Validation`
- `08 Common Identifier And Not Found Behavior`
- `09 Final Environment Hygiene`

## Proposed Scope For First 10 Version

The first safe version should remain narrow. Accepted `01-08` collections do not yet provide broad High-confidence evidence for invalid-payload semantics across modules.

The strongest early candidates are:

- state-free prerequisite fixture capture
- already-proven delete-after-cleanup detail `404` behaviors
- already-proven dependency/conflict negative cases such as category deletion while a related product still exists

This means a strict first version may be intentionally small. If a broader first version is desired, it should still be limited to already-proven not-found or conflict behaviors rather than speculative `400` validation assumptions.

## First Version Strategy

The first version should include only High-confidence negative behaviors with the lowest practical state risk. That strongly favors:

- deleted resource detail `404` checks that are already proven in accepted collections
- conflict/dependency cases already proven by accepted collections
- rejected-request candidates only when the payload model is known and the failure semantics are already evidenced

If strict low-mutation policy is required, the first version should stay very small. If medium setup burden is acceptable, the first practical pilot can center on the common deleted-resource `404` patterns.

## Evidence Policy

Endpoints and error expectations that are not directly supported by accepted `01-08` collection evidence should not be included in the first implementation. This is especially important for avoiding a false "PASS by matching whatever the backend currently does" pattern.

The collection must not be designed by probing live endpoints first and then backfilling expected validation statuses. If accepted evidence does not directly prove a negative behavior, that case belongs in a deferred list rather than the first implementation set.

## Error Shape Policy

The future collection should distinguish clearly between:

- status-only first version assertions
- minimal error-shape candidates such as `message`, `error`, `statusCode`
- full error-shape standardization as future architecture scope

Where accepted collections already prove only a status code, the first version should not over-assert a richer error shape. Where a collection already proves JSON with non-empty `message`, that stronger signal may be reused carefully.

## Mutation Policy

The first version should prefer negative cases that are rejected before state is mutated. Good early candidates include:

- invalid payloads expected to reject without persistence
- invalid id detail/read requests
- valid id but deleted-resource detail requests already proven by accepted flows

High-risk areas should remain deferred at first, especially:

- inventory mutation validation
- checkout/order state-transition validation
- cart item mutation validation
- review create/update/delete negative paths
- media create/update/delete negative paths
- relation create/delete duplicate or self-reference paths

## Runtime Variable Policy

Any temporary state used by a future `10` collection should use collection-owned names such as:

- `negativeValidationTestProductId`
- `negativeValidationTestProductSlug`
- `negativeValidationTestCategoryId`
- `negativeValidationTestMediaId`
- `negativeValidationTestRelationId`
- `negativeValidationTestReviewId`
- `negativeValidationTestCartItemId`
- `negativeValidationTestOrderId`

Shared auth, base URL, and user identity variables must remain preserved and must not be overridden or unset.

## Folder-Level Candidate Matrix

### 00 Prerequisite - Verify Runtime Variables And Capture Stable Fixtures

Purpose:

- capture stable product fixture state without creating data
- keep later negative-validation requests anchored to collection-owned variables

Candidate requests:

| Request | Method | Endpoint | Auth Role | Invalid Input / Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Capture stable active product | `GET` | `/api/products?limit=1` | no auth | prerequisite fixture capture | `200` | n/a | 03, 06, 08 collections | High | Low | No | can capture `negativeValidationTestProductId` and `negativeValidationTestProductSlug` |
| Optional token presence check | script-only | n/a | n/a | runtime token existence | n/a | n/a | not directly covered, candidate only | Medium | Low | No | hygiene-only, not API validation behavior |

Recommendation:

- include the public fixture capture request
- keep token existence checks optional and lightweight

### 01 Category And Product Negative Validation

Purpose:

- separate proven conflict behavior from unproven invalid-payload candidates in category/product admin flows

Candidate requests:

| Request | Method | Endpoint | Auth Role | Invalid Input / Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Delete category while related product still exists | `DELETE` | `/api/admin/categories/:id` | CATALOG_MANAGER | dependency/conflict | `409` | status-only first version | 02 collection’dan endpoint/payload davranışı kanıtlandı | High | Medium | Yes | strongest proven category/product negative case |
| Create product with invalid `categoryId` | `POST` | `/api/admin/products` | CATALOG_MANAGER | invalid/non-existing parent id | candidate only | status-only first version | 02 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | payload shape known, error semantics unproven |
| Patch product with invalid `status` | `PATCH` | `/api/admin/products/:id` | CATALOG_MANAGER | invalid enum | candidate only | minimal error-shape candidate | 02 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | accepted status values known, invalid handling unproven |
| Malformed product/category id | mixed | admin detail/update/delete | CATALOG_MANAGER | malformed UUID | candidate only | future scope | not directly covered, candidate only | Low | Low | No | should not be assumed |

Recommendation:

- strict first version: defer folder
- pragmatic early pilot: only the proven `409` conflict case

### 02 Cart Negative Validation

Purpose:

- evaluate safe rejected cart payload candidates without relying on uncertain error semantics

Candidate requests:

| Request | Method | Endpoint | Auth Role | Invalid Input / Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Missing `productId` on add item | `POST` | `/api/cart/items` | CUSTOMER | missing required field | candidate only | status-only first version | 03 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | request model proven, validation semantics not proven |
| `quantity = 0` on add item | `POST` | `/api/cart/items` | CUSTOMER | invalid numeric range | candidate only | status-only first version | 03 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | likely safe reject, but not evidenced |
| `quantity = -1` on update item | `PATCH` | `/api/cart/items/:itemId` | CUSTOMER | invalid numeric range | candidate only | status-only first version | 03 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | update payload known |
| Non-existing cart item id | `PATCH` / `DELETE` | `/api/cart/items/:itemId` | CUSTOMER | valid UUID but non-existing resource | candidate only | future scope | 03 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | not-found semantics not proven |

Recommendation:

- defer from first version

### 03 Checkout And Order Negative Validation

Purpose:

- isolate safe reference-level negative candidates from mutation-heavy checkout/order workflows

Candidate requests:

| Request | Method | Endpoint | Auth Role | Invalid Input / Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Deleted shipping carrier detail | `GET` | `/api/admin/shipping-carriers/:id` | ORDER_MANAGER | valid id but deleted resource | `404` | status-only first version | 04 collection’dan endpoint/payload davranışı kanıtlandı | High | Medium | Yes | strong proven not-found pattern |
| Deleted payment method detail | `GET` | `/api/admin/payment-methods/:id` | ORDER_MANAGER | valid id but deleted resource | `404` | status-only first version | 04 collection’dan endpoint/payload davranışı kanıtlandı | High | Medium | Yes | same pattern |
| Invalid `shippingServiceId` query | `GET` | `/api/payment-methods?shippingServiceId=:id` | no auth | invalid/non-existing reference id | candidate only | status-only first version | 04 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | query shape known, invalid behavior not proven |
| Empty cart checkout attempt | mutation flow | checkout/order endpoints | CUSTOMER | business validation failure | candidate only | future scope | not directly covered, candidate only | Low | High | Yes | outside safe first version |

Recommendation:

- strict first version: defer
- pragmatic pilot: only deleted shipping/payment detail `404` cases

### 04 Inventory Negative Validation

Purpose:

- identify rejected inventory validation candidates without mutating canonical fixture state

Candidate requests:

| Request | Method | Endpoint | Auth Role | Invalid Input / Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Negative `onHandQuantity` | `PUT` | `/api/admin/products/:productId/inventory` | CATALOG_MANAGER | invalid numeric value | candidate only | status-only first version | 05 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | payload shape known, rejection semantics unproven |
| Invalid adjustment `type` | `POST` | `/api/admin/products/:productId/inventory/adjustments` | CATALOG_MANAGER | invalid enum | candidate only | status-only first version | 05 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | accepted enum values known |
| Negative adjustment `quantity` | `POST` | same endpoint | CATALOG_MANAGER | invalid numeric value | candidate only | status-only first version | 05 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | likely rejected, not proven |
| Non-existing inventory product id | `GET` / `PUT` | inventory endpoints | admin roles | valid UUID but non-existing resource | candidate only | future scope | 05 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | not directly proven |

Recommendation:

- defer from first version

### 05 Product Media Negative Validation

Purpose:

- distinguish proven deleted-resource behavior from unproven create/update payload validation

Candidate requests:

| Request | Method | Endpoint | Auth Role | Invalid Input / Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Deleted media detail | `GET` | `/api/admin/products/media/:mediaId` | CATALOG_MANAGER | valid id but deleted resource | `404` | JSON + non-empty `message` | 06 collection’dan endpoint/payload davranışı kanıtlandı | High | Medium | Yes | strongest proven media negative case |
| Missing `src` on create media | `POST` | `/api/admin/products/:productId/media` | CATALOG_MANAGER | missing required field | candidate only | minimal error-shape candidate | 06 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | payload shape known |
| Invalid `sortOrder` | `POST` / `PATCH` | media endpoints | CATALOG_MANAGER | invalid numeric value | candidate only | status-only first version | 06 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | error semantics unproven |

Recommendation:

- strict first version: defer
- pragmatic pilot: deleted media detail `404`

### 06 Product Relations Negative Validation

Purpose:

- distinguish proven deleted-resource behavior from unproven relation payload validation

Candidate requests:

| Request | Method | Endpoint | Auth Role | Invalid Input / Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Deleted relation detail | `GET` | `/api/admin/products/relations/:relationId` | CATALOG_MANAGER | valid id but deleted resource | `404` | JSON + non-empty `message` | 07 collection’dan endpoint/payload davranışı kanıtlandı | High | Medium | Yes | strongest proven relation negative case |
| Missing `targetProductId` | `POST` | `/api/admin/products/:productId/relations` | CATALOG_MANAGER | missing required field | candidate only | minimal error-shape candidate | 07 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | payload shape known |
| Invalid `relationType` | `POST` | same endpoint | CATALOG_MANAGER | invalid enum | candidate only | status-only first version | 07 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | accepted relation type known |
| Self-reference or duplicate relation | `POST` | same endpoint | CATALOG_MANAGER | invalid relation/reference | candidate only | future scope | 07 collection’dan endpoint/payload davranışı kanıtlandı | Low | Medium | Yes | business-rule semantics unproven |

Recommendation:

- strict first version: defer
- pragmatic pilot: deleted relation detail `404`

### 07 Product Reviews Negative Validation

Purpose:

- distinguish proven deleted-resource behavior from unproven review payload validation

Candidate requests:

| Request | Method | Endpoint | Auth Role | Invalid Input / Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Deleted review detail | `GET` | `/api/admin/products/reviews/:reviewId` | CATALOG_MANAGER | valid id but deleted resource | `404` | JSON + non-empty `message` | 08 collection’dan endpoint/payload davranışı kanıtlandı | High | Medium | Yes | strongest proven review negative case |
| Missing `ratingValue` | `POST` | `/api/products/:productId/reviews` | CUSTOMER | missing required field | candidate only | minimal error-shape candidate | 08 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | payload model known |
| `ratingValue < 1` or `> 5` | `POST` / `PATCH` | review endpoints | CUSTOMER | invalid numeric range | candidate only | status-only first version | 08 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | likely rejected, not proven |
| Missing/empty `comment` | `POST` / `PATCH` | review endpoints | CUSTOMER | missing/empty field | candidate only | future scope | 08 collection’dan endpoint/payload davranışı kanıtlandı | Medium | Low | No | requirement semantics unproven |

Recommendation:

- strict first version: defer
- pragmatic pilot: deleted review detail `404`

### 08 Common Identifier And Not Found Behavior

Purpose:

- collect the strongest already-proven deleted/non-existing entity detail patterns into one shared guardrail area
- make future `400 vs 404` standardization work more visible

Candidate requests:

| Request | Method | Endpoint | Auth Role | Invalid Input / Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Deleted shipping carrier detail | `GET` | `/api/admin/shipping-carriers/:id` | ORDER_MANAGER | valid id but deleted resource | `404` | status-only first version | 04 collection’dan endpoint/payload davranışı kanıtlandı | High | Medium | Yes | no `message` assertion proven |
| Deleted payment method detail | `GET` | `/api/admin/payment-methods/:id` | ORDER_MANAGER | valid id but deleted resource | `404` | status-only first version | 04 collection’dan endpoint/payload davranışı kanıtlandı | High | Medium | Yes | same pattern |
| Deleted media detail | `GET` | `/api/admin/products/media/:mediaId` | CATALOG_MANAGER | valid id but deleted resource | `404` | JSON + non-empty `message` | 06 collection’dan endpoint/payload davranışı kanıtlandı | High | Medium | Yes | stronger minimal error-shape evidence |
| Deleted relation detail | `GET` | `/api/admin/products/relations/:relationId` | CATALOG_MANAGER | valid id but deleted resource | `404` | JSON + non-empty `message` | 07 collection’dan endpoint/payload davranışı kanıtlandı | High | Medium | Yes | stronger minimal error-shape evidence |
| Deleted review detail | `GET` | `/api/admin/products/reviews/:reviewId` | CATALOG_MANAGER | valid id but deleted resource | `404` | JSON + non-empty `message` | 08 collection’dan endpoint/payload davranışı kanıtlandı | High | Medium | Yes | stronger minimal error-shape evidence |
| Malformed UUID cross-module | mixed | admin detail endpoints | admin roles | malformed id | candidate only | future scope | not directly covered, candidate only | Low | Low | No | should not be assumed |

Recommendation:

- if a first `10` implementation is desired, this is the safest pilot folder
- still requires explicit approval if medium setup burden is considered out of scope

### 09 Final Environment Hygiene

Purpose:

- clean only `10`-owned temporary variables
- ensure no runtime state leaks if any setup/delete pilot flows are later included

Candidate requests:

| Request | Method | Endpoint | Auth Role | Invalid Input / Scenario | Expected Status | Expected Error Shape | Evidence Source | Confidence | Mutation Risk | Cleanup Required | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Final cleanup request with unset script | `GET` | public fixture endpoint | no auth | final hygiene | `200` | n/a | 02, 03, 06, 07, 08 collections | High | Low | No | only used `negativeValidationTest*` variables should be unset |

Recommendation:

- final folder should remain
- unset only the variables actually used by the future collection

## Deferred / Needs Confirmation

The following areas should stay outside the first implementation set unless separate confirmation or new accepted evidence is added:

- malformed UUID behavior across modules
- invalid enum semantics across admin write endpoints
- missing-field behavior for category, product, media, relation, and review create requests
- cart invalid quantity and non-existing item behavior
- inventory negative quantity and invalid adjustment behavior
- checkout/order mutation-heavy validation flows
- wrong parent id plus valid child id nested-resource cases
- duplicate relation or duplicate-reference business-rule errors
- full error-shape standardization assertions such as `message + error + statusCode`

## Expected Behavior Risks

The main risk areas are evidence risks rather than implementation risks:

- `invalid UUID -> 400` should not be assumed globally
- `non-existing id -> 404` should not be generalized beyond already-proven endpoint families
- validation error bodies should not be assumed to share one common shape yet
- `missing field`, `invalid enum`, and `invalid numeric range` semantics are not broadly proven in accepted collections
- parent-not-found vs payload-validation distinctions are not consistently evidenced across modules

## Mutation And Cleanup Risks

The most valuable negative behaviors currently proven by the accepted suite often come from delete-after-create or delete-after-update flows. That means strong evidence exists, but much of it is not low mutation-risk.

Higher-risk areas include:

- category/product dependency cleanup
- checkout shipping/payment nested admin setup flows
- inventory write and adjustment validation
- media create/delete validation
- relation create/delete validation
- review create/delete validation
- cart item mutation validation

## Recommended First Implementation Strategy

The future first implementation should follow this sequence:

1. keep the first version intentionally small
2. include only High-confidence behaviors
3. prefer already-proven deleted-resource detail `404` patterns over speculative `400` validation guesses
4. avoid mutation-heavy validation cases that require new setup logic
5. use only `10`-owned temporary variable names
6. preserve shared auth, base URL, and user identity variables
7. treat the suite as a first negative-validation guardrail, not as a full backend validation standard

## Future Feature Request Notes

This design capture is well aligned with:

- Admin Validation and Error Behavior Standardization
- API Contract and Protocol Compliance Audit

But it does not close either feature area. In particular, it does not settle:

- `400 vs 404 vs 409` standards
- full common error-body shape
- malformed UUID handling standards
- nested parent/child validation semantics

## Coverage Verification Notes

Outcome: `B` - the document is mostly sufficient, but future implementation quality benefits from clearer separation between accepted-suite negative evidence and repo-backed validation candidates.

### Module Coverage Status

| Module | Status | Verification Note |
|---|---|---|
| categories | Covered | Accepted `02` already proves a representative `409` dependency/conflict case. DTOs and service logic also show `UUID`, `enum`, and `Min(0)` validation surfaces, but those remain mostly repo-backed candidates. |
| products | Covered | DTOs clearly expose `UUID`, `enum`, `Min`, `Max`, and required-string validation surfaces. Accepted baseline is still stronger for conflict/not-found patterns than for payload-validation semantics. |
| inventory | Covered | Repo exposes meaningful validation surface through `CreateInventoryAdjustmentDto` and protected write DTOs. Accepted `05` proves role-denial patterns strongly, but invalid payload semantics remain candidate coverage. |
| product-media | Covered | DTOs expose required `src`, optional `alt`, and bounded `sortOrder`; accepted `06` strongly proves deleted-detail `404` and admin mutation envelope behavior. |
| product-relations | Covered | DTOs and service logic expose invalid UUID, invalid enum, self-reference conflict, duplicate conflict, and not-found parent/target patterns; accepted `07` strongly proves deleted-detail `404`. |
| product-reviews | Covered | Accepted `08` proves deleted-detail `404`, `401`, and admin/customer boundary contrast. DTOs expose `ratingValue` bounds and optional non-empty comment behavior. |
| cart | Covered | Accepted `03` is stronger than a pure candidate here: it already proves `400` for `quantity = 0`, `400` for malformed `productId`, `404` for random UUID product, and `400 or 404` ambiguity for non-existing cart item mutation. |
| checkout | Deferred | Accepted `04` is strongest for reference/admin resource negatives, not mutation-heavy customer checkout validation. |
| payment-methods | Covered | Accepted `04` proves deleted-detail `404`; DTOs expose `enum`, `sortOrder`, and required-string validation surfaces for future candidate coverage. |
| shipping-carriers | Covered | Accepted `04` proves deleted-detail `404`; DTOs expose `enum`, `Min`, and nested capability/service validation surfaces for future candidate coverage. |
| addresses | Deferred | Validation/error behavior is relevant in repo terms, but addresses are not part of accepted `01-08` baseline and should remain outside first-scope `10` unless intentionally expanded later. |

### Accepted Baseline vs Repo-Backed Candidate

- Accepted baseline:
  - `02` proves category delete conflict `409` while a related product still exists.
  - `03` proves real customer negative cases: `400` for `quantity = 0`, `400` for malformed product id, `404` for valid UUID but non-existing product, and `400 or 404` ambiguity for cart item mutation against a non-existing id.
  - `04` proves deleted shipping carrier and payment method detail `404`.
  - `06`, `07`, and `08` prove deleted media/relation/review detail `404`.
- Repo-backed candidate:
  - `src/main.ts` applies a global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true`, which strengthens the case for unknown-field and type-conversion negative coverage even where accepted collections do not yet assert it.
  - DTO decorators across categories, products, cart, inventory, media, relations, reviews, shipping carriers, and payment methods show clear `IsUUID`, `IsEnum`, `IsInt`, `Min`, `Max`, `IsNotEmpty`, and optional-field validation surfaces.
  - Service logic in categories, products, relations, inventory, shipping carriers, and payment methods exposes explicit `NotFoundException` and `ConflictException` branches worth treating as future representative negative coverage.
- Open question:
  - The precise body shape of validation errors under the global validation pipe is still not baseline-proven by accepted collections, so `statusCode/message/error` assertions should remain conservative until deliberately confirmed.

### Validation Surface Coverage Notes

- Covered representative invalid input types:
  - missing required field
  - invalid UUID / malformed id
  - valid UUID but non-existing resource
  - invalid enum/status value
  - invalid number / negative number
  - invalid relation/reference
- Still weak or open:
  - empty string behavior where the DTO uses `@IsString()` without `@IsNotEmpty()`
  - invalid boolean/type mismatch on endpoints that rely on transformation
  - malformed JSON/body transport-level behavior
  - `415` unsupported media type and `405` method not allowed behavior
  - unknown/extra field behavior under `forbidNonWhitelisted`, because repo support exists but accepted collection evidence does not yet

### Observed Repo Signals

- global validation behavior: `src/main.ts` installs a global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and `transform`, making payload-shape and extra-field handling a real future audit target.
- categories/products: DTOs include `UUID`, `enum`, required string, and bounded numeric validation; services add explicit `NotFound` and `Conflict` branches.
- cart: DTOs require UUID product ids and `quantity >= 1`, and accepted `03` already proves several negative outcomes directly.
- inventory: DTOs require valid adjustment enum and positive quantity; service logic adds not-found and business conflict branches.
- product-media / product-relations / product-reviews: each module combines DTO validation with strong accepted deleted-detail `404` evidence.
- shipping-carriers / payment-methods: nested DTOs expose substantial validation surface, while accepted `04` proves deletion-driven `404` coverage more strongly than payload validation.

### Main Gaps

- `405` and `415` protocol-level negatives are not meaningfully evidenced and should remain Open Question unless intentionally added later.
- unknown/extra field behavior is repo-backed through `forbidNonWhitelisted`, but not yet accepted-suite backed.
- validation error body shape is still under-evidenced compared with plain status-code behavior.
- addresses are relevant in architecture terms but not strong enough for first-scope `10` based on accepted baseline.

### Cleanup And Repeatability Notes

- The document already correctly favors rejected-before-persistence requests and deleted-detail follow-up patterns.
- Conflict tests that require setup should continue using disposable unique data only.
- Invalid payload tests must never rely on shared canonical records being mutated.
- Only collection-owned `negativeValidationTest...` variables should be removed during final hygiene.
- Shared auth/base/user variables from `01` must remain untouched.

## Not Implementation Yet

This feature request explicitly does not mean:

- the `10` collection already exists
- the endpoint matrix is automatically approved for live execution
- expected validation statuses should be inferred from ad-hoc probing
- ambiguous negative behavior should be forced into a PASS-oriented suite

The actual collection, when created later, should be implemented only after this design capture is intentionally used as the backlog source.
