import cx from "clsx";
import { Document } from "./document.tsx";
import { render } from "../utils/render.ts";

export function renderNotFoundPage(options?: { statusText?: string }) {
  let statusText = options?.statusText ?? "Not Found";

  return render.document(
    <StatusErrorDocument status={404} statusText={statusText} />,
    {
      status: 404,
      statusText,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function StatusErrorDocument() {
  return (props: { status: number; statusText: string }) => (
    <Document title={props.statusText} noIndex forceTheme="dark">
      <main
        id="main-content"
        tabIndex={-1}
        class={cx(
          "flex flex-1 flex-col justify-center text-white",
          "bg-blue-brand",
        )}
      >
        <div class="text-center leading-none">
          <h1 class="font-mono text-[25vw]">{props.status}</h1>
          <a
            class="inline-block text-[8vw] underline"
            href={`https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${props.status}`}
          >
            {props.statusText}
          </a>
        </div>
      </main>
    </Document>
  );
}
