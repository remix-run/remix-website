import { Document } from "../../../ui/document.tsx";
import { Footer } from "../../../ui/footer.tsx";
import { Header } from "../../../ui/header.tsx";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { render } from "../../../utils/render.ts";

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
      <Header />
      <main
        id="main-content"
        class="container flex flex-1 flex-col"
        tabIndex={-1}
      >
        <div class="py-24">
          <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white">
            Remix Jam 2026 Tickets
          </h1>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Tickets are not available yet.
          </p>
        </div>
      </main>
      <Footer />
    </Document>
  );
}
