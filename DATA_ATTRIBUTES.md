# Data Attributes Audit

This document catalogs all `data-*` attributes used in the Remix website codebase, their purposes, and consumers. Use this as a reference when considering alternatives or adding new data attributes.

> **Note for editors:** When removing data attributes from code, remove them from this document as well. Do not leave historical notes - this doc should reflect the current state only. Update the "Last audited" date when making changes.

Last audited: March 20, 2026

---

## Quick Reference Table

| Attribute                   | File(s)                               | Purpose                            | Consumers                                                                          |
| --------------------------- | ------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------- |
| `data-gallery-modal`        | `jam-2025-gallery.tsx`                | Marks modal dialog container       | `jam-gallery-keyboard-navigation.tsx` (queries for keyboard nav, focus management) |
| `data-gallery-modal-image`  | `jam-2025-gallery.tsx`                | Marks image container              | CSS styling only                                                                   |
| `data-gallery-modal-photo`  | `jam-2025-gallery.tsx`                | Marks actual `<img>` element       | `jam-gallery-keyboard-navigation.tsx` (checks loading state)                       |
| `data-gallery-backdrop`     | `jam-2025-gallery.tsx`                | Marks backdrop click-to-close area | `jam-gallery-keyboard-navigation.tsx` (excludes from focusable, click handler)     |
| `data-gallery-close-link`   | `jam-2025-gallery.tsx`                | Marks explicit close button/link   | `jam-gallery-keyboard-navigation.tsx` (click handler for closing)                  |
| `data-gallery-photo-link`   | `jam-2025-gallery.tsx`                | Marks grid photo links             | `jam-gallery-keyboard-navigation.tsx` (preloading trigger)                         |
| `data-gallery-photo-index`  | `jam-2025-gallery.tsx`                | Stores photo index (0-based)       | `jam-gallery-focus-restore.tsx` (queries for focus restoration)                    |
| `data-gallery-aspect-ratio` | `jam-2025-gallery.tsx`                | Precomputed aspect ratio           | `jam-gallery-keyboard-navigation.tsx` (reads for transition)                       |
| `data-gallery-width`        | `jam-2025-gallery.tsx`                | Precomputed width value            | `jam-gallery-keyboard-navigation.tsx`                                              |
| `data-gallery-max-width`    | `jam-2025-gallery.tsx`                | Precomputed max-width value        | `jam-gallery-keyboard-navigation.tsx`                                              |
| `data-gallery-height`       | `jam-2025-gallery.tsx`                | Precomputed height value           | `jam-gallery-keyboard-navigation.tsx`                                              |
| `data-gallery-max-height`   | `jam-2025-gallery.tsx`                | Precomputed max-height value       | `jam-gallery-keyboard-navigation.tsx`                                              |
| `data-gallery-image-src`    | `jam-2025-gallery.tsx`                | Precomputed image src URL          | `jam-gallery-keyboard-navigation.tsx` (preloading)                                 |
| `data-gallery-image-state`  | `jam-gallery-keyboard-navigation.tsx` | "pending" during navigation        | Internal state during transitions                                                  |
| `data-gallery-pending-src`  | `jam-gallery-keyboard-navigation.tsx` | Src being preloaded                | Internal state for image sync                                                      |
| `data-mobile-menu-ready`    | `mobile-menu.tsx`                     | Signals hydration complete         | `mobile-menu.spec.ts` (asserts)                                                    |
| `data-jam-event-badge`      | `jam-fade-in-badge.tsx`               | Boolean marker                     | CSS hook (no JS queries found)                                                     |
| `data-theme`                | `document.tsx`                        | "dark" / "light" override          | `document.tsx` script, `document-head-sync.tsx`, `navigation.spec.ts`              |
| `data-remix-managed-head`   | `document.tsx`                        | Marks managed meta/link tags       | `document-head.ts` (reconciliation)                                                |
| `data-highlight`            | `md.css`, `bailwind.css`              | Marks highlighted code lines       | CSS only (`::after` pseudo-element styling)                                        |

---

## By Category

### 1. Gallery System (Photo Modal)

**Location:** `remix/routes/jam-2025-gallery.tsx`, `remix/assets/jam-gallery-keyboard-navigation.tsx`, `remix/assets/jam-gallery-focus-restore.tsx`

**State Transfer Attributes** (server → client JS):
These attributes pass precomputed photo dimensions from the server-rendered HTML to client-side navigation logic:

- `data-gallery-aspect-ratio`
- `data-gallery-width`
- `data-gallery-max-width`
- `data-gallery-height`
- `data-gallery-max-height`
- `data-gallery-image-src`

**DOM Query Attributes** (element identification):
Used by `querySelector` to find elements for event handling and focus management:

- `data-gallery-modal` - Modal container
- `data-gallery-backdrop` - Click-to-close backdrop
- `data-gallery-close-link` - Close button
- `data-gallery-photo-link` - Grid photo links
- `data-gallery-photo-index` - Index for focus restoration
- `data-gallery-modal-photo` - Image element for loading state

**State Attributes**:

- `data-gallery-modal-image` - Container for CSS styling
- `data-gallery-image-state` - Internal "pending" state
- `data-gallery-pending-src` - Internal preloading state

### 2. Mobile Menu

**Location:** `remix/assets/mobile-menu.tsx`

- `data-mobile-menu-ready` - E2E test marker for hydration complete

### 3. Theme System

**Location:** `remix/components/document.tsx`, `remix/assets/document-head-sync.tsx`

- `data-theme` - Stores "dark" or "light" override. Works before hydration via inline script.

### 4. Head Tag Management

**Location:** `remix/components/document.tsx`, `remix/components/document-head.ts`

- `data-remix-managed-head` - Marks `<meta>` and `<link>` tags controlled by Remix for reconciliation

### 5. CSS-Only Hooks

**Location:** `remix/shared/styles/md.css`, `remix/shared/styles/bailwind.css`

- `data-highlight="true"` - Code line highlighting (CSS `::after` pseudo-element)
- `data-jam-event-badge` - Visual styling hook for badges

---

## Usage Patterns

### Pattern 1: Server-to-Client State Transfer

**Example:** Gallery dimension attributes (`data-gallery-aspect-ratio`, etc.)

Server renders computed values as data attributes, client JS reads them with `getAttribute()` during navigation transitions to apply CSS custom properties for smooth image transitions.

```tsx
// Server renders:
<a data-gallery-aspect-ratio="1.5" data-gallery-width="100%" ... />

// Client reads:
const aspectRatio = element.getAttribute('data-gallery-aspect-ratio');
```

### Pattern 2: DOM Element Queries

**Example:** `data-gallery-modal`

Used when elements need to be found without relying on CSS classes (which may change) or when multiple elements need similar behavior:

```tsx
const modal = document.querySelector("[data-gallery-modal]");
```

### Pattern 3: E2E Test Markers

**Example:** `data-mobile-menu-ready`

Playwright tests assert on these to know when hydration/initialization is complete:

```ts
await expect(page.locator('[data-mobile-menu-ready="true"]')).toHaveCount(1);
```

### Pattern 4: Pre-Hydration State

**Example:** `data-theme`

Inline script reads this immediately (before any JS loads), enabling theme to work during SSR:

```js
let theme = document.documentElement.dataset.theme;
```

### Pattern 5: Framework Internal Markers

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

| File                                               | Data Attributes Used                                        |
| -------------------------------------------------- | ----------------------------------------------------------- |
| `remix/routes/jam-2025-gallery.tsx`                | Defines most gallery attributes                             |
| `remix/assets/jam-gallery-keyboard-navigation.tsx` | Consumes gallery attributes, sets internal state attributes |
| `remix/assets/jam-gallery-focus-restore.tsx`       | Queries `data-gallery-photo-index`                          |
| `remix/assets/mobile-menu.tsx`                     | Sets `data-mobile-menu-ready`                               |
| `remix/assets/jam-fade-in-badge.tsx`               | Defines `data-jam-event-badge`                              |
| `remix/components/document.tsx`                    | Defines `data-theme`, `data-remix-managed-head`             |
| `remix/components/document-head.ts`                | Queries `data-remix-managed-head`                           |
| `remix/assets/document-head-sync.tsx`              | Sets `data-theme`                                           |
| `remix/shared/styles/md.css`                       | Styles `data-highlight`                                     |
| `remix/shared/styles/bailwind.css`                 | Styles `data-highlight`                                     |
| `e2e/jam.spec.ts`                                  | Asserts on `data-gallery-modal`                             |
| `e2e/mobile-menu.spec.ts`                          | Asserts on `data-mobile-menu-ready`                         |
| `e2e/navigation.spec.ts`                           | Asserts on `data-theme`                                     |
