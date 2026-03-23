# Data Attributes Under Review

This document tracks `data-*` attributes in the Remix website codebase that are still worth scrutinizing. It is intentionally not an exhaustive inventory of every `data-*` attribute in the app.

Use this as a reference when deciding whether an existing attribute should stay, or whether a new one needs enough justification to be added.

> **Note for editors:** When a `data-*` attribute is removed from code or deemed clearly appropriate, remove it from this document. Do not leave historical notes - this doc should reflect the current scrutiny list only. Update the "Last audited" date when making changes.

Last audited: March 23, 2026

---

## Quick Reference Table

| Attribute                 | File(s)                    | Purpose                            | Consumers                                                                      |
| ------------------------- | -------------------------- | ---------------------------------- | ------------------------------------------------------------------------------ |
| `data-gallery-modal`      | `jam-gallery-modal-host.tsx` (modal `<div>`) | Dialog root                | `jamGalleryModalNavigation` mixin on that host (focus trap, keyboard nav)       |
| `data-gallery-modal-photo`| `jam-2025-gallery.tsx`     | Marks modal `<img>`                | — (stable hook; no client script queries it today)                            |
| `data-gallery-backdrop`   | `jam-2025-gallery.tsx`     | Marks backdrop click-to-close area| `jam-gallery-modal-host.tsx` (modal mixin excludes it from focusable, click close) |
| `data-gallery-close-link` | `jam-2025-gallery.tsx`     | Marks explicit close button/link   | `jam-gallery-modal-host.tsx` (click handler for closing)            |
| `data-gallery-photo-link` | `jam-2025-gallery.tsx`     | Marks grid photo links             | `e2e/jam.spec.ts` (stable grid selectors)                                      |
| `data-gallery-photo-index`| `jam-2025-gallery.tsx`     | Stores photo index (0-based)       | `jam-gallery-focus-restore.tsx` (focus restoration after closing modal)       |
| `data-remix-managed-head` | `document.tsx`             | Marks managed meta/link tags       | `document-head.ts` (reconciliation)                                            |

---

## By Category

### 1. Gallery System (Photo Modal)

**Location:** `remix/routes/jam-2025-gallery.tsx`, `remix/assets/jam-gallery-modal-host.tsx`, `remix/assets/jam-gallery-focus-restore.tsx`

**DOM query / markers**

- `data-gallery-modal` — Modal root for global listeners and focus trap
- `data-gallery-backdrop` — Backdrop close target
- `data-gallery-close-link` — Close control
- `data-gallery-photo-link` — Grid thumbnails (E2E + human-readable “this opens the modal”)
- `data-gallery-photo-index` — SessionStorage-based focus restore when leaving the modal
- `data-gallery-modal-photo` — Modal image element (marker only for now)

### 2. Head Tag Management

**Location:** `remix/components/document.tsx`, `remix/components/document-head.ts`

- `data-remix-managed-head` — Marks `<meta>` and `<link>` tags controlled by Remix for reconciliation

---

## Usage Patterns

### Pattern 1: DOM Element Queries

**Example:** `data-gallery-modal`

Used when elements need to be found without relying on CSS classes (which may change) or when multiple elements need similar behavior:

```tsx
const modal = document.querySelector("[data-gallery-modal]");
```

### Pattern 2: Framework Internal Markers

**Example:** `data-remix-managed-head`

Framework uses to identify which head tags it controls for reconciliation during navigation.

---

## When to Use Data Attributes

**Appropriate uses:**

- E2E test markers (stable selectors that aren't user-facing)
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
| `remix/routes/jam-2025-gallery.tsx`                | Defines gallery modal markers                                |
| `remix/assets/jam-gallery-modal-host.tsx`          | `JamGalleryModalHost` `clientEntry` — modal `<div>` + mixin hydration   |
| `remix/assets/jam-gallery-focus-restore.tsx`       | Queries `data-gallery-photo-index`                          |
| `remix/components/document.tsx`                  | Defines `data-remix-managed-head`                            |
| `remix/components/document-head.ts`                | Queries `data-remix-managed-head`                            |
| `e2e/jam.spec.ts`                                  | Asserts on `data-gallery-modal`, `data-gallery-photo-link`   |
