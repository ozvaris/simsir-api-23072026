# Postman JSON Generation Protocol

<a id="purpose"></a>

## Purpose

This document defines how Postman importable JSON collections should be generated for this backend project.

The goal is to speed up manual API testing by generating ready-to-import `.postman_collection.json` files and optional `.zip` bundles that match the project's environment-variable based Postman workflow.

This protocol is especially useful for:

- public endpoint checks;
- authenticated user-owned endpoint checks;
- admin/RBAC endpoint checks;
- CRUD flow tests;
- active/inactive visibility tests;
- role-based access matrix tests;
- repeated regression checks after Codex changes.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Core Rule](#core-rule)
- [When To Generate Postman JSON](#when-to-generate-postman-json)
- [Output Formats](#output-formats)
- [Single Collection With Folders Rule](#single-collection-with-folders-rule)
- [Zip Bundle Rule](#zip-bundle-rule)
- [Postman Environment Variables](#postman-environment-variables)
- [Collection Naming](#collection-naming)
- [Folder Naming](#folder-naming)
- [Request Naming](#request-naming)
- [URL Rules](#url-rules)
- [Authorization Rules](#authorization-rules)
- [Status Code Test Rules](#status-code-test-rules)
- [Response Shape Test Rules](#response-shape-test-rules)
- [Variable Capture Rules](#variable-capture-rules)
- [Body Rules](#body-rules)
- [CRUD Flow Rules](#crud-flow-rules)
- [RBAC Role Test Rules](#rbac-role-test-rules)
- [Public/Admin Visibility Rules](#public-admin-visibility-rules)
- [README Rule](#readme-rule)
- [Fast Generation Method](#fast-generation-method)
- [Generator Helper Design](#generator-helper-design)
- [Generation Checklist](#generation-checklist)
- [Recommended Handoff Format](#recommended-handoff-format)

<a id="core-rule"></a>

## Core Rule

When the user asks for a Postman test artifact, generate an importable file instead of only pasting raw JSON.

Preferred outputs:

```txt
single-purpose.postman_collection.json
```

or:

```txt
single-collection-with-folders.zip
```

For multi-scenario tests, the zip should usually contain one collection file with folders, not many separate collection files.

<a id="when-to-generate-postman-json"></a>

## When To Generate Postman JSON

Generate Postman JSON when the user asks for:

- "Postman json";
- "Postman import file";
- "zip file";
- "sürükle bırak import";
- endpoint tests;
- RBAC role tests;
- CRUD tests;
- regression tests;
- public/admin behavior tests.

Do not generate Postman JSON when the user only asks for a conceptual explanation.

<a id="output-formats"></a>

## Output Formats

### Single request or small scenario

Use one file:

```txt
payment-methods-public-200.postman_collection.json
```

### Multi-step or role-based scenario

Use one zip containing one collection and a README:

```txt
category-product-role-tests-single-collection.zip
  category-product-role-tests.postman_collection.json
  README.txt
```

Avoid this for multi-step flows:

```txt
01-step-one.postman_collection.json
02-step-two.postman_collection.json
03-step-three.postman_collection.json
```

Because Postman imports them as separate collections, which makes the user's workflow harder.

<a id="single-collection-with-folders-rule"></a>

## Single Collection With Folders Rule

For multi-scenario tests, create one collection and place each scenario under folders.

Example:

```txt
Simsir - Category Product Role Tests
  01 Public Category Product
  02 CUSTOMER Access - Admin Catalog Should Be 403
  03 SUPER_ADMIN Access - Admin Catalog Read Should Be 200
  04 CATALOG_MANAGER Category Product CRUD + Active Inactive Behavior
  05 ORDER_MANAGER Access - Catalog Admin Should Be 403
  06 SUPPORT_STAFF Read 200 Write 403
```

Postman collection shape:

```txt
collection.item[]
  folder.item[]
    request
```

<a id="zip-bundle-rule"></a>

## Zip Bundle Rule

A zip bundle should contain:

```txt
<collection-name>.postman_collection.json
README.txt
```

The zip should not contain multiple collections unless the user explicitly asks for separate collections.

<a id="postman-environment-variables"></a>

## Postman Environment Variables

Use Postman environment variables instead of hardcoded values.

Base URL:

```txt
{{Backend_URL}}
```

Common token variables:

```txt
{{access_token}}
{{customer_access_token}}
{{super_admin_access_token}}
{{catalog_manager_access_token}}
{{order_manager_access_token}}
{{support_staff_access_token}}
```

Common generated id variables:

```txt
{{test_category_id}}
{{test_category_slug}}
{{test_product_id}}
{{test_product_slug}}
{{test_shipping_carrier_id}}
{{test_payment_method_id}}
{{customer_user_id}}
{{order_manager_user_id}}
{{support_staff_user_id}}
```

Do not hardcode real tokens.

<a id="collection-naming"></a>

## Collection Naming

Collection name should be clear and domain-specific.

Examples:

```txt
Simsir - Checkout Reference Role Tests
Simsir - Category Product Role Tests
Simsir - User Role Token Setup
Simsir - Cart Endpoint Tests
```

File name should be lowercase and descriptive:

```txt
checkout-reference-role-tests.postman_collection.json
category-product-role-tests.postman_collection.json
user-role-token-setup.postman_collection.json
```

<a id="folder-naming"></a>

## Folder Naming

Folders should be numbered to preserve execution order:

```txt
01 Public Checks
02 CUSTOMER Access
03 SUPER_ADMIN Access
04 Domain Manager CRUD
05 Negative Role Checks
```

For workflows that depend on previous variables, folder order matters.

Example:

```txt
04 CATALOG_MANAGER Category Product CRUD
```

may create:

```txt
test_category_id
test_product_id
```

Later folders may reuse those ids.

<a id="request-naming"></a>

## Request Naming

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

<a id="url-rules"></a>

## URL Rules

Always use `{{Backend_URL}}`.

Correct:

```txt
{{Backend_URL}}/api/categories
```

Wrong:

```txt
http://localhost:3000/api/categories
```

Postman URL object should include:

```json
{
  "raw": "{{Backend_URL}}/api/categories",
  "host": ["{{Backend_URL}}"],
  "path": ["api", "categories"]
}
```

For query params, prefer Postman `query` array:

```json
"query": [
  { "key": "status", "value": "inactive" }
]
```

<a id="authorization-rules"></a>

## Authorization Rules

### Public endpoint

Use `noauth`.

```json
{
  "type": "noauth"
}
```

### Authenticated endpoint

Use bearer token variable.

```json
{
  "type": "bearer",
  "bearer": [
    {
      "key": "token",
      "value": "{{customer_access_token}}",
      "type": "string"
    }
  ]
}
```

### Role-specific endpoint

Use the matching role token:

```txt
CUSTOMER         -> {{customer_access_token}}
SUPER_ADMIN      -> {{super_admin_access_token}}
CATALOG_MANAGER  -> {{catalog_manager_access_token}}
ORDER_MANAGER    -> {{order_manager_access_token}}
SUPPORT_STAFF    -> {{support_staff_access_token}}
```

<a id="status-code-test-rules"></a>

## Status Code Test Rules

Every request should assert the expected status code.

### 200

```js
pm.test('Status code is 200', function () {
  pm.response.to.have.status(200);
});
```

### 200 or 201

Use for create endpoints when NestJS may return `201 Created`.

```js
pm.test('Status code is 200 or 201', function () {
  pm.expect([200, 201]).to.include(pm.response.code);
});
```

### 401

```js
pm.test('Status code is 401', function () {
  pm.response.to.have.status(401);
});
```

### 403

```js
pm.test('Status code is 403', function () {
  pm.response.to.have.status(403);
});
```

### 404

```js
pm.test('Status code is 404', function () {
  pm.response.to.have.status(404);
});
```

<a id="response-shape-test-rules"></a>

## Response Shape Test Rules

### JSON response

```js
pm.test('Response is JSON', function () {
  pm.response.to.be.json;
});
```

### List response

```js
pm.test('Response has items array', function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property('items');
  pm.expect(json.items).to.be.an('array');
});
```

### Operation result

```js
pm.test('Response has success true', function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property('success', true);
});
```

<a id="variable-capture-rules"></a>

## Variable Capture Rules

When a create request returns an id, save it to the Postman environment.

Example:

```js
const json = pm.response.json();
pm.environment.set('test_category_id', json.id);
pm.environment.set('test_category_slug', json.slug);
```

If response shape may be wrapped, use a safe helper:

```js
const json = pm.response.json();
const entity = json.data || json.item || json;
if (entity.id) pm.environment.set('test_category_id', entity.id);
if (entity.slug) pm.environment.set('test_category_slug', entity.slug);
```

For login responses:

```js
const json = pm.response.json();
if (json.accessToken) {
  pm.environment.set('customer_access_token', json.accessToken);
}
if (json.user && json.user.id) {
  pm.environment.set('customer_user_id', json.user.id);
}
```

<a id="body-rules"></a>

## Body Rules

Use raw JSON body for POST and PATCH.

Example:

```json
{
  "mode": "raw",
  "raw": "{\n  \"name\": \"Test Category\",\n  \"slug\": \"test-category-{{$timestamp}}\",\n  \"status\": \"active\"\n}",
  "options": {
    "raw": {
      "language": "json"
    }
  }
}
```

Use dynamic values to avoid duplicate conflicts:

```txt
{{$timestamp}}
```

Examples:

```txt
postman-category-{{$timestamp}}
postman-product-{{$timestamp}}
test_shipping_{{$timestamp}}
test_payment_{{$timestamp}}
```

<a id="crud-flow-rules"></a>

## CRUD Flow Rules

A CRUD folder should test the full lifecycle in order:

1. create;
2. list/read;
3. detail;
4. update;
5. status update when the resource supports active/inactive visibility;
6. delete hard-delete attempt;
7. verify public visibility after status update;
8. verify admin visibility after status update.

Delete and deactivate must not be treated as the same operation.

Expected behavior:

```txt
PATCH /api/admin/products/:id
  -> may update ordinary product fields

PATCH /api/admin/products/:id/status
  -> status = inactive

DELETE /api/admin/products/:id
  -> hard-delete attempt or business error
```

For resources using active/inactive visibility, do not use `DELETE` to change visibility.

Expected behavior:

```txt
PATCH /api/admin/products/:id/status
  -> status = inactive

GET /api/products
  -> inactive product does not appear

GET /api/admin/products?status=inactive
  -> inactive product appears
```

<a id="rbac-role-test-rules"></a>

## RBAC Role Test Rules

A role-based test collection should verify both positive and negative access.

Example for catalog:

```txt
CUSTOMER
  admin catalog endpoint -> 403

SUPER_ADMIN
  admin catalog read -> 200

CATALOG_MANAGER
  admin catalog CRUD -> 200 or 201

ORDER_MANAGER
  admin catalog endpoint -> 403

SUPPORT_STAFF
  read -> 200 if read permission exists
  write -> 403
```

Example for checkout reference:

```txt
CUSTOMER
  admin shipping/payment endpoint -> 403

ORDER_MANAGER
  shipping/payment CRUD -> 200 or 201

SUPPORT_STAFF
  read -> 200
  create/update/delete -> 403
```

<a id="public-admin-visibility-rules"></a>

## Public/Admin Visibility Rules

Public endpoints are storefront/customer-facing endpoints.

They should generally return only active/visible records.

Examples:

```txt
GET /api/categories
GET /api/products
GET /api/shipping-carriers
GET /api/payment-methods
```

Admin endpoints are management endpoints.

They may return active and inactive records and may support status filters.

Examples:

```txt
GET /api/admin/categories?status=inactive
GET /api/admin/products?status=inactive
GET /api/admin/shipping-carriers?status=inactive
GET /api/admin/payment-methods?status=inactive
```

When a domain has `status`, generated Postman tests should verify:

- active records appear in public lists;
- inactive records do not appear in public lists;
- inactive records appear in admin inactive list;
- status update uses PATCH, not DELETE;
- delete is tested as hard-delete attempt or expected business error.

<a id="readme-rule"></a>

## README Rule

Every zip bundle should contain `README.txt`.

The README should include:

- what the collection tests;
- required environment variables;
- recommended run order;
- generated variables;
- known assumptions.

Example:

```txt
Required environment variables:

Backend_URL
customer_access_token
super_admin_access_token
catalog_manager_access_token
order_manager_access_token
support_staff_access_token
```

<a id="fast-generation-method"></a>

## Fast Generation Method

The fastest repeatable method is to generate the collection JSON with a small script rather than writing Postman JSON by hand.

Recommended process:

1. Define a small helper for auth blocks.
2. Define a small helper for URL objects.
3. Define a small helper for status test scripts.
4. Define a request factory.
5. Define folders as arrays of request objects.
6. Write one `.postman_collection.json` file.
7. Add a `README.txt`.
8. Zip both files.

This avoids copy/paste mistakes and keeps large role-based test collections consistent.

<a id="generator-helper-design"></a>

## Generator Helper Design

A generator script may use this conceptual helper structure.

### Auth helpers

```txt
noAuth()
bearer('{{super_admin_access_token}}')
bearer('{{catalog_manager_access_token}}')
```

### URL helper

```txt
url('/api/categories')
url('/api/admin/products', { status: 'inactive' })
```

### Test helpers

```txt
expectStatus(200)
expectStatusOneOf([200, 201])
expectItemsArray()
expectSuccessTrue()
saveEnvFromJson('test_product_id', 'id')
```

### Request helper

```txt
request({
  name,
  method,
  path,
  auth,
  body,
  tests,
})
```

### Folder helper

```txt
folder('01 Public Checks', [request1, request2])
```

A generator script should output valid Postman Collection v2.1 JSON:

```txt
https://schema.getpostman.com/json/collection/v2.1.0/collection.json
```

<a id="generation-checklist"></a>

## Generation Checklist

Before handing off a generated Postman artifact, verify:

1. It uses Postman Collection v2.1 schema.
2. It uses one collection with folders for multi-step flows.
3. It uses `{{Backend_URL}}`.
4. It does not hardcode real tokens.
5. Public requests use `noauth`.
6. Role requests use the correct role token variable.
7. POST/PATCH bodies are raw JSON.
8. Create tests accept `200` or `201` when appropriate.
9. Forbidden tests assert `403`.
10. Unauthorized tests assert `401`.
11. List tests check `items` array when applicable.
12. Create requests save ids/slugs/codes to environment variables when needed.
13. Later requests reuse saved variables.
14. README exists inside zip.
15. Zip contains one collection JSON file and README unless otherwise requested.

<a id="recommended-handoff-format"></a>

## Recommended Handoff Format

When handing off the generated file, keep the response short.

Example:

```md
Hazırladım. Postman'a zip olarak sürükleyip import edebilirsin:

[category-product-role-tests-single-collection.zip](sandbox:/mnt/data/category-product-role-tests-single-collection.zip)

Gerekli environment değişkenleri:

```txt
Backend_URL
customer_access_token
super_admin_access_token
catalog_manager_access_token
order_manager_access_token
support_staff_access_token
```
```
