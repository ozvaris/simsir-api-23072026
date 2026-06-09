# Backend Architecture Guide

<a id="purpose"></a>

## Purpose

This document defines the high-level backend architecture protocol.

It does not define domain-specific modules, endpoint lists, or entity schemas. Those belong to companion documents.

This guide answers:

- how code should be separated;
- how requests and responses should be modeled;
- how security defaults should work;
- how documentation boundaries should be respected;
- how backend decisions should be made consistently.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Document Boundaries](#document-boundaries)
- [Architecture Thinking Protocol](#architecture-thinking-protocol)
- [Layer Responsibility Protocol](#layer-responsibility-protocol)
- [Request / Response Protocol](#request-response-protocol)
- [Security Protocol](#security-protocol)
- [Authorization and RBAC Protocol](#authorization-rbac-protocol)
- [Module Boundary Protocol](#module-boundary-protocol)
- [CRUD Protocol](#crud-protocol)
- [Repository Protocol](#repository-protocol)
- [Ownership and Data Access Protocol](#ownership-data-access-protocol)
- [Validation and Error Protocol](#validation-error-protocol)
- [Admin and Internal Endpoint Protocol](#admin-internal-endpoint-protocol)
- [Documentation Protocol](#documentation-protocol)
- [Development Flow Protocol](#development-flow-protocol)

<a id="document-boundaries"></a>

## Document Boundaries

This document is the top-level backend architecture guide.

It defines architecture principles, decision rules, and development protocols that companion documents should follow.

Focused companion documents may define API contracts, entity relations, RBAC details, module examples, testing artifacts, and documentation workflows. The complete document map is maintained in `backend-docs-index.md`.

This document must stay above domain details. It may explain how to think, but it should not become a document index, module list, endpoint list, or table catalog.

<a id="architecture-thinking-protocol"></a>

## Architecture Thinking Protocol

Backend design should follow this order:

1. Understand the use-case.
2. Identify the domain boundary.
3. Decide request and response shapes.
4. Define validation rules.
5. Define data access and ownership rules.
6. Implement controller, service, repository, mapper, and response classes.
7. Stabilize documentation and tests.

Implementation should not begin from files first. Files reflect architecture decisions; they do not create them.

A good architecture decision should answer:

- What problem does this boundary solve?
- Which layer owns this responsibility?
- Which layer must not know this detail?
- What must remain stable if the domain grows?

<a id="layer-responsibility-protocol"></a>

## Layer Responsibility Protocol

Each layer has a strict responsibility.

### Controller

Controller receives HTTP input and delegates work.

Controller may:

- read route params;
- read query params;
- read request body DTOs;
- read current user context;
- call service methods;
- return service responses.

Controller must not:

- contain business rules;
- perform complex database queries;
- calculate totals or aggregates;
- decide ownership rules directly;
- return entities without mapping.

### Service

Service owns use-cases and business flow.

Service may:

- coordinate repositories;
- validate business conditions;
- check ownership;
- perform calculations;
- call mappers;
- manage transactions;
- decide response shape.

Service must not:

- expose database entities directly;
- depend on HTTP objects;
- contain raw request parsing logic;
- become a dumping ground for unrelated queries.

### Repository

Repository owns data access.

Repository may:

- execute TypeORM queries;
- apply relation loading;
- apply filtering and pagination;
- expose query methods needed by services.

Repository must not:

- decide business meaning;
- create response objects;
- know HTTP semantics;
- perform user-facing formatting.

### Entity

Entity represents the database model.

Entity must not be treated as an API response model.

### DTO

DTO represents request input.

DTO validates and shapes incoming body/query data.

### Response Class

Response class represents output shape.

Response classes should use the `Response` suffix.

### Mapper

Mapper converts entity data into response classes.

Mapper methods should use `to...Response()` naming.

<a id="request-response-protocol"></a>

## Request / Response Protocol

Requests and responses must be modeled separately.

Request input uses DTO classes:

- create DTO;
- update DTO;
- query DTO;
- action-specific DTO.

Response output uses Response classes:

- list item response;
- detail response;
- tree response;
- summary response;
- operation result response.

Entities must not be returned directly from controllers.

This separation protects the API from database shape changes and avoids leaking internal fields, relations, or persistence details.

Naming standard:

- `CreateResourceDto`
- `UpdateResourceDto`
- `ListResourceQueryDto`
- `ResourceResponse`
- `ResourceDetailResponse`
- `ResourceListResponse`
- `toResourceResponse()`
- `toResourceDetailResponse()`

If a database field is stored differently than the API expects, conversion belongs in the mapping layer.

Example:

- database decimal value may be stored as string;
- API response may need number;
- conversion belongs in `to...Response()` mapping.

<a id="security-protocol"></a>

## Security Protocol

Security defaults should be restrictive.

Default rule:

- endpoints are protected unless explicitly marked public.

Public access must be intentional.

Authentication context should be extracted through a current-user decorator, not through raw request access in every controller.

Token claim naming must be consistent across login, refresh, strategy validation, and guards.

Recommended claim standard:

- `sub` represents authenticated user id.

Controller methods should receive current user context and pass only the necessary identity fields to services.

Security checks should be explicit and testable.

<a id="authorization-rbac-protocol"></a>

## Authorization and RBAC Protocol

Authentication and authorization must be separated.

Authentication answers:

- who is the user?
- is the token or credential valid?
- what minimum identity context belongs to the request?

Authorization answers:

- which roles does the user have?
- which permissions are effective through those roles?
- may the user access this endpoint-level action?

Ownership answers a different question:

- may the user access or mutate this specific resource instance?

These three concerns must not be collapsed into a single `isAdmin` check or controller-level condition.

Recommended responsibility split:

- `auth` validates credentials, creates tokens, refreshes tokens, and resolves authenticated identity.
- `rbac` owns roles, permissions, user-role links, role-permission links, and authorization summary calculation.
- guards read endpoint metadata and decide coarse endpoint access.
- domain services enforce ownership, tenant filtering, and business-specific data access rules.

JWT payloads should stay minimal.

Recommended JWT payload fields:

- `sub` for authenticated user id;
- `sessionId` when session tracking is needed;
- `tokenVersion` when forced token invalidation is needed.

JWT payloads should not carry large permission arrays by default. Role or permission changes should be reflected through request context enrichment, not by waiting for a long-lived token to expire.

The request user context may be enriched with:

- `userId`;
- `email` or username;
- `roles`;
- `permissions`;
- derived `isAdmin`;
- tenant or company context only when the project actually needs multi-tenant behavior.

Role and permission usage should follow this rule:

- use roles for broad business responsibility;
- use permissions for precise technical actions;
- derive `isAdmin` from roles or permissions instead of storing it as the main authorization model.

User-owned flows and admin flows should be classified separately.

Examples of access classification:

- public read operations may use explicit public metadata;
- authenticated user-owned operations require current user context and ownership checks;
- admin or staff operations require role or permission metadata;
- internal operations require stronger protection and should not be accidentally exposed as public API.

RBAC does not replace ownership checks. A user may have permission to perform an action in general but still be restricted to resources they own or resources within their allowed operational scope.

Tenant or company context should not be added only because RBAC supports it. Add tenant-aware authorization only when the product model requires multiple companies, stores, sellers, or customer organizations sharing the same application.

<a id="module-boundary-protocol"></a>

## Module Boundary Protocol

A module boundary should be based on domain behavior, not only on database tables.

A good module boundary usually contains:

- entities related to the domain;
- DTOs for input;
- response classes for output;
- repository classes for data access;
- service classes for use-cases;
- controllers for HTTP surface.

A module may know another module's entity when a real relationship exists. This is not automatically wrong.

However, entity relationship dependency and service dependency are different decisions.

A module should avoid depending on another module's service unless it needs a real cross-domain use-case.

<a id="crud-protocol"></a>

## CRUD Protocol

When a feature module represents a manageable resource, its CRUD lifecycle is required by default.

The common CRUD operations are:

- create;
- list;
- detail;
- update;
- delete.

Create, list, detail, update, and delete must be designed together unless the resource has an explicit business reason that makes one operation invalid.

CRUD does not mean every operation is public, user-facing, or placed in the same controller. Each operation should be classified and protected according to its access model.

CRUD operations may be classified as:

- public read operations;
- authenticated user-owned operations;
- admin/internal management operations;
- business-restricted operations.

Business-restricted operations must still be documented.

Delete means hard-delete by default.

Inactive, disabled, archived, or similar state changes are not delete operations. They should be modeled as explicit update/PATCH operations such as `PATCH /resource/:id/status`, `PATCH /resource/:id/activate`, or `PATCH /resource/:id/deactivate`.

When hard-delete would violate business rules, the delete operation should return a clear business error instead of silently becoming an inactivate/disable operation.

For each supported operation, decide:

- access level;
- ownership or scope rules;
- request DTOs;
- response classes;
- repository/data-access method;
- pagination, search, filtering, or sorting needs;
- whether hard-delete is allowed or should return a business error;
- which separate PATCH operations are needed for active, inactive, disabled, or archived state changes.

CRUD design must respect the other architecture protocols:

- controllers still only receive and delegate;
- services still own business decisions;
- repositories still own data access;
- DTOs still model requests;
- Response classes still model outputs;
- ownership and security rules still apply.

CRUD is not a license to expose unsafe endpoints. It is a simple way to think through the resource lifecycle before implementation.

<a id="repository-protocol"></a>

## Repository Protocol

Repository classes are useful when data access grows beyond trivial CRUD.

Use a feature repository when queries involve:

- pagination;
- search;
- filtering;
- relation loading;
- ownership filtering;
- aggregate calculations;
- transactional data loading;
- repeated query logic.

Simple one-off operations may use injected TypeORM repositories directly, but once query logic becomes reusable or expressive, move it into a repository class.

Repository method names should describe intent:

- `findById`
- `findBySlug`
- `findByUserId`
- `findActiveByUserId`
- `findDetailBySlug`
- `findOwnedResource`

Avoid repository methods that expose implementation details in their names.

<a id="ownership-data-access-protocol"></a>

## Ownership and Data Access Protocol

Ownership must be enforced at the service/repository boundary.

Wrong approach:

- find a resource only by id;
- update or delete it without verifying owner.

Correct approach:

- use authenticated user context;
- query by both resource id and owner id when the resource belongs to a user;
- return not found or forbidden when ownership does not match.

Ownership-sensitive operations must not trust user id from request body.

Current user identity should come from authentication context.

<a id="validation-error-protocol"></a>

## Validation and Error Protocol

DTO validation is the first input boundary.

Global validation should:

- reject unknown fields;
- transform primitive values when safe;
- enforce DTO decorators;
- prevent accidental data injection.

Errors should be consistent.

Typical error categories:

- validation error;
- unauthorized;
- forbidden;
- not found;
- conflict;
- database constraint violation;
- unexpected server error.

Database constraint errors should be converted into meaningful API errors where possible.

<a id="admin-internal-endpoint-protocol"></a>

## Admin and Internal Endpoint Protocol

Admin or internal endpoints must be treated as sensitive.

During development, temporary public admin endpoints may exist only as a short-term data entry aid.

Permanent admin endpoints must be protected by a role or permission guard. A derived `isAdmin` flag may be used as a convenience only when it comes from the authorization summary.

Temporary endpoints should be clearly marked and removed or secured before production.

Admin endpoints should not bypass validation, response mapping, RBAC checks, or ownership rules.

Admin and public controllers may be separated when it keeps access rules clear. For example, public read use-cases and admin management use-cases should not be forced into the same controller when their security models are different.

<a id="documentation-protocol"></a>

## Documentation Protocol

Documentation is part of architecture.

Each document has one responsibility.

Architecture documents should not become endpoint catalogs.

API contract documents should not become architecture essays.

Entity documents should not become service implementation guides.

Module pattern documents may use concrete examples but should explain the pattern rather than create hidden standards.

Markdown links must follow `markdown-link-protocol.md`.

For VS Code compatibility:

- the documentation index links to documents;
- each document has its own Contents section;
- each document uses same-file stable anchors for section navigation.

<a id="development-flow-protocol"></a>

## Development Flow Protocol

Recommended backend development flow:

1. Update architecture or protocol if the decision changes the way the project is built.
2. Update API contract if the HTTP surface changes.
3. Update entity relation documentation if the data model changes.
4. Update RBAC documentation if roles, permissions, guards, or authorization-summary behavior changes.
5. Update module pattern documentation if a new reusable design pattern emerges.
6. Implement code after documentation intent is clear.
7. Test public, protected, ownership-sensitive, and RBAC-protected flows.
8. Stabilize naming, response classes, and repository boundaries.

The goal is not to document everything before coding. The goal is to keep architecture, contract, model, and implementation aligned.
