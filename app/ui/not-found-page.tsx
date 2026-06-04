import type { Handle } from "remix/ui";
import { cx } from "../utils/cx.ts";
import { Document } from "./document.tsx";
import { styleHrefs } from "../utils/style-hrefs.ts";

export function StatusErrorDocument(
  handle: Handle<{ status: number; statusText: string }>,
) {
  return () => (
    <Document
      title={handle.props.statusText}
      noIndex
      forceTheme="dark"
      stylesheets={[styleHrefs.app]}
    >
      <main
        id="main-content"
        tabIndex={-1}
        class={cx(
          "flex flex-1 flex-col justify-center text-white",
          "bg-blue-brand",
        )}
      >
        <div class="text-center leading-none">
          <h1 class="font-mono text-[25vw]">{handle.props.status}</h1>
          <a
            class="inline-block text-[8vw] underline"
            href={`https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${handle.props.status}`}
          >
            {handle.props.statusText}
          </a>
        </div>
      </main>
    </Document>
  );
}
