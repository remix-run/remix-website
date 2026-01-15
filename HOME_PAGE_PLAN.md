# Home page 2026 rebuild plan (Figma: “Remix.run-2026” / node `77:355`)

## Goals

- **Build the new 2026 marketing homepage** to match the Figma “Dev Ready” design.
- **Keep marketing redesign styling isolated**: add new styles to `app/styles/marketing.css` (already imported in `app/root.tsx`).
- **Replace the existing homepage implementation** in `app/routes/marketing/home.tsx` (and remove old homepage-specific UI as follow-up tasks).

## Working notes (must-read, append-only)

Before making changes, always read `HOME_PAGE_NOTES.md`.

When you learn something new (routing/layout, assets, styling constraints, tricky implementation details), **append** a new bullet to the bottom of `HOME_PAGE_NOTES.md`. Do **not** rewrite or reorganize that file.

## Source of truth

- **Figma file**: `https://www.figma.com/design/kqbELEmDUrQz9euN6mIjXB/Remix.run-2026?node-id=77-355`
- **Primary frames in this node** (responsive targets):
  - **Desktop**: `Home - 1920px` (node `93:569`)
  - **Desktop (narrow)**: `Home - 1400px` (node `90:423`)
  - **Tablet**: `Home - 800px` (node `93:695`)
  - **Mobile**: `Home - 380px` (node `112:832`)

## Tasks

### Page structure (from Figma)

- **Intro — Mask reveal sequence (plays on page load)**
  - Centered “R” logo on black background
  - Expands/reveals underlying homepage content over a few frames (Mask Sequence 0–4)
- **Global header navigation** (instance in hero)
- **Section 1 — Hero**
  - Primary headline + subhead
  - “Hero Image” (large draped graphic)
- **Section 2 — Text**
  - Two-paragraph pitch
  - CTA button (“Watch the repo” in comps)
- **Section 3 — Timeline** (“The story so far”)
  - Year ticks row (2014–2027)
  - Multi-lane timeline track (React Router / Remix / Remix 3) with markers
  - Explanatory text blocks
- **Section 4 — Stay in the loop**
  - H2
  - Two cards:
    - Newsletter signup (email + submit)
    - Community/Discord card (button)
- **Footer**
  - Wordmark + social icons
  - License/copyright

## Implementation strategy

- **Route module**
  - Rewrite `app/routes/marketing/home.tsx` to render the new sections.
  - Keep the page mostly static; only dynamic behavior is newsletter signup (existing action/fetcher flow).
- **Styling**
  - Prefer small, composable classnames and keep all new rules in `app/styles/marketing.css`.
  - Consider adding a single page wrapper class (e.g. `.marketing-home`) so new rules stay scoped.
  - Continue using Tailwind utilities where they’re already a good fit, but route any “new design system” styling through `marketing.css` tokens/utilities.
- **Components**
  - Start with a single route file to match layout quickly, then extract reusable pieces:
    - `Hero`
    - `Timeline`
    - `StayInTheLoop`
    - `NewsletterCard` (likely reusing `app/ui/subscribe.tsx`)
- **Assets**
  - **Hero image**: use `public/racecar-teaser-hero.webp` (provided).
  - Export any SVG-only timeline art from Figma and store under `public/` (final location TBD; see questions).
  - **Intro mask logo**: `public/remix-r-logo.svg` exists; we’ll likely wrap it as a React component for ergonomic reuse in the intro mask sequence (see tasks).

## Decisions locked in (resolved)

- **Hero image asset**: `public/racecar-teaser-hero.webp`
- **Intro mask sequence**
  - Runs **every visit**
  - Duration: **1s** (for now)
  - **Not skippable** (for now)
  - Implementation preference: **CSS-first**, avoid a “page is useless until JS loads” dependency
  - Fidelity: use the provided `public/remix-r-logo.svg`; the animation is “just scale the SVG up” until the page is fully revealed
  - Overlay background: **solid black for the whole 1s** (no fade)
- **CTA button URL**: `https://github.com/remix-run/remix`
- **Theme behavior**: **light-only** (do not support dark mode on the new homepage)
- **Discord URL**: `https://rmx.as/discord`
- **Header**: keep existing `app/ui/header.tsx` as-is (no work required)
- **Timeline approach**
  - Export **desktop** and **mobile** timeline SVG(s) from Figma first
  - Embed them **inline** (not `<img>` / not external SVG files)

## Task breakdown

### Intro — Mask reveal sequence (on-load animation)

- **Build the intro overlay**
  - Full-viewport overlay that plays on initial page load, then unmounts (or becomes inert) once finished.
  - Should not block navigation/scroll after completion.
- **Status**
  - Placeholder component scaffolded: `app/ui/marketing/home/intro-mask-reveal.tsx` (not implemented yet).
- **Animation behavior**
  - Run **on every visit** (no session management for now).
  - Start with small centered `remix-r-logo.svg` on black background (Mask Sequence 0).
  - Expand the logo/mask to reveal the underlying page until the full homepage is visible (Mask Sequences 1–4).
  - Target duration: **1s** (adjust later once implemented).
- **Implementation approach**
  - **CSS-first / no-JS dependency**: the page should still become usable as soon as CSS loads; it should not require JS to “finish” or dismiss the intro.
  - Use the provided `public/remix-r-logo.svg` (pixel-perfect) and animate via **CSS transforms** (e.g. `transform: scale(...)` with `transform-origin: center`).
  - Keep the overlay background **solid black for the full duration** (no fade); hide/remove the overlay at the end of the animation.
  - Make the overlay inert after the animation via CSS (`pointer-events: none`, and `visibility: hidden` at 100% keyframe; if using `opacity`, keep it `1` until the final frame and drop to `0` at 100% to avoid a “fade”).
- **Accessibility & user preferences**
  - Respect `prefers-reduced-motion`: skip animation and show the page immediately (or do a simple fade).
  - Ensure focus/keyboard users aren’t trapped by the overlay.
- **Performance**
  - Avoid layout shift: the page should be laid out behind the overlay from the start.
  - Keep CPU/GPU usage reasonable; avoid heavy reflows.

### Setup / plumbing

- **Home route rewrite**
  - Replace `app/routes/marketing/home.tsx` with the new page markup.
  - Update `meta()` title/description/og image to match the new messaging.
  - Decide whether the homepage should force light mode or follow system theme (see questions).
- **Status**
  - Route rewritten with section scaffolding + minimal loader for `siteUrl`.
  - Removed `handle.forceDark` so the page stays **light-only** by default.
- **Remove old homepage dependencies**
  - Remove homepage-only loader data and markdown tutorial dependencies from the old homepage.
  - Follow-up cleanup: delete `app/ui/homepage-scroll-experience.tsx` once no longer referenced anywhere.
- **Status**
  - Old homepage loader dependencies removed from `app/routes/marketing/home.tsx`.

### Section 1 — Hero

- **Layout**
  - Match the centered header + hero content alignment across 1920/1400/800/380 widths.
  - Implement hero spacing + vertical rhythm per frame (notably different hero heights across breakpoints).
- **Typography**
  - Implement H1 and subhead styles (font, size, tracking, color).
  - Confirm whether this page is intended to be primarily light UI in both themes (see questions).
- **Hero image**
  - Use `public/racecar-teaser-hero.webp` as the draped “hero image” asset.
  - Ensure responsive sizing/cropping:
    - wide image on desktop
    - narrower/taller crop on mobile
  - Add alt text strategy (likely decorative → `alt=""`, but confirm).

### Section 2 — Text (pitch + CTA)

- **Content block**
  - Implement two-paragraph copy block with max-width and spacing.
  - Ensure consistent text color using tokens (`text-rmx-primary` / `text-rmx-muted`).
- **CTA button**
  - Implement the “Watch the repo” button style per design.
  - Wire to the final destination URL (GitHub/watch? docs? waitlist?) once confirmed.

### Section 3 — Timeline (“The story so far”)

- **Static structure**
  - Heading + supporting paragraphs (3 blocks in the 1920 comp).
- **Timeline visualization**
  - Export **timeline SVGs from Figma**:
    - Desktop timeline SVG
    - Mobile timeline SVG
  - Embed the exported SVG(s) **inline** (paste into the React component), then iterate on markup/CSS variables as needed.
  - Implement year ticks (2014–2027).
  - Implement multi-lane track + colored segments + markers:
    - Lane: React Router (long segment)
    - Lane: Remix (segments + special SVG frame in Figma labeled “EXPORT AS SVG”)
    - Lane: Remix 3 (short segment)
  - Decide implementation:
    - **Option A (preferred)**: One inline SVG for the entire track + markers, with CSS variables for colors.
    - **Option B**: HTML divs for lanes/segments/markers (more brittle).
- **Accessibility**
  - Provide a screen-reader-friendly list of milestones (years + what happened), even if the visual is SVG-only.
  - Ensure color contrast meets requirements in both light/dark themes.

### Section 4 — “Stay in the loop” (cards)

- **Section heading**
  - Implement the “Stay in the loop” header styling + spacing.
- **Newsletter card**
  - Reuse existing newsletter action endpoint (`/_actions/newsletter`) via `useFetcher` and/or reuse `app/ui/subscribe.tsx`.
  - Match card layout per breakpoint:
    - Desktop: newsletter + community cards side-by-side
    - Mobile: stacked cards; newsletter input and button stack
  - Ensure proper error/success messaging (can reuse existing `SubscribeStatus` behavior, restyle as needed).
- **Community/Discord card**
  - Implement copy + button (“Join Discord” in comps).
  - Wire button to the final link (likely `https://rmx.as/discord`) and confirm whether it should open in a new tab.

### Footer

- **Match Figma footer spacing**
  - Confirm whether we keep using existing `app/ui/footer.tsx` (likely) and just adjust spacing/colors via `marketing.css` for the home page.
  - Ensure social icon set matches Figma (GitHub/Twitter/YouTube/Discord).

## Files likely to change

- **Route**
  - `app/routes/marketing/home.tsx` (rewrite)
- **CSS**
  - `app/styles/marketing.css` (add new home styles + tokens/utilities)
- **Logo component (new)**
  - Create a React component wrapper around `public/remix-r-logo.svg` (location TBD; likely `app/ui/remix-r-logo.tsx` or `app/ui/logo.tsx`).
- **Potential new UI modules** (if we extract sections)
  - `app/ui/marketing/home/*` (new directory; now created)
- **Assets**
  - `public/racecar-teaser-hero.webp` (hero image)
  - `public/remix-r-logo.svg` (intro mask logo source)
  - `public/...` (timeline SVG export(s), any new icons)
- **Cleanup**
  - `app/ui/homepage-scroll-experience.tsx` (delete once unused)

## Acceptance criteria

- **Visual parity** with Figma for 1920 / 1400 / 800 / 380 breakpoints (layout, typography, spacing, colors).
- **No layout shift** when assets load (set explicit dimensions or aspect-ratio).
- **Newsletter form works** end-to-end (validates email, shows error/success, clears input on success).
- **Accessible semantics** (headings in order, nav landmarks, form labels, SR-only timeline description).
- **Styles remain marketing-scoped** (new rules live in `app/styles/marketing.css`, optionally scoped under `.marketing-home`).

## Questions / clarifications

- **CTA button**: should “Watch the repo” open in a **new tab**?
- **Discord button**: should “Join Discord” open in a **new tab**?
- **Timeline SVG export**
  - Should we store the “source of truth” exports anywhere (e.g. `design-assets/`), or just paste the SVG markup into the component and rely on Figma for the source?
  - Do you want the timeline to **switch SVGs at a specific breakpoint** (e.g. `<768px`), or align with the Figma frame sizes (380 vs 800 vs 1400/1920)?
