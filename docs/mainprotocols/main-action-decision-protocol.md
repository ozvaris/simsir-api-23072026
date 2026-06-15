# Main Protocol Decision Dictionary

<a id="purpose"></a>

## Purpose

This document defines the top-level decision language used in project reviews.

It helps separate:

```txt
analysis
classification
recommendation
action
```

It does not own domain-specific rules.

Domain-specific protocols should extend this dictionary.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Decision Flow](#decision-flow)
- [Dictionary](#dictionary)
- [Golden Rule](#golden-rule)

<a id="decision-flow"></a>

## Decision Flow

Use this order:

```txt
Analyze → Classify → Recommend → Act
```

Do not jump from analysis directly to implementation.

<a id="dictionary"></a>

## Dictionary

| Finding | Meaning | Correct response |
| --- | --- | --- |
| Clean result | Current standard is satisfied | Accept |
| Weak evidence | The claim is not proven yet | Strengthen proof |
| Scope drift | Topic belongs to another document or layer | Move or link |
| Local hygiene issue | Problem is in test, docs, config, or runtime state | Fix local owner |
| Real behavior bug | Evidence proves incorrect behavior | Prepare targeted fix |
| Architecture smell | Repeated local fixes indicate a deeper design issue | Propose architecture review |
| Unnecessary change | No proven problem exists | Stop |

<a id="golden-rule"></a>

## Golden Rule

```txt
If the problem is local, fix the local owner.
If the problem is systemic, propose architecture review.
If nothing is proven wrong, accept and stop.
```
