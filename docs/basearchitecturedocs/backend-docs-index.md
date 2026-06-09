# Backend Documentation Index

<a id="purpose"></a>

## Purpose

This document is the high-level documentation map for the backend project.

It links to document-level references only. Each document owns its own same-file Contents section and stable anchors.

<a id="documents"></a>

## Documents

- [Backend Architecture Guide](./architectureguide.md)
  - Defines the main backend architecture rules, layer responsibilities, request/response principles, security defaults, and development decision protocol.

- [NestJS API Contract](./nestjs-api-contract.md)
  - Defines the customer-facing REST API surface with endpoint paths, request examples, response examples, error shapes, and recommended build order.

- [NestJS Entities And Relations](./nestjs-entities-and-relations.md)
  - Defines the backend entity model, entity responsibilities, important properties, relationship map, and minimal phase-1 data model.

- [Backend Module Patterns](./backend-module-patterns.md)
  - Shows practical module design examples and reusable patterns for DTO/response separation, repositories, master-detail flows, tree data, and module boundaries.

- [RBAC Module Guide](./rbac-module-guide.md)
  - Defines the RBAC module design, role/permission model, guard/decorator flow, service responsibilities, validation rules, seeding strategy, and implementation order.

- [RBAC API Contract](./rbac-api-contract.md)
  - Defines admin RBAC endpoint contracts for roles, permissions, role-permission assignments, user-role assignments, and access summaries.

- [RBAC Role Permission Matrix](./rbac-role-permission-matrix.md)
  - Defines project roles, permission groups, endpoint access expectations, denied operations, ownership boundaries, and role-based testing expectations.

- [Postman JSON Generation Protocol](./postman-json-generation-protocol.md)
  - Defines how to generate importable Postman collections and zip bundles for API, CRUD, auth, admin, RBAC, and regression testing workflows.

- [Code Update Prompt Preparation Protocol](./code-update-prompt-preparation-protocol.md)
  - Defines how to prepare short, focused Codex prompt markdown files for scoped code updates based on the canonical backend documents.

- [Markdown Document Creation Protocol](./markdown-document-creation-protocol.md)
  - Defines how project Markdown documents should be structured, anchored, maintained, and kept within clear responsibility boundaries.

- [Markdown Link Protocol](./markdown-link-protocol.md)
  - Defines repository-wide Markdown link rules for source-code links, documentation links, stable anchors, and VS Code-friendly navigation.
