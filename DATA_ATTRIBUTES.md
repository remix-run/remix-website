# Data Attributes Under Review

This document tracks `data-*` attributes in the Remix website codebase that are still worth scrutinizing. It is intentionally not an exhaustive inventory of every `data-*` attribute in the app.

Use this as a reference when deciding whether an existing attribute should stay, or whether a new one needs enough justification to be added.

> **Note for editors:** When a `data-*` attribute is removed from code or deemed clearly appropriate, remove it from this document. Do not leave historical notes - this doc should reflect the current scrutiny list only. Update the "Last audited" date when making changes.

Last audited: March 23, 2026

---

## Quick Reference Table

| Attribute                 | File(s)        | Purpose                      | Consumers                                   |
| ------------------------- | -------------- | ---------------------------- | ------------------------------------------- |
| `data-remix-managed-head` | `document.tsx` | Marks managed meta/link tags | `document-head.ts` (reconciliation)         |

---

## By Category

### 1. Head Tag Management

**Location:** `remix/components/document.tsx`, `remix/components/document-head.ts`

- `data-remix-managed-head` — Marks `<meta>` and `<link>` tags controlled by Remix for reconciliation

---

## Usage Patterns

### Pattern 1: Framework Internal Markers

**Example:** `data-remix-managed-head`

Framework uses to identify which head tags it controls for reconciliation during navigation.

---

## When to Use Data Attributes

**Appropriate uses:**

- Pre-hydration state that inline scripts need
- Passing server-computed values to client behavior
- Element identification when classes are for styling only
- Framework internal reconciliation markers

**Consider alternatives when:**

- State is React/Remix Component state → use component state/context
- Values are purely for styling → use CSS custom properties
- Element refs are needed → use `ref` callbacks
- Values change frequently → data attributes are string-only and trigger layout

---

## File Locations

| File                                               | Data attributes                                              |
| -------------------------------------------------- | ------------------------------------------------------------ |
| `remix/components/document.tsx`              | Defines `data-remix-managed-head`                        |
| `remix/components/document-head.ts`          | Queries `data-remix-managed-head`                        |
