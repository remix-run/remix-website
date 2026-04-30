import { css, type Handle } from "remix/ui";
import { colors, glowWhite } from "../styles/tokens";
import { CodeSnippet } from "./code-snippet";

const shellStyles = css({
  minHeight: "100vh",
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
    alignItems: "stretch",
    textAlign: "left",
    gap: "24px",
  },
});

const headingStyles = css({
  margin: "0",
  maxWidth: "920px",
  minWidth: "0",
  fontFamily: "'Inter Variable', 'Inter', sans-serif",
  fontWeight: "700",
  fontSize: "clamp(42px, 6vw, 84px)",
  lineHeight: "1",
  letterSpacing: "-0.03em",
  color: "#ffffff",
  textShadow: glowWhite,
  textWrap: "balance",
  "@supports (text-box-trim: trim-both)": {
    textBoxTrim: "trim-both",
    textBoxEdge: "cap alphabetic",
  },
});

const bodyStyles = css({
  margin: "0",
  maxWidth: "560px",
  minWidth: "0",
  fontFamily: "'Inter Variable', 'Inter', sans-serif",
  fontWeight: "400",
  fontSize: "16px",
  lineHeight: "1.5",
  letterSpacing: "-0.01em",
  color: colors.fg,
  textShadow: glowWhite,
  textWrap: "pretty",
  "@media (max-width: 880px)": {
    maxWidth: "480px",
    textAlign: "justify",
    textAlignLast: "left",
    hyphens: "auto",
  },
  "@supports (text-box-trim: trim-both)": {
    textBoxTrim: "trim-both",
    textBoxEdge: "cap alphabetic",
  },
});

export function LandingHero(_handle: Handle) {
  return () => (
    <section id="the-framework" mix={[shellStyles]}>
      <div mix={[textGroupStyles]}>
        <h1 mix={[headingStyles]}>A web framework for building anything</h1>
        <p mix={[bodyStyles]}>
          Remix gives you the power and tools to build anything you can dream
          of. To get started, just <CodeSnippet>npx remix@next new</CodeSnippet>{" "}
          and you're off to the races.
        </p>
      </div>
    </section>
  );
}
