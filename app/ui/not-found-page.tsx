import { css, type Handle } from "remix/ui";
import { Document } from "./document.tsx";
import { theme } from "./public/theme.ts";

export function StatusErrorDocument(
  handle: Handle<{ status: number; statusText: string }>,
) {
  return () => (
    <Document title={handle.props.statusText} noIndex forceTheme="dark">
      <main id="main-content" tabIndex={-1} mix={statusMainStyle}>
        <div mix={statusContentStyle}>
          <h1 mix={statusCodeStyle}>{handle.props.status}</h1>
          <a
            mix={statusLinkStyle}
            href={`https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${handle.props.status}`}
          >
            {handle.props.statusText}
          </a>
        </div>
      </main>
    </Document>
  );
}

let statusMainStyle = css({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  justifyContent: "center",
  backgroundColor: theme.colors.brand.blue,
  color: "#ffffff",
});

let statusContentStyle = css({ textAlign: "center", lineHeight: 1 });

let statusCodeStyle = css({
  fontFamily: theme.fontFamily.mono,
  fontSize: "25vw",
});

let statusLinkStyle = css({
  display: "inline-block",
  fontSize: "8vw",
  textDecorationLine: "underline",
});
