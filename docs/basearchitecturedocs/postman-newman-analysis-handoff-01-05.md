# Postman Newman Analysis Handoff 01-05

<a id="purpose"></a>

## Purpose

This note transfers the current Postman/Newman analysis context so the next ChatGPT session can continue efficiently from `06-product-media-submodule-tests`.

It summarizes the agreed analysis protocol, completed collection status, hygiene standards, report-sharing expectations, and the next target.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Current Protocol](#current-protocol)
- [Standard Newman Flow](#standard-newman-flow)
- [Completed Collections](#completed-collections)
- [Current Hygiene Standard](#current-hygiene-standard)
- [Artifact Sharing Rules](#artifact-sharing-rules)
- [Next Target](#next-target)
- [Expected Analysis Format](#expected-analysis-format)

<a id="current-protocol"></a>

## Current Protocol

Use this repository document as the main analysis guide:

```txt id="b7vn8v"
docs/basearchitecturedocs/postman-newman-analysis-protocol.md
```

Current analysis scope:

```txt id="pyueu7"
Postman collection hygiene: detailed
API black-box behavior: endpoint-response based
Full API protocol compliance: not covered here
Backend implementation review: only if required by a failing test
```

Do not treat Newman output as a full API protocol compliance audit.

Do not add unrelated API contract, Swagger/OpenAPI, headers, CORS, idempotency, or security audit topics unless explicitly requested.

<a id="standard-newman-flow"></a>

## Standard Newman Flow

First refresh runtime tokens when needed:

```bash id="jk4vgo"
set -o pipefail
mkdir -p postman/reports

newman run postman/01-user-role-token-setup.postman_collection.json \
  -e postman/simsir-local.postman_environment.json \
  --export-environment postman/simsir-local.newman-runtime.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export postman/reports/01-user-role-token-setup-report.json \
  2>&1 | tee postman/reports/01-user-role-token-setup-output.txt
```

Then run the target collection:

```bash id="fh3pif"
newman run postman/<collection-name>.postman_collection.json \
  -e postman/simsir-local.newman-runtime.postman_environment.json \
  --export-environment postman/simsir-local.newman-runtime.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export postman/reports/<collection-name>-report.json \
  2>&1 | tee postman/reports/<collection-name>-output.txt
```

For the next step, replace `<collection-name>` with:

```txt id="35a89e"
06-product-media-submodule-tests
```

<a id="completed-collections"></a>

## Completed Collections

Current status:

```txt id="2n75kq"
01-user-role-token-setup: PASS
02-category-product-role-tests: PASS + cleaned
03-cart-endpoint-tests: PASS + cleaned
04-checkout-reference-role-tests: PASS + cleaned
05-inventory-admin-tests: PASS + cleaned
```

Important completed learnings:

```txt id="obx2xa"
02: category/product role tests cleaned; product inventory summary expectations corrected by endpoint scope.
03: cart flow strengthened; duplicate add, quantity update, delete absence, ownership vars cleaned.
04: checkout reference role tests cleaned; public/admin/RBAC/cleanup flow validated.
05: inventory admin tests cleaned; fixture restore added; inventory temp variables unset.
```

<a id="current-hygiene-standard"></a>

## Current Hygiene Standard

A collection is considered clean when:

```txt id="9lqukm"
1. Newman passes with 0 request failures and 0 assertion failures.
2. Test request order is meaningful.
3. Role-denial tests run against existing records where needed.
4. Temporary variables are collection-owned.
5. Created or mutated fixtures are cleaned/restored intentionally.
6. Final assertions verify cleanup/restoration where practical.
7. Collection-owned temporary variables are unset at the end.
8. Shared auth/base/canonical fixture variables are preserved.
```

Examples of collection-owned temporary variables already used:

```txt id="q3sykv"
categoryProductRoleTestProductId
cartEndpointTestItemId
checkoutReferenceRoleTestPaymentMethodId
inventory_test_product_id
inventory_initial_on_hand
inventory_initial_reserved
inventory_reserved_before_flow
```

Shared variables that must normally remain:

```txt id="a92vgr"
Backend_URL
Demo_User_Password
super_admin_access_token
customer_access_token
catalog_manager_access_token
order_manager_access_token
support_staff_access_token
super_admin_user_id
customer_user_id
catalog_manager_user_id
order_manager_user_id
support_staff_user_id
```

Canonical fixture variables should remain unless explicitly proven temporary.

Example:

```txt id="34i7a9"
demo_inventory_product_slug
```

<a id="artifact-sharing-rules"></a>

## Artifact Sharing Rules

For quick PASS/FAIL analysis, share:

```txt id="dg7o2d"
postman/reports/<collection-name>-output.txt
```

For deeper hygiene/script/environment analysis, share both:

```txt id="f5awlp"
postman/reports/<collection-name>-output.txt
postman/reports/<collection-name>-report.json
```

If environment cleanup must be verified, also share:

```txt id="c5gqij"
postman/simsir-local.newman-runtime.postman_environment.json
```

Security note:

```txt id="81mvsd"
Newman JSON reports and exported runtime environment files may contain access tokens, user IDs, request metadata, and response bodies.
They should stay out of git.
```

Git hygiene expectation:

```txt id="26bneq"
postman/reports/*
postman/simsir-local.newman-runtime.postman_environment.json
```

should normally be ignored as local/test artifacts.

<a id="next-target"></a>

## Next Target

Continue with:

```txt id="a9fzqs"
postman/06-product-media-submodule-tests.postman_collection.json
```

First task for the next ChatGPT session:

```txt id="ylvq0x"
Analyze the Newman output and JSON report for 06-product-media-submodule-tests according to docs/basearchitecturedocs/postman-newman-analysis-protocol.md.
```

The analysis should determine:

```txt id="aci9ux"
1. Does Newman pass?
2. What API behavior does 06 actually prove?
3. Are role-based access checks meaningful?
4. Are created media/product fixtures cleaned?
5. Are collection-owned temporary variables unset?
6. Does the exported runtime environment contain stale 06-specific temp state?
7. Is a Codex hygiene follow-up prompt needed?
```

Do not immediately ask Codex to fix anything unless analysis shows a real failure or hygiene gap.

<a id="expected-analysis-format"></a>

## Expected Analysis Format

Use this format for each collection:

```md id="qfw5bg"
# Newman Analysis: <collection-name>

## Summary
PASS/FAIL and high-level conclusion.

## Newman Result
Requests, assertions, scripts, duration, and average response time.

## Functional Coverage
What API behavior the collection actually proves.

## Failures
List failures if any.

## Test Hygiene Review
Variable naming, cleanup, request order, assertion strength, and role-denial quality.

## Generated Environment Check
Temporary variables that remain or are correctly absent.

## Report Artifact Sensitivity
Whether generated files contain tokens/runtime data.

## Recommendation
Accept, improve test hygiene, strengthen assertions, fix runtime state, or prepare a Codex follow-up prompt.
```
