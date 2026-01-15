# Home page rebuild notes (append-only)

This file is **append-only**. Do not rewrite or reorganize existing entries—only add new bullets at the bottom.

- **Marketing home is nested under a layout**: `app/routes/marketing/layout.tsx` renders `Header` and `Footer`, so `app/routes/marketing/home.tsx` must not render its own header/footer or you’ll get duplicates.

## 2026-01-14

- **Figma variable tokens (from “Home - 1920px”)**:
  - **Text**: primary `#313539`, secondary `#63676b`, tertiary `#7c8084`
  - **Neutrals**: `neutral/50 #ebeff2`, `neutral/100 #dee2e6`, `neutral/200 #c6cace`, `neutral/750 #3e4246`, `neutral/950 #0d1114`, `white #ffffff`
  - **Surfaces**: `surface/level 3 #f0f4f7`, `surface/level 4 #f7fbff`
  - **Accents (highlights)**: blue `#259eef`, green `#06ea8a`, red `#d92c49`
  - **Accents (shades)**: blue `#0b2f48`, green `#024629`, red `#410d16`
  - **Buttons**: primary surface `#259eef`, primary label `#f7fbff`, secondary surface `#ebeff2`, secondary label `#25292d`
  - **Shadows**: two named recipes (“low - light mode”, “mid - light mode”) provided as multi-stop drop-shadows
- **Figma spacing tokens**: x-small `8`, small `16`, medium `24`, large `32`, xx-large `48`
- **Figma MCP quirk**: `get_variable_defs` only returns values for some nodes; if you see “nothing selected” it likely needs an actual layer/frame selected in Figma before running the tool.

- **Token prefix convention**: Use `rmx-` as the prefix for CSS variables and Tailwind token namespaces (avoid `marketing-` and `mkt-`).

- **Homepage background approach**: Prefer section-scoped backgrounds (each section sets its own gradient/background) rather than a fixed/absolute page-wide background layer.

- **Section background gradients (Figma)**:
  - **Section 1 (Hero)**: `linear-gradient(180deg, neutral-200 0%, neutral-100 30%, neutral-50 60%, white 100%)`
  - **Section 2 (Text)**: `linear-gradient(180deg, white 0%, neutral-50 100%)`
  - **Section 3 (Timeline)**: `linear-gradient(180deg, neutral-950 0%, neutral-950 50%, neutral-750 100%)`
  - **Section 4 + Footer**: solid `surface/level 3` (`#f0f4f7`)

- **Routing decision (homepage)**: `/` is defined as a top-level route in `app/routes.ts` (not nested under `routes/marketing/layout.tsx`) so the homepage can fully own its chrome/background. The homepage route renders `DocSearchModal`, `Header`, and `Footer` itself.

- **Intro mask SVG implementation**: The mask SVG (`public/remix-logo-mask.svg`) uses a composite path where the outer black rectangle covers the canvas and the inner "R" shape is cut out (via SVG fill rule). The colorful stripes sit inside the "R" cutout. Animation works by scaling the SVG up from `scale(1)` to `scale(18)` over 1s—as the "R" cutout grows larger, it reveals more of the page beneath. The overlay uses `visibility: hidden` at 100% to instantly disappear (no fade). Reduced motion users skip the animation entirely.

- **Intro mask SVG inlined**: The mask SVG is now inlined directly in `app/ui/marketing/home/intro-mask-reveal.tsx` (no external file). `public/remix-logo-mask.svg` was removed.
