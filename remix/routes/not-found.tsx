import cx from "clsx";
import { Document } from "../components/document";
import { render } from "../utils/render";

export function renderNotFoundPage(
  _request: Request,
  options?: { statusText?: string },
) {
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
      <div
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
      </div>
    </Document>
  );
}
