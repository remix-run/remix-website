import { Document } from "../../../ui/document.tsx";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { render } from "../../../utils/render.ts";
import {
  Jam2026Theme,
  jam2026CopyStyle,
  jam2026HeadingStyle,
  jam2026MainStyle,
  jam2026PageStyle,
  jam2026PlaceholderStyle,
} from "./theme.ts";

export async function jam2026Handler() {
  return render.document(<RemixJam2026Page />, {
    headers: {
      "Cache-Control": CACHE_CONTROL.DEFAULT,
    },
  });
}

function RemixJam2026Page() {
  return () => (
    <Document
      title="Remix Jam 2026"
      description="Remix Jam 2026 details are coming soon."
    >
      <Jam2026Theme.Style />
      <div class="jam-2026-page" mix={jam2026PageStyle}>
        <main id="main-content" tabIndex={-1} mix={jam2026MainStyle}>
          <div mix={jam2026PlaceholderStyle}>
            <h1 mix={jam2026HeadingStyle}>Remix Jam 2026</h1>
            <p mix={jam2026CopyStyle}>Details are coming soon.</p>
          </div>
        </main>
      </div>
    </Document>
  );
}
