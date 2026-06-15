# Postman Newman Analysis Protocol

<a id="purpose"></a>

## Purpose

This document defines how we currently analyze Postman collections and Newman outputs in this project.

It covers test collection hygiene and black-box API behavior observed from Newman results.

It does not define a full API contract or protocol compliance audit.

<a id="contents"></a>

## Contents

* [Purpose](#purpose)
* [Document Responsibility](#document-responsibility)
* [Analysis Scope](#analysis-scope)
* [Standard Newman Command](#standard-newman-command)
* [Collection Hygiene Checks](#collection-hygiene-checks)
* [API Behavior Checks](#api-behavior-checks)
* [Environment Hygiene Checks](#environment-hygiene-checks)
* [Review Output](#review-output)

<a id="document-responsibility"></a>

## Document Responsibility

This document owns the current review method for Postman/Newman test analysis.

It answers:

* how Newman collections should be run for analysis;
* which report files should be generated;
* what collection hygiene checks should be made;
* what API behavior can be inferred from the output;
* what must stay outside this review scope.

Endpoint contracts, Swagger/OpenAPI alignment, HTTP header policy, CORS, security headers, idempotency, and full protocol compliance are outside this document.

<a id="analysis-scope"></a>

## Analysis Scope

Current Newman analysis has three layers.

```txt
Postman collection hygiene: detailed
API black-box behavior: endpoint-response based
Full API protocol compliance: not covered here
```

This means we first make the test collection trustworthy.

Then we use the cleaned test output to reason about visible API behavior.

We do not treat Newman output as a complete protocol compliance audit.

<a id="standard-newman-command"></a>

## Standard Newman Command

Run the token setup first when fresh role tokens are needed.

```bash
mkdir -p postman/reports

newman run postman/01-user-role-token-setup.postman_collection.json \
  -e postman/simsir-local.postman_environment.json \
  --export-environment postman/simsir-local.newman-runtime.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export postman/reports/01-user-role-token-setup-report.json \
  2>&1 | tee postman/reports/01-user-role-token-setup-output.txt
```

Run target collections with CLI and JSON reporters.

```bash
newman run postman/<collection-name>.postman_collection.json \
  -e postman/simsir-local.newman-runtime.postman_environment.json \
  --export-environment postman/simsir-local.newman-runtime.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export postman/reports/<collection-name>-report.json \
  2>&1 | tee postman/reports/<collection-name>-output.txt
```

Use `set -o pipefail` when needed so Newman failures are not hidden by `tee`.

<a id="collection-hygiene-checks"></a>

## Collection Hygiene Checks

For each collection, check:

* request order is meaningful;
* role-denial tests use existing records when needed;
* created fixtures are cleaned after dependent assertions;
* update assertions verify changed fields;
* delete assertions verify absence when practical;
* temporary variables use collection-owned names;
* temporary variables are unset at the end.

Good temporary variable examples:

```txt
categoryProductRoleTestProductId
cartEndpointTestItemId
checkoutReferenceRoleTestPaymentMethodId
```

Avoid generic temporary names unless they are intentionally shared.

<a id="api-behavior-checks"></a>

## API Behavior Checks

After the collection itself is reliable, use Newman output to review visible API behavior.

Check only what the test actually proves.

Examples:

* unauthenticated requests return `401`;
* forbidden role access returns `403`;
* ownership isolation returns expected status;
* validation errors return expected status;
* create requests return usable IDs;
* update requests actually change expected fields;
* delete requests actually remove records;
* public and admin endpoints expose expected response shapes.

If a request name claims behavior that assertions do not prove, strengthen the test before accepting the behavior.

<a id="environment-hygiene-checks"></a>

## Environment Hygiene Checks

Because Newman exports the runtime environment, temporary test values can leak into:

```txt
postman/simsir-local.newman-runtime.postman_environment.json
```

Each collection should unset its own temporary variables after cleanup.

Do not unset shared values such as:

```txt
Backend_URL
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

Runtime report files and exported environment files may contain tokens, so they should normally stay out of git.

<a id="review-output"></a>

## Review Output

Each analysis should end with a short result.

Recommended format:

```md
## Summary
PASS or FAIL and high-level conclusion.

## Newman Result
Requests, assertions, scripts, duration, and average response time.

## Collection Hygiene
Variable naming, cleanup, request order, and assertion strength.

## API Behavior
What the output proves about the API.

## Environment Check
Whether temporary variables remain in the exported runtime environment.

## Recommendation
Accept, improve test hygiene, strengthen assertions, fix runtime state, or prepare a separate follow-up.
```
