# Backend Feature Requests Index

## Authentication and Session

- [JWT Session Tracking](./jwt-session-tracking-feature-request.md)  
  Tracks the missing backend-side JWT session/session-id structure for future logout, revoke, audit, and device/session management needs.  
  Status: Future Feature Request

- [JWT Payload Cleanup](./jwt-payload-cleanup-feature-request.md)  
  Tracks the future cleanup of JWT claims so tokens stay identity-focused and do not become a user profile or authorization summary.  
  Status: Future Feature Request

- [Rate Limit and Brute Force Protection](./rate-limit-brute-force-protection-feature-request.md)  
  Tracks missing request throttling and login brute-force protection for authentication and other sensitive endpoints.  
  Status: Future Feature Request

## Authorization and Access Control

- [RBAC Permission Granularity Review](./rbac-permission-granularity-review-feature-request.md)  
  Tracks the need for a future authorization design review to determine whether broad admin permissions should eventually be split into more granular submodule-level permissions for safer delegation, clearer auditing, and cleaner authorization boundaries.  
  Status: Future Feature Request

- [09 Auth Boundary Cross Module Tests](./09-auth-boundary-cross-module-tests-feature-request.md)  
  Tracks the planned first cross-module Postman/Newman auth boundary guardrail suite so evidence-backed no-auth, wrong-role, and correct-role behavior can later be verified safely across the accepted regression modules.  
  Status: Future Feature Request / Design Captured

- [11 Ownership Isolation Cross Module Tests](./11-ownership-isolation-cross-module-tests-feature-request.md)  
  Tracks the planned first cross-module Postman/Newman ownership-isolation guardrail suite so Customer A vs Customer B access, update, delete, and admin-visibility behavior can later be verified safely across user-owned resource flows.  
  Status: Future Feature Request / Design Captured

## API Security Hardening

- [Response Data Exposure Audit](./response-data-exposure-audit-feature-request.md)  
  Tracks a future audit to ensure sensitive fields are never returned accidentally from entities, services, or response models.  
  Status: Future Feature Request

- [Error Response Hardening](./error-response-hardening-feature-request.md)  
  Tracks a future global error response policy for safe, consistent, production-friendly API errors.  
  Status: Future Feature Request

- [HTTP Hardening](./http-hardening-feature-request.md)  
  Tracks future HTTP-level security hardening such as Helmet, CORS policy review, and production-safe headers.  
  Status: Future Feature Request

## API Contract and Protocol

- [API Contract and Protocol Compliance Audit](./api-contract-protocol-compliance-audit-feature-request.md)  
  Tracks the need for a future systematic audit of API contract consistency, HTTP semantics, response schemas, error formats, headers, pagination, security headers, CORS, and transaction consistency.  
  Status: Future Feature Request

- [12 State Consistency Cross Module Tests](./12-state-consistency-cross-module-tests-api-contract-and-protocol-compliance-audit.md)  
  Tracks the planned cross-module Postman/Newman audit suite for response envelopes, status codes, route and pagination contracts, read-after-write behavior, delete/inactive visibility semantics, and runtime cleanup hygiene across modules.  
  Status: Future Feature Request / Design Captured

- [Admin Validation and Error Behavior Standardization](./admin-validation-and-error-behavior-standardization-feature-request.md)  
  Tracks the need for a future project-wide standardization of admin API validation and error behavior, including missing fields, invalid values, invalid identifiers, non-existing resources, update/delete edge cases, and consistent 400/404/error response semantics.  
  Status: Future Feature Request

- [10 Negative Validation Cross Module Tests](./10-negative-validation-cross-module-tests-feature-request.md)  
  Tracks the planned first cross-module Postman/Newman negative-validation guardrail suite so evidence-backed not-found, conflict, and carefully scoped invalid-input behaviors can later be verified safely across the accepted regression modules.  
  Status: Future Feature Request / Design Captured

## Multi-Tenant and Company Context

- [Tenant Company Context](./tenant-company-context-feature-request.md)  
  Tracks the missing tenant/company context model for future marketplace, multi-store, seller, or company-scoped data access needs.  
  Status: Future Feature Request

## Seed and Demo Data

- [Cart Demo Seed](./cart-demo-seed-feature-request.md)  
  Tracks the future demo cart seed for the demo customer after the current seed baseline is complete.  
  Status: Future Feature Request

- [Orders Demo Seed](./orders-demo-seed-feature-request.md)  
  Tracks future demo order seed data after the orders module and order lifecycle are finalized.  
  Status: Future Feature Request

- [Checkout Seed Review](./checkout-seed-review-feature-request.md)  
  Tracks a future review of whether checkout needs dedicated seed data or only depends on existing reference and demo records.  
  Status: Future Feature Request
