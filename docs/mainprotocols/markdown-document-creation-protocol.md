# Markdown Document Creation Protocol

Last updated: 2026-07-12 22:20:14

<a id="purpose"></a>

## Purpose

This document defines the generic protocol for creating and maintaining Markdown documentation in this project.

It is not a source-code link protocol. Link formatting rules belong to [markdown-link-protocol.md](./markdown-link-protocol.md).

This document answers:

- how a Markdown document should be structured;
- when a document should include a `Last updated` timestamp;
- when a document should have a `Contents` section;
- how stable anchors should be used;
- how document boundaries should be protected;
- how documentation should be updated without becoming messy;
- how VS Code-friendly navigation should be maintained.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Document Responsibility](#document-responsibility)
- [Required Document Structure](#required-document-structure)
- [Contents Section Protocol](#contents-section-protocol)
- [Stable Anchor Protocol](#stable-anchor-protocol)
- [Heading Protocol](#heading-protocol)
- [Document Boundary Protocol](#document-boundary-protocol)
- [Examples and Case Studies](#examples-and-case-studies)
- [VS Code Navigation Protocol](#vscode-navigation-protocol)
- [Update Protocol](#update-protocol)
- [When to Create a New Document](#when-to-create-a-new-document)
- [Review Checklist](#review-checklist)

<a id="document-responsibility"></a>

## Document Responsibility

Every Markdown document must have one clear responsibility.

Before writing or updating a document, define what the document owns.

Examples:

| Document type            | Owns                                                    |
| ------------------------ | ------------------------------------------------------- |
| Architecture guide       | principles, protocols, decision rules                   |
| API contract             | endpoints, request examples, response examples          |
| Entity relation document | entity list, relationship map                           |
| Module pattern guide     | examples, case studies, reusable patterns               |
| Link protocol            | file links, source-code links, documentation link rules |

A document should not become a dumping ground for every related idea.

If a topic belongs to another document, link to that document instead of duplicating the content.

<a id="required-document-structure"></a>

## Required Document Structure

A major Markdown document should use this structure:

```md
# Document Title

Last updated: YYYY-MM-DD HH:MM:SS

<a id="purpose"></a>

## Purpose

Short explanation of what this document owns.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Main Section](#main-section)

<a id="main-section"></a>

## Main Section

Document content...
```

The recommended order is:

1. title;
2. `Last updated` line in `YYYY-MM-DD HH:MM:SS` local-time format;
3. stable `purpose` anchor;
4. `Purpose` section;
5. stable `contents` anchor;
6. `Contents` section;
7. main sections;
8. maintenance/checklist section when useful.

Small short notes may skip `Contents`, but long or reusable documents must include it.

Every maintained Markdown document should include a `Last updated` line near the top, directly under the title.

Use this exact format:

```md
Last updated: 2026-07-09 19:49:52
```

The goal is simple maintenance visibility.

- Use local timestamp format: `YYYY-MM-DD HH:MM:SS`.
- Update the timestamp whenever the document is meaningfully changed.
- Keep it directly under the `#` title line.
- Do not hide it in a footer or metadata block.

<a id="contents-section-protocol"></a>

## Contents Section Protocol

Every major documentation file should include a short `Contents` section near the top.

The `Contents` section should:

- use same-file anchor links;
- list only major sections;
- avoid excessive nesting;
- stay readable in VS Code;
- be updated whenever major sections change.

Good:

```md
## Contents

- [Purpose](#purpose)
- [Security Protocol](#security-protocol)
- [Repository Protocol](#repository-protocol)
```

Avoid:

```md
## Contents

- [Every tiny subsection](#every-tiny-subsection)
- [Every code example](#every-code-example)
- [Every paragraph-level heading](#every-paragraph-level-heading)
```

The goal is navigation, not visual clutter.

Markdown documentation is not written to look impressive.
It is written to provide the shortest mental path to the correct architectural information.

<a id="stable-anchor-protocol"></a>

## Stable Anchor Protocol

Every section referenced by `Contents` must have a stable anchor immediately before the heading.

Use this format:

```md
<a id="security-protocol"></a>

## Security Protocol
```

Then link to it like this:

```md
[Security Protocol](#security-protocol)
```

Stable anchors should be:

- lowercase;
- kebab-case;
- short;
- descriptive;
- stable over time.

Good anchor names:

```text
purpose
contents
security-protocol
repository-protocol
crud-completion-protocol
relationship-map
```

Bad anchor names:

```text
section-1
new-section
important
updated-part
temporary-note
```

Do not change an anchor id unless all incoming links are updated.

<a id="heading-protocol"></a>

## Heading Protocol

Use headings to communicate document structure clearly.

Recommended heading rules:

- `#` is used only for the document title.
- `##` is used for main sections.
- `###` is used for subsections.
- Avoid going deeper than `###` unless absolutely necessary.
- Keep headings short and stable.
- Do not use headings as decoration.

Good:

```md
## Request / Response Protocol

### DTO Rules

### Response Class Rules
```

Avoid:

```md
####### Tiny detail

## IMPORTANT!!!

## New stuff we added today
```

Headings should describe durable concepts, not temporary work notes.

<a id="document-boundary-protocol"></a>

## Document Boundary Protocol

A document should protect its own scope.

When adding content, ask:

1. Does this belong to this document?
2. Is this principle, contract, schema, example, or implementation detail?
3. Is another document the better home?
4. Should this be a link instead of duplicated text?

Examples:

- Architecture principles belong in architecture documentation.
- Endpoint details belong in API contract documentation.
- Entity relationships belong in entity documentation.
- Case studies belong in module pattern documentation.
- Link rules belong in [markdown-link-protocol.md](./markdown-link-protocol.md).

Do not explain abandoned decisions unless the document is explicitly historical.

Current documentation should describe the current standard cleanly.

<a id="examples-and-case-studies"></a>

## Examples and Case Studies

Examples are allowed when they clarify a principle.

However, examples should not turn a generic protocol document into a domain-specific document.

Good use of examples:

- showing how a response class is named;
- showing how a `Contents` section is structured;
- showing when a repository is justified;
- showing a master-detail pattern in a case-study document.

Avoid:

- listing every endpoint in the architecture guide;
- listing every entity in the module pattern guide;
- embedding implementation code into a protocol document when a short structural example is enough.

If an example grows large, move it into a dedicated case-study or pattern document.

<a id="vscode-navigation-protocol"></a>

## VS Code Navigation Protocol

Documentation should be friendly to VS Code.

Observed behavior:

- VS Code opens linked Markdown files reliably.
- Cross-file section jumps may open the target file at the top.
- Same-file anchor links are more reliable.

Therefore:

1. A top-level index should link to documents only.
2. Each major document should include its own `Contents` section.
3. The `Contents` section should use same-file stable anchor links.
4. Do not rely on cross-file section links as the primary navigation method.
5. Do not use documentation line links for navigation.

Recommended flow:

```text
backend-docs-index.md
  opens the document

target document
  uses its own Contents section for section navigation
```

<a id="update-protocol"></a>

## Update Protocol

When updating a Markdown document:

1. Identify the document's responsibility.
2. Update the `Last updated` date.
3. Add or update content in the correct section.
4. Add a new stable anchor if a new major section is introduced.
5. Update the `Contents` section.
6. Check that same-file links still match anchor ids.
7. Avoid cross-file section links unless there is a strong reason.
8. Keep the document current; remove obsolete or misleading text.
9. If the change affects another documentation role, update that document too.

Example:

If a new backend architecture rule is added:

- update `architectureguide.md`;
- add a stable anchor;
- add it to `Contents`;
- update related pattern docs only if an example is needed.

<a id="when-to-create-a-new-document"></a>

## When to Create a New Document

Create a new Markdown document when:

- the topic has a different responsibility from existing documents;
- the topic is large enough to make an existing document noisy;
- the content is reusable across multiple features;
- the content is a case study or implementation pattern;
- the content changes at a different pace than the parent document.

Do not create a new document for every small note.

A good new document has:

- clear purpose;
- clear owner topic;
- stable sections;
- a short `Contents` section;
- links to related documents when needed.

<a id="review-checklist"></a>

## Review Checklist

Before accepting a Markdown document, check:

- Does the document have one clear responsibility?
- Does it include a `Last updated: YYYY-MM-DD HH:MM:SS` line under the title?
- Does it start with a clear `Purpose` section?
- Does it need a `Contents` section?
- Are stable anchors present before main headings?
- Do `Contents` links point to same-file anchors?
- Are headings stable and descriptive?
- Is obsolete history avoided?
- Are examples placed in the right document?
- Are cross-document links file-level where possible?
- Is VS Code navigation considered?
- Does the document follow [markdown-link-protocol.md](./markdown-link-protocol.md)?
