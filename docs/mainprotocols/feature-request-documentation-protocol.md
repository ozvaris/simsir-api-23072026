# Feature Request Documentation Protocol

## Purpose

Use this protocol for non-blocking backend feature requests that should be remembered for future planning but are not ready for immediate implementation.

## Feature Request Location

Future backend feature requests must be stored under:

```txt
docs/backend-feature-requests/
```

This folder must contain its own index file:

```txt
docs/backend-feature-requests/backend-feature-requests-index.md
```

## File Naming

Each feature request must have its own markdown file.

Use kebab-case and end the file name with:

```txt
-feature-request.md
```

Example:

```txt
jwt-session-tracking-feature-request.md
```

## Feature Request File Format

Each feature request file should use this short format:

```md
# <Feature Name> Feature Request

## Current State

Describe the current system behavior.

## Missing Point

Describe what is missing.

## Why It Is Not Blocking

Explain why the project can continue without this for now.

## Why It Matters Later

Explain what problems this may cause or what future improvements it enables.

## Status

Future Feature Request
```

## Feature Requests Index Rule

Every feature request must be added to:

```txt
docs/backend-feature-requests/backend-feature-requests-index.md
```

Index format:

```md
## Feature Requests Index Rule

Every feature request must be added to:

```txt
docs/backend-feature-requests/backend-feature-requests-index.md
```

The index should use a simple document list format, not a table.

Example:

```md
# Backend Feature Requests Index

## Authentication and Session

- [JWT Session Tracking](./jwt-session-tracking-feature-request.md)  
  Tracks the missing backend-side JWT session/session-id structure for future logout, revoke, audit, and device/session management needs.  
  Status: Future Feature Request
```

Keep each item short:

* one link line
* one short explanation
* one status line

Do not include full feature details in the index. Full details must stay inside the individual feature request file.
```

## Documentation Boundary

Backend architecture documents and future feature request documents must stay separate.

Backend architecture documents belong under:

```txt
docs/basearchitecturedocs/
```

Future backend feature requests belong under:

```txt
docs/backend-feature-requests/
```

Do not add every feature request to the backend architecture docs index.

## Implementation Rule

A feature request is not an implementation prompt.

When a feature is ready to be implemented, prepare a separate code update prompt using the existing code update prompt preparation protocol.
