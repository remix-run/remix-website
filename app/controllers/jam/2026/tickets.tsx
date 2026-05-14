import { Document } from "../../../ui/document.tsx";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { render } from "../../../utils/render.ts";
import {
  jam2026CopyStyle,
  jam2026HeadingStyle,
  jam2026MainStyle,
  jam2026PageStyle,
  jam2026PlaceholderStyle,
} from "./theme.ts";

export async function jam2026TicketsHandler() {
  return renderTicketPage();
}

export async function jam2026TicketsActionHandler() {
  return renderTicketPage({
    status: 409,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function renderTicketPage(init?: ResponseInit) {
  let headers = new Headers(init?.headers);
  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", CACHE_CONTROL.DEFAULT);
  }

  return render.document(<RemixJam2026TicketsPage />, {
    ...init,
    headers,
  });
}

function RemixJam2026TicketsPage() {
  return () => (
    <Document
      title="Remix Jam 2026 Tickets"
      description="Remix Jam 2026 tickets are not available yet."
    >
      <div class="jam-2026-page" mix={jam2026PageStyle}>
        <main id="main-content" tabIndex={-1} mix={jam2026MainStyle}>
          <div mix={jam2026PlaceholderStyle}>
            <h1 mix={jam2026HeadingStyle}>Remix Jam 2026 Tickets</h1>
            <p mix={jam2026CopyStyle}>Tickets are not available yet.</p>
          </div>
        </main>
      </div>
    </Document>
  );
}
