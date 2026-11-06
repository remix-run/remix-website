import { css, type Handle } from "remix/component";
import { Document } from "./document.tsx";
import { theme } from "./public/styles/theme.ts";
import { CACHE } from "../utils/cache-control.ts";

/** Response init for rendering `StatusErrorDocument` as a 404. */
export const NOT_FOUND_RESPONSE = {
  status: 404,
  statusText: "Not Found",
  headers: CACHE.PRIVATE,
};

export function StatusErrorDocument(
  handle: Handle<{ status: number; statusText: string }>,
) {
  return () => (
    <Document title={handle.props.statusText} noIndex forceTheme="dark">
      <main
        mix={css({
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: theme.colors.brand.blue,
          color: theme.colors.text.onDark,
        })}
      >
        <div mix={css({ textAlign: "center", lineHeight: 1 })}>
          <h1
            mix={css({
              fontFamily: theme.fontFamily.mono,
              fontSize: "25vw",
            })}
          >
            {handle.props.status}
          </h1>
          <a
            mix={css({
              display: "inline-block",
              fontSize: "8vw",
              textDecorationLine: "underline",
            })}
            href={`https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${handle.props.status}`}
          >
            {handle.props.statusText}
          </a>
        </div>
      </main>
    </Document>
  );
}
