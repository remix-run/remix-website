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
  - R shape starts solid (visible) then fades out to reveal content behind
  - Hero text content fades in after intro animation completes
  - Animation timing driven by CSS variables in `:root`
  - Reduced motion support
- Section 1 — Hero (`app/ui/marketing/home/hero-section.tsx`)
- Section 2 — Pitch + CTA (`app/ui/marketing/home/pitch-section.tsx`)
- Section 3 — Timeline (`app/ui/marketing/home/timeline-section/`)
  - Heading + 3 explanatory text blocks with colored links
  - Desktop SVG diagram (`desktop.tsx`) with year labels, multi-lane tracks, glow effects
  - Mobile grid-based diagram (`mobile.tsx`) with vertical layout
  - Responsive breakpoint at `xl:` (1280px)
  - CSS variables for all colors
- Section 4 — "Stay in the loop" (`app/ui/marketing/home/stay-in-the-loop-section.tsx`)
  - Newsletter subscription card with form
  - Discord community card with button
  - Responsive layout (side-by-side desktop, stacked mobile)
  - Button hover/active states
  - Fixed alignment and mobile overflow issues
- Footer (using existing `app/ui/footer.tsx`)
- Typography helpers added in `app/styles/marketing.css` and applied to sections

### Remaining work

- **Timeline hover effects (desktop)**: Add hover states for timeline track segments/markers
- **SR-friendly milestone list**: Add visually-hidden list of milestones for screen readers (TODO in `timeline-section/index.tsx`)

### Cleanup

- ✅ Update `meta()` title/description (OG image TBD)
- Delete `app/ui/homepage-scroll-experience.tsx` once unused
- Remove `public/remix-logo-mask.svg` if still present (mask SVG is now inlined)

## Acceptance criteria

- Visual parity with Figma for all breakpoints (1920 / 1400 / 800 / 380)
- No layout shift when assets load (explicit dimensions/aspect-ratio)
- Newsletter form works end-to-end (validation, error/success states)
- Accessible semantics (heading hierarchy, landmarks, form labels, SR-only timeline)
- Styles scoped to `app/styles/marketing.css`

## Questions (resolved)

- **Timeline SVG export**: ~~Store exports in `design-assets/` or just paste SVG markup into component?~~ → Inlined in components (`desktop.tsx` / `mobile.tsx`)
- **Timeline breakpoint**: ~~Switch SVGs at `<768px` or align with Figma frame sizes?~~ → Switch at `xl:` (1280px) — desktop diagram on xl+, mobile grid below
