# Markdown Link Protocol

<a id="purpose"></a>

## Purpose

This document defines the repository-wide linking standard for Markdown files.

The project uses two different link strategies:

1. source code links;
2. documentation links.

Because the main editor is VS Code, documentation navigation must avoid relying on cross-file section jumps.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Core Principles](#core-principles)
- [Root Paths](#root-paths)
- [Source Code Links](#source-code-links)
- [Documentation Links](#documentation-links)
- [Stable Anchors](#stable-anchors)
- [VS Code Navigation Rule](#vscode-navigation-rule)
- [Index Document Rule](#index-document-rule)
- [Do and Don't](#do-and-dont)
- [Summary](#summary)

<a id="core-principles"></a>

## Core Principles

Markdown links should be:

- stable;
- readable;
- workspace-friendly;
- safe against future edits;
- consistent across documentation.

Do not use local machine paths, container paths, or temporary runtime paths.

<a id="root-paths"></a>

## Root Paths

Use these root paths:

| Target type         | Root path |
| ------------------- | --------- |
| Source code files   | `/src`    |
| Documentation files | `/docs`   |

<a id="source-code-links"></a>

## Source Code Links

Source code links may point to a file or a specific line.

Use `/src` as the root path.

File link:

```md
[ProductsService](/src/modules/products/products.service.ts)
```

Line link:

```md
[ProductsService line 42](/src/modules/products/products.service.ts#L42)
```

Source code line links are allowed because implementation notes and bug reports may need exact line references.

Do not use:

```md
[ProductsService](./src/modules/products/products.service.ts)
[ProductsService](../src/modules/products/products.service.ts)
[ProductsService](/src/modules/products/products.service.ts:42)
[ProductsService](/app/files/bazar-api/src/modules/products/products.service.ts)
```

<a id="documentation-links"></a>

## Documentation Links

Documentation links should usually point to whole documents.

Use `/docs` as the root path.

Document link:

```md
[Architecture Guide](/docs/architectureguide.md)
```

Avoid cross-file section links as the main navigation method in VS Code:

```md
[Security Protocol](/docs/architectureguide.md#security-protocol)
```

This may open the correct file but still position the preview at the top.

For section navigation, each document must provide its own `Contents` section with same-file links.

<a id="stable-anchors"></a>

## Stable Anchors

Every main section that appears in a document's own `Contents` section should have a stable anchor.

Use this format:

```md
<a id="security-protocol"></a>

## Security Protocol
```

Then same-file Contents should link like this:

```md
[Security Protocol](#security-protocol)
```

Stable anchors should be:

- lowercase;
- kebab-case;
- short;
- descriptive;
- treated as permanent identifiers.

<a id="vscode-navigation-rule"></a>

## VS Code Navigation Rule

VS Code reliably opens linked Markdown files, but cross-file section scrolling may not work consistently.

Therefore:

- `backend-docs-index.md` links to documents only;
- each document contains its own `Contents` section;
- section navigation happens inside the same document;
- same-file links use stable anchors.

Recommended flow:

1. open a document from the index;
2. use that document's `Contents`;
3. navigate inside the same file.

<a id="index-document-rule"></a>

## Index Document Rule

The documentation index should link to documents only.

Good:

```md
[Architecture Guide](/docs/architectureguide.md)
[API Contract](/docs/nestjs-api-contract.md)
```

Avoid in the index:

```md
[Security Protocol](/docs/architectureguide.md#security-protocol)
[Products API](/docs/nestjs-api-contract.md#products-api)
```

<a id="do-and-dont"></a>

## Do and Don't

### Do

```md
[Architecture Guide](/docs/architectureguide.md)
[ProductsService](/src/modules/products/products.service.ts)
[ProductsService line 42](/src/modules/products/products.service.ts#L42)
[Security Protocol](#security-protocol)
```

### Don't

```md
[Architecture Guide](./architectureguide.md)
[Security Protocol](/docs/architectureguide.md#L42)
[ProductsService](../src/modules/products/products.service.ts)
[ProductsService](/src/modules/products/products.service.ts:42)
[Runtime Path](/app/files/bazar-api/src/main.ts)
```

<a id="summary"></a>

## Summary

Use:

```md
/src/...#LN
```

for source code line references.

Use:

```md
/docs/file.md
```

for documentation file navigation.

Use:

```md
#stable-anchor
```

for same-file section navigation.

Avoid documentation line references and avoid relying on cross-file section scrolling in VS Code.
