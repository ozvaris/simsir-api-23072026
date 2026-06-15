# Code Update Prompt Preparation Protocol V2

<a id="purpose"></a>

## Purpose

This document defines how to prepare short, focused Codex prompt markdown files for code updates in an existing project.

The goal is to keep Codex prompts:

- small;
- clear;
- scoped;
- based on the canonical project documents;
- focused on the requested code change only.

This protocol does not define application behaviour itself. It defines how to write a prompt that asks Codex to update application code.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [When To Use This Protocol](#when-to-use-this-protocol)
- [Core Principle](#core-principle)
- [Canonical Documents](#canonical-documents)
- [Prompt Preparation Steps](#prompt-preparation-steps)
- [Recommended Prompt Shape](#recommended-prompt-shape)
- [Scope Control Rules](#scope-control-rules)
- [Result Report Expectations](#result-report-expectations)
- [Good Example](#good-example)
- [Anti-Patterns](#anti-patterns)
- [Summary](#summary)

<a id="when-to-use-this-protocol"></a>

## When To Use This Protocol

Use this protocol when preparing a markdown prompt for Codex to update existing code.

Typical cases:

- change an existing endpoint behaviour;
- adjust service logic;
- change repository query intent;
- split or move module responsibilities;
- add a missing narrow endpoint;
- align implementation with existing architecture documents;
- fix a scoped bug in one module.

Do not use this protocol for broad architecture redesigns. For large changes, split the work into smaller module-level prompts.

<a id="core-principle"></a>

## Core Principle

A code update prompt should describe the delta.

It should not repeat the whole architecture.

The canonical architecture documents already define project rules. The prompt should reference those documents and then state the specific change.

Good prompt style:

```txt
Read the canonical docs.
Update this module behaviour.
Do not change unrelated modules.
Report what changed.
```

Bad prompt style:

```txt
Rewrite the whole architecture inside the prompt.
Mention every possible edge case.
Ask for unrelated improvements.
Mix multiple modules in one update.
```

<a id="canonical-documents"></a>

## Canonical Documents

A code update prompt should refer to the canonical project documents when relevant.

Current canonical location:

```txt
docs/basearchitecturedocs/
```

Common references:

```txt
docs/basearchitecturedocs/architectureguide.md
docs/basearchitecturedocs/nestjs-api-contract.md
docs/basearchitecturedocs/nestjs-entities-and-relations.md
docs/basearchitecturedocs/backend-module-patterns.md
docs/basearchitecturedocs/rbac-module-guide.md
docs/basearchitecturedocs/rbac-api-contract.md
docs/basearchitecturedocs/rbac-role-permission-matrix.md
```

Only include documents that are relevant to the requested change.

<a id="prompt-preparation-steps"></a>

## Prompt Preparation Steps

Before writing the prompt, clarify these points:

1. What module is being changed?
2. What exact behaviour is changing?
3. Which endpoint, service, repository, DTO, response, or mapper is affected?
4. What must stay unchanged?
5. Which modules are out of scope?
6. Are permissions changing or staying the same?
7. Are table names or entity relations changing or staying the same?
8. What should Codex report after implementation?

If these questions cannot be answered, the prompt is probably too early or too broad.

<a id="recommended-prompt-shape"></a>

## Recommended Prompt Shape

A good code update prompt should usually have this shape:

```md
# <Short Task Name>

## Goal

Explain the requested change in one or two sentences.

## Read First

List only the relevant canonical docs and source files.

## Required Change

State the exact code behaviour update.

## Keep Unchanged

List behaviour, paths, permissions, table names, or module boundaries that must not change.

## Out of Scope

List related work that must not be done in this prompt.

## Implementation Notes

Add only necessary implementation guidance.

## Required Result Report

Ask Codex to summarize changed files, behaviour changes, checks run, and deferred items.
```

<a id="scope-control-rules"></a>

## Scope Control Rules

A code update prompt should stay narrow.

Prefer:

```txt
Update Category delete/status behaviour.
```

Avoid:

```txt
Update all delete/status behaviour across Category, Product, User, Orders, RBAC, and checkout references.
```

Use one module or one closely related subdomain group per prompt.

A prompt should explicitly say what not to change.

Examples:

```txt
Do not change Product delete behaviour.
Do not change User delete behaviour.
Do not create new permissions.
Do not rename tables.
Do not change endpoint paths unless explicitly requested.
```

<a id="result-report-expectations"></a>

## Result Report Expectations

Every code update prompt should ask Codex for a short result report.

The report should include:

- files changed;
- behaviour changed;
- endpoints affected;
- permissions affected or confirmed unchanged;
- database/table/entity impact;
- commands run;
- build/lint/check results;
- intentionally deferred items.

The report should not be a long essay. It should be enough for review.

<a id="good-example"></a>

## Good Example

Example task: update Category delete/status behaviour.

```md
# Category Delete / Status Update

## Goal

Update Category delete/status behaviour according to the canonical architecture docs.

DELETE should attempt hard delete. PATCH should handle active/inactive status changes.

## Read First

- docs/basearchitecturedocs/architectureguide.md
- docs/basearchitecturedocs/nestjs-api-contract.md
- docs/basearchitecturedocs/nestjs-entities-and-relations.md

Relevant source files:

- src/modules/categories/
- src/modules/products/

## Required Change

Update `DELETE /api/admin/categories/:categoryId`:

1. Check whether the category exists.
2. Check child category count.
3. Check product count.
4. Child/product checks must include both active and inactive records.
5. If any child category exists, return `409 Conflict`.
6. If any product exists, return `409 Conflict`.
7. If no blocking relation exists, hard delete the category.
8. If an unexpected FK conflict occurs, convert it to `409 Conflict`.

Update/keep `PATCH /api/admin/categories/:categoryId`:

- `status: active` and `status: inactive` updates should remain supported.

## Keep Unchanged

- Public category endpoints should continue showing only active categories.
- Admin list/detail behaviour should remain unchanged.
- Existing permissions should remain unchanged.
- Endpoint paths should remain unchanged.

## Out of Scope

- Do not update Product delete behaviour.
- Do not update User delete behaviour.
- Do not update checkout reference delete behaviour.
- Do not create new permissions.
- Do not rename tables.

## Implementation Notes

Repository should expose explicit count/check methods for child categories and products. Do not load full child/product relations only to count blocking records.

## Required Result Report

Report:

- changed files;
- final delete/status behaviour;
- permission changes, if any;
- commands run;
- build/lint/check result;
- intentionally deferred items.
```

<a id="anti-patterns"></a>

## Anti-Patterns

Avoid these prompt patterns:

### Repeating the whole architecture

Do not paste long architecture explanations into every prompt. Reference the canonical docs instead.

### Combining unrelated modules

Do not combine Category, Product, User, RBAC, and Orders in one prompt unless the change is intentionally cross-cutting.

### Asking for hidden extra improvements

Do not add vague instructions like:

```txt
Also improve anything you notice.
```

### Leaving scope unclear

Do not say:

```txt
Fix delete behaviour.
```

Say exactly which module and endpoint should change.

### Over-explaining unlikely risks

Do not add speculative edge cases unless they are directly relevant to the requested change.

<a id="summary"></a>

## Summary

A code update prompt should be:

- short;
- scoped;
- based on canonical docs;
- explicit about the required change;
- explicit about what must not change;
- clear about the expected result report.

The prompt should help Codex update code without turning a small change into a broad refactor.
