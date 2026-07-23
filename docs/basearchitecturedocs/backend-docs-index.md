# Backend Documentation Index

<a id="purpose"></a>

## Purpose

This document is the high-level documentation map for the backend project.

It links to document-level references only. Each document owns its own same-file Contents section and stable anchors.

<a id="documents"></a>

## Documents

- [Backend Architecture Guide](./architectureguide.md)
  - Defines the main backend architecture rules, layer responsibilities, request/response principles, security defaults, and development decision protocol.
  - [Architecture Review 2026-06-09](./architecture-review-2026-06-09.md)
    - Records the current architecture snapshot, strengths, gaps, and next priorities as of 2026-06-09.

- [NestJS API Contract](./nestjs-api-contract.md)
  - Defines the customer-facing REST API surface with endpoint paths, request examples, response examples, error shapes, and recommended build order.

- [NestJS Entities And Relations](./nestjs-entities-and-relations.md)
  - Defines the backend entity model, entity responsibilities, important properties, relationship map, and the current phase-1 order plus inventory structure.

- [Backend Module Patterns](./backend-module-patterns.md)
  - Shows practical module design examples and reusable patterns for DTO/response separation, repositories, master-detail flows, tree data, and module boundaries.

- [RBAC Module Guide](./rbac-module-guide.md)
  - Defines the RBAC module design, role/permission model, guard/decorator flow, service responsibilities, validation rules, seeding strategy, and implementation order.

- [RBAC API Contract](./rbac-api-contract.md)
  - Defines admin RBAC endpoint contracts for roles, permissions, role-permission assignments, user-role assignments, and access summaries.

- [RBAC Role Permission Matrix](./rbac-role-permission-matrix.md)
  - Defines project roles, permission groups, endpoint access expectations, denied operations, ownership boundaries, and role-based testing expectations.

- [Seed Data Guide](./seed-data-guide.md)
  - Defines seed data categories, current startup flow, production safety rules, module seed structure, idempotency expectations, operational bootstrap boundaries, and the current demo order/inventory seed posture.
  - [Seed Flow Detail](./seed-flow-deatil.md)
    - Explains automatic startup seed, seed execution policy, current seed order, and manual super admin bootstrap flow.

- [Postman JSON Generation Protocol](./postman-json-generation-protocol.md)
  - Defines how to generate importable Postman collections and zip bundles for API, CRUD, auth, admin, RBAC, and regression testing workflows.

- [Postman Run Order Guide](./postman-run-order-guide.md)
  - Defines the recommended Postman/Newman collection execution order, shared environment usage, runtime export flow, reset/rerun steps, and collection dependency notes.

- [Postman Methods Summary](./postman-methods-summary.md)
  - Summarizes what each Postman collection is for, which endpoint method groups it contains, and which collections are most useful for manual operations versus regression testing.
