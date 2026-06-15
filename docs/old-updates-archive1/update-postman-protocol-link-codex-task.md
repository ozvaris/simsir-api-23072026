# Codex Task: Update Postman Protocol Link In Backend Docs Index

## Goal

Update only the outdated Postman protocol reference in the backend documentation index.

The current backend documentation index still links to:

```md
[Postman Import Zip Protocol](./postman-import-zip-protocol.md)
```

This should be replaced with the current canonical Postman protocol document:

```md
[Postman JSON Generation Protocol](./postman-json-generation-protocol.md)
```

## Scope

Modify only this file:

```txt
docs/basearchitecturedocs/backend-docs-index.md
```

## Required Change

In `docs/basearchitecturedocs/backend-docs-index.md`, replace:

```md
- [Postman Import Zip Protocol](./postman-import-zip-protocol.md)
```

with:

```md
- [Postman JSON Generation Protocol](./postman-json-generation-protocol.md)
```

## Constraints

- Do not modify any other documentation files.
- Do not rename files.
- Do not create a new Postman protocol file.
- Do not change architecture wording.
- Do not normalize unrelated links.
- Do not reformat the whole document.
- Keep the update minimal and targeted.

## Verification

After the change, verify:

1. `backend-docs-index.md` no longer references:

```txt
postman-import-zip-protocol.md
```

2. `backend-docs-index.md` now references:

```txt
postman-json-generation-protocol.md
```

3. No unrelated files were modified.

Suggested checks:

```bash
grep -Rni "postman-import-zip-protocol" docs/basearchitecturedocs/backend-docs-index.md
grep -Rni "postman-json-generation-protocol" docs/basearchitecturedocs/backend-docs-index.md
git diff -- docs/basearchitecturedocs/backend-docs-index.md
git status --short
```

## Expected Result Report

Return a concise result report with:

- files changed;
- exact before/after link;
- verification command outputs;
- confirmation that no unrelated files were changed.
