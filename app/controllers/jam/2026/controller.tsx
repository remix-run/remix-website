import { Document } from "../../../ui/document.tsx";
import { Footer } from "../../../ui/footer.tsx";
import { Header } from "../../../ui/header.tsx";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { render } from "../../../utils/render.ts";

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
      <Header />
      <main
        id="main-content"
        class="container flex flex-1 flex-col"
        tabIndex={-1}
      >
        <div class="py-24">
          <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white">
            Remix Jam 2026
          </h1>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Details are coming soon.
          </p>
        </div>
      </main>
      <Footer />
    </Document>
  );
}
