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
