# Home page 2026 rebuild plan (Figma: "Remix.run-2026" / node `77:355`)

## ⚠️ Before you start

**Always read `HOME_PAGE_NOTES.md` first** - it contains important implementation details and gotchas.

## Source of truth

- **Figma file**: `https://www.figma.com/design/kqbELEmDUrQz9euN6mIjXB/Remix.run-2026?node-id=77-355`
- **Responsive breakpoints**:
  - Desktop: `Home - 1920px` (node `93:569`)
  - Desktop (narrow): `Home - 1400px` (node `90:423`)
  - Tablet: `Home - 800px` (node `93:695`)
  - Mobile: `Home - 380px` (node `112:832`)

## Implementation strategy

### Styling

- **ALWAYS USE TAILWIND CLASSES** unless something is very specific and cumbersome (e.g., complex multi-stop shadows, animations, gradients).
- Create utility classes in `app/styles/marketing.css` for design tokens (e.g., `.rmx-bg-button-primary`, `.rmx-text-button-primary`).
- **When mixing custom classes and Tailwind classes**, use `clsx` (imported as `cx`) with separate string arguments:
  ```tsx
  className={cx(
    // custom classes (e.g., rmx-* utilities)
    "rmx-bg-button-primary rmx-text-button-primary",
    // tailwind classes
    "inline-flex h-14 items-center justify-center gap-2 rounded-lg",
  )}
  ```
  Only use this pattern when mixing both types. If all classes are Tailwind or all are custom, use a regular string.
- Keep all new styles in `app/styles/marketing.css` (already imported in `app/root.tsx`).

### Components

- Route: `app/routes/marketing/home.tsx` (renders its own `Header`/`Footer` + `DocSearchModal`).
- Section components: `app/ui/marketing/home/*` (Hero, Pitch, Timeline, StayInTheLoop).

### Assets

- Hero image: `public/racecar-teaser-hero.webp`
- Timeline SVGs: Export from Figma and embed inline (not `<img>` tags).

## Decisions locked in

- **Theme**: Light-only (no dark mode support)
- **CTA button URL**: `https://github.com/remix-run/remix` (opens in new tab)
- **Discord URL**: `https://rmx.as/discord`
- **Header**: Use existing `app/ui/header.tsx` as-is
- **Timeline**: Export desktop and mobile SVGs from Figma, embed inline

## Remaining work

### ✅ Completed

- Intro mask reveal animation (`app/ui/marketing/home/intro-mask-reveal.tsx`)
- Section 1 — Hero (`app/ui/marketing/home/hero-section.tsx`)
- Section 2 — Pitch + CTA (`app/ui/marketing/home/pitch-section.tsx`)
- Footer (using existing `app/ui/footer.tsx`)

### Section 3 — Timeline ("The story so far")

- Heading + 3 explanatory text blocks
- Year ticks row (2014–2027)
- Multi-lane timeline track (React Router / Remix / Remix 3) with markers
- Export desktop and mobile SVGs from Figma, embed inline
- Use CSS variables for colors
- Screen-reader-friendly milestone list

### Section 4 — "Stay in the loop"

- Section heading
- Newsletter card: reuse `app/ui/subscribe.tsx` or `/_actions/newsletter` endpoint
- Community/Discord card with button
- Responsive layout: side-by-side on desktop, stacked on mobile

### Cleanup

- Update `meta()` title/description/og image
- Delete `app/ui/homepage-scroll-experience.tsx` once unused

## Acceptance criteria

- Visual parity with Figma for all breakpoints (1920 / 1400 / 800 / 380)
- No layout shift when assets load (explicit dimensions/aspect-ratio)
- Newsletter form works end-to-end (validation, error/success states)
- Accessible semantics (heading hierarchy, landmarks, form labels, SR-only timeline)
- Styles scoped to `app/styles/marketing.css`

## Questions

- **Timeline SVG export**: Store exports in `design-assets/` or just paste SVG markup into component?
- **Timeline breakpoint**: Switch SVGs at `<768px` or align with Figma frame sizes (380 vs 800 vs 1400/1920)?
