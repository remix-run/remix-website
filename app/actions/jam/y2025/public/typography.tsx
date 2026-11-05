import { css, type Handle, type Props, type RemixNode } from "remix/component";
import { breakpointMedia, theme } from "../../../../ui/public/styles/theme.ts";
import { jamColors, whiteAlpha } from "./theme.ts";

export function Title(
  handle: Handle<{ children: RemixNode; mix?: Props<"h1">["mix"] }>,
) {
  return () => (
    <h1 mix={handle.props.mix ? [titleStyle, handle.props.mix] : titleStyle}>
      {handle.props.children}
    </h1>
  );
}

export function SectionLabel(handle: Handle<{ children: RemixNode }>) {
  return () => (
    <p
      mix={css({
        color: whiteAlpha(0.5),
        fontFamily: theme.fontFamily.mono,
        fontSize: "0.75rem",
        lineHeight: 1.333,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        [breakpointMedia.md]: { fontSize: "1rem", lineHeight: 1.5 },
      })}
    >
      {handle.props.children}
    </p>
  );
}

export function InfoText(
  handle: Handle<{ children: RemixNode; mix?: Props<"div">["mix"] }>,
) {
  return () => (
    <div
      mix={handle.props.mix ? [infoTextStyle, handle.props.mix] : infoTextStyle}
    >
      <p
        mix={css({
          color: jamColors.white,
          fontSize: "1.125rem",
          fontWeight: theme.fontWeight.bold,
          lineHeight: 1.4,
          [breakpointMedia.md]: { fontSize: "1.875rem", lineHeight: 1.2 },
        })}
      >
        {handle.props.children}
      </p>
    </div>
  );
}

export function Subheader(
  handle: Handle<{ children: RemixNode; mix?: Props<"h2">["mix"] }>,
) {
  return () => (
    <h2
      mix={
        handle.props.mix ? [subheaderStyle, handle.props.mix] : subheaderStyle
      }
    >
      {handle.props.children}
    </h2>
  );
}

export function Paragraph(
  handle: Handle<{ children: RemixNode; mix?: Props<"p">["mix"] }>,
) {
  return () => (
    <p
      mix={
        handle.props.mix ? [paragraphStyle, handle.props.mix] : paragraphStyle
      }
    >
      {handle.props.children}
    </p>
  );
}

let titleStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  color: jamColors.white,
  fontSize: "1.875rem",
  fontWeight: theme.fontWeight.extrabold,
  lineHeight: 1,
  letterSpacing: "-0.025em",
  textTransform: "uppercase",
  [breakpointMedia.sm]: { fontSize: "3rem" },
  [breakpointMedia.md]: { fontSize: "4.5rem", lineHeight: 1 },
});

let infoTextStyle = css({ textAlign: "center" });

let subheaderStyle = css({
  color: jamColors.white,
  fontSize: "1.5rem",
  fontWeight: theme.fontWeight.bold,
  lineHeight: 1.333,
  letterSpacing: "-0.025em",
  [breakpointMedia.md]: { fontSize: "1.875rem", lineHeight: 1.2 },
});

let paragraphStyle = css({
  color: whiteAlpha(0.8),
  "& a": { color: jamColors.link },
  "& a:hover": { textDecoration: "underline" },
});
