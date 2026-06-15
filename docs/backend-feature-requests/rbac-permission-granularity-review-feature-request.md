# RBAC Permission Granularity Review Feature Request

## Current State

The current RBAC model already supports meaningful admin access control and existing RBAC-oriented tests are passing. Broad permissions such as product read/update style capabilities are acceptable for the current project stage while the admin surface is still evolving.

## Missing Point

We do not yet have a future-facing authorization design review for whether some admin capabilities should eventually be split into more granular submodule-level permissions as the backend grows. Examples that may later be worth reviewing include concepts such as:

- `catalog.product.media.read`
- `catalog.product.media.create`
- `catalog.product.media.update`
- `catalog.product.media.delete`
- `catalog.product.relation.read`
- `catalog.product.relation.create`
- `catalog.product.relation.update`
- `catalog.product.relation.delete`
- `catalog.product.review.read`
- `catalog.product.review.moderate`
- `inventory.read`
- `inventory.adjust`
- `inventory.reserve`
- `inventory.release`

These are only example permission concepts for future review, not a claim that these exact names must be implemented.

## Why It Is Not Blocking

Current RBAC tests pass, and current broad permissions are acceptable while the admin surface is still maturing. This should not be treated as a present defect. It is a future hardening and authorization design review item.

## Why It Matters Later

As more admin submodules, workflows, and operational roles are introduced, permission granularity may matter more for:

- clearer authorization boundaries
- easier auditing
- safer delegation of admin roles
- less coupling between broad product permissions and submodule operations
- better long-term maintainability as admin modules grow

## Suggested Scope

A future review can evaluate whether selected admin capabilities should remain broad or be split by submodule and operation type. Likely review areas include product media, product relations, product reviews, inventory operations, and other admin areas that may later require narrower delegation or more explicit audit boundaries.

The goal should be a project-wide authorization design review rather than an immediate refactor of current RBAC behavior.

## Status

Future Feature Request
