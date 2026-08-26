import { css, type Handle } from "remix/ui";
import { theme } from "../../../../ui/public/theme.ts";
import { textBoxTrim } from "../../../../ui/public/css-mixins.ts";
import { colors, glowWhite } from "../styles/tokens.ts";
import { CodeSnippet } from "./code-snippet.tsx";

const shellStyles = css({
  minHeight: "100vh",
  boxSizing: "content-box",
  position: "relative",
  display: "flex",
  alignItems: "flex-start",
  paddingTop:
    "calc(clamp(128px, 92px + 7vw, 188px) + (100vw - 48px) * 43 / 440)",
});

const textGroupStyles = css({
  width: "100%",
  maxWidth: "100%",
  minWidth: "0",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "clamp(20px, 2.5vw, 32px)",
  padding: "0 24px",
  textAlign: "center",
  "@media (max-width: 880px)": {
    gap: "24px",
  },
});

const headingStyles = css({
  margin: "0",
  maxWidth: "920px",
  minWidth: "0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.bold,
  fontSize: "clamp(42px, 6vw, 84px)",
  lineHeight: "1",
  letterSpacing: "-0.03em",
  color: "#ffffff",
  textShadow: glowWhite,
  textWrap: "balance",
  ...textBoxTrim,
});

const bodyClosingPhraseStyles = css({
  whiteSpace: "nowrap",
});

const bodyStyles = css({
  margin: "0",
  maxWidth: "560px",
  minWidth: "0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.normal,
  fontSize: "18px",
  lineHeight: "1.55",
  letterSpacing: "-0.01em",
  color: colors.fg,
  textShadow: glowWhite,
  textWrap: "pretty",
  "@media (max-width: 880px)": {
    maxWidth: "480px",
  },
  ...textBoxTrim,
});

const actionGroupStyles = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  alignSelf: "center",
});

export function LandingHero(_handle: Handle) {
  return () => (
    <section id="fully-stacked-web-framework" mix={[shellStyles]}>
      <div mix={[textGroupStyles]}>
        <h1 mix={[headingStyles]}>The fully-stacked web framework</h1>
        <p mix={[bodyStyles]}>
          Remix brings together the server runtime, routing, authentication,
          sessions and database integrations, with its own UI framework, asset
          compilation, dynamic styling, and accessible component library, all in
          one simple, cohesive{" "}
          <span mix={[bodyClosingPhraseStyles]}>stack built on Web APIs.</span>
        </p>
        <div mix={[actionGroupStyles]}>
          <CodeSnippet>npx remix@next new</CodeSnippet>
        </div>
      </div>
    </section>
  );
}
