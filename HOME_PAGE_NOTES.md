# Home page rebuild notes (append-only)

This file is **append-only**. Do not rewrite or reorganize existing entries—only add new bullets at the bottom.

- **Marketing home is nested under a layout**: `app/routes/marketing/layout.tsx` renders `Header` and `Footer`, so `app/routes/marketing/home.tsx` must not render its own header/footer or you’ll get duplicates.

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

- **Hero section responsive breakpoints (from Figma)**:
  - **Desktop (≥800px)**: min-height 920px, 96px gap between headline and image, headline 36px/semibold with -0.01em tracking, 24px gap between headline and subhead, text centered
  - **Mobile (<800px)**: min-height 540px, 48px gap between headline and image, headline 24px/bold with line break after "Remix 3", 48px gap between headline and subhead, text left-aligned
  - Hero image: max-width 1600px on desktop (aspect-ratio 1600:367), min-width 480px on mobile (aspect-ratio 480:110), bleeds off page edges on narrow viewports via negative margins and section `overflow: hidden`

- **forceTheme route handle**: We now use `forceTheme: "dark" | "light"` instead of the old `forceDark: boolean` for route handles. The homepage uses `forceTheme: "light"` to always render in light mode.

- **Code style**: Avoid adding comments unless something genuinely needs explanation. Keep code clean and self-documenting.

- **Breakpoints**: Use Tailwind's default breakpoints (`sm:`, `md:`, `lg:`, etc.) instead of arbitrary breakpoints like `min-[800px]:`. The Figma frames use 800px but `md:` (768px) is close enough.
- **Typography helpers (marketing)**: Shared text utility classes live in `app/styles/marketing.css` (e.g., `.rmx-body`, `.rmx-body-md`, `.rmx-body-lg`, `.rmx-heading-hero`, `.rmx-heading-lg`, `.rmx-heading-xl`, `.rmx-heading-sm`, `.rmx-button-text`, `.rmx-button-text-lg`, `.rmx-body-on-dark`).

- **Intro animation timing variables**: All animation timing is driven by CSS variables in `:root` (not scoped to `.rmx-intro-mask-overlay`) so they can be referenced by any element. Variables: `--rmx-intro-black-hold`, `--rmx-intro-black-fade`, `--rmx-intro-logo-delay`, `--rmx-intro-logo-duration`, `--rmx-intro-logo-easing`, `--rmx-intro-logo-start`, `--rmx-intro-r-fade-duration`, `--rmx-hero-fade-delay`, `--rmx-hero-fade-duration`.

- **Intro R fill fade**: The R shape in the intro mask starts with a solid fill (`--rmx-neutral-200`) that fades out, allowing users to recognize the R shape before content shows through. Implemented using an SVG `<mask>` element to avoid duplicating the R path data.

- **Hero content fade-in**: The `.rmx-hero` class applies a fade-in animation with a delay calculated from the intro animation timing (`--rmx-hero-fade-delay`).

- **Timeline section implementation**:
  - Desktop (`xl:+`): Uses an inline SVG (`desktop.tsx`) with glow filters, gradient fills, and year labels
  - Mobile/Tablet (`<xl:`): Uses a CSS grid-based layout (`mobile.tsx`) with colored track segments
  - Breakpoint at `xl:` (1280px) to switch between layouts
  - Both use CSS variables for colors (`--rmx-highlight-*`, `--rmx-shade-*`, `--rmx-neutral-*`)
