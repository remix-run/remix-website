import { css, type Handle } from "remix/component";
import { colors, glowWhite, pageMaxWidth } from "../styles/tokens";

const shellStyles = css({
  width: pageMaxWidth,
  minHeight: "100vh",
  margin: "0 auto",
  boxSizing: "border-box",
  padding: "120px 0",
  display: "grid",
  alignItems: "center",
});

const rowStyles = css({
  display: "grid",
  gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
  gap: "24px",
  "@media (max-width: 880px)": {
    gridTemplateColumns: "1fr",
  },
});

// Option A perf pass: reduce blur radius from 18px → 10px (blur cost is
// ~quadratic in radius, so this cuts this section's backdrop-filter work
// to ~31% of its previous per-frame cost) and compensate the slight loss
// of diffusion with a marginally more opaque local tint so the frosted-glass
// read holds up. The shared `colors.sectionNavBg` token is intentionally
// left alone — `SectionNav` and `PresetIndicator` don't need the same bump.
// `contain: paint` gives the compositor a bounded invalidation region so
// scrolling past the panel doesn't force a broader paint walk.
const panelStyles = css({
  width: "100%",
  maxWidth: "640px",
  boxSizing: "border-box",
  padding: "24px",
  borderRadius: "24px",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  background: "rgba(0, 0, 0, 0.32)",
  contain: "paint",
});

const rightPanelStyles = css({
  gridColumn: "8 / -2",
  justifySelf: "end",
  "@media (max-width: 880px)": {
    gridColumn: "1 / -1",
    justifySelf: "stretch",
  },
});

const rightPanelUseCasesStyles = css({
  gridColumn: "8 / -1",
  justifySelf: "end",
  "@media (max-width: 880px)": {
    gridColumn: "1 / -1",
    justifySelf: "stretch",
  },
});

const rightPanelNewsletterStyles = css({
  gridColumn: "7 / -1",
  justifySelf: "start",
  "@media (max-width: 880px)": {
    gridColumn: "1 / -1",
    justifySelf: "stretch",
  },
});

const leftPanelFullStackStyles = css({
  gridColumn: "1 / span 4",
  "@media (max-width: 880px)": {
    gridColumn: "1 / -1",
  },
});

const leftPanelStyles = css({
  gridColumn: "2 / span 5",
  "@media (max-width: 880px)": {
    gridColumn: "1 / -1",
  },
});

const leftPanelStartBuildingStyles = css({
  gridColumn: "1 / span 6",
  justifySelf: "end",
  "@media (max-width: 880px)": {
    gridColumn: "1 / -1",
    justifySelf: "stretch",
  },
});

const leftPanelAiReadyStyles = css({
  gridColumn: "1 / span 4",
  "@media (max-width: 880px)": {
    gridColumn: "1 / -1",
  },
});

const leftPanelPowerfulComponentsStyles = css({
  gridColumn: "1 / span 5",
  maxWidth: "720px",
  "@media (max-width: 880px)": {
    gridColumn: "1 / -1",
  },
});

// The shell stays static (no overflow) so its backdrop-filter layer doesn't
// get re-rasterized on every scroll — which was pinning the main thread and
// starving the particle canvas / scroll-linked logo animation. The inner
// <pre> is the thing that actually scrolls when a snippet is long.
//
// Option A perf pass (see matching note on `panelStyles`): reduced blur from
// 18px → 10px with a slightly more opaque local tint; added `contain: paint`
// to bound compositor invalidation.
const codeContainerStyles = css({
  gridColumn: "6 / -1",
  minWidth: "0",
  boxSizing: "border-box",
  padding: "24px",
  borderRadius: "24px",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  background: "rgba(0, 0, 0, 0.32)",
  overflow: "hidden",
  contain: "paint",
  "@media (max-width: 880px)": {
    gridColumn: "1 / -1",
  },
});

const codePreStyles = css({
  margin: "0",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "13px",
  lineHeight: "1.6",
  letterSpacing: "0",
  color: "#ffffff",
  whiteSpace: "pre",
  maxHeight: "calc(80vh - 48px)",
  overflow: "auto",
  tabSize: "2",
});

// Remix brand cycle colors, used to syntax-highlight the code snippet.
const SYNTAX_COLORS = {
  keyword: "#2dacf9", // blue
  string: "#7ce95a",  // green
  number: "#ffdf5f",  // yellow
  jsxTag: "#fa73da",  // pink
  type: "#ff3c32",    // red
  default: "inherit",
} as const;

type SyntaxKind = keyof typeof SYNTAX_COLORS;

const SYNTAX_KEYWORDS = new Set([
  "import", "from", "export", "default",
  "function", "return", "let", "const", "var",
  "type", "interface", "enum", "class", "extends", "implements",
  "if", "else", "switch", "case", "break", "continue",
  "for", "while", "do", "try", "catch", "finally", "throw",
  "new", "await", "async", "typeof", "instanceof", "in", "of",
  "this", "super", "as", "satisfies",
  "true", "false", "null", "undefined",
  "void", "number", "string", "boolean", "any", "never", "unknown",
  "public", "private", "protected", "readonly", "static", "abstract",
]);

type SyntaxToken = { text: string; kind: SyntaxKind };

function tokenizeCode(code: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  // Ordered alternation: comments, strings, JSX open/close tags (with name),
  // numbers, identifiers. Everything else falls through as "default".
  const regex =
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(<\/?[A-Za-z][\w-]*)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*\b)/g;

  let cursor = 0;
  for (let match = regex.exec(code); match !== null; match = regex.exec(code)) {
    if (match.index > cursor) {
      tokens.push({ text: code.slice(cursor, match.index), kind: "default" });
    }
    const [full, comment, str, jsxOpen, num, ident] = match;
    if (comment !== undefined) {
      tokens.push({ text: full, kind: "default" });
    } else if (str !== undefined) {
      tokens.push({ text: str, kind: "string" });
    } else if (jsxOpen !== undefined) {
      tokens.push({ text: jsxOpen, kind: "jsxTag" });
    } else if (num !== undefined) {
      tokens.push({ text: num, kind: "number" });
    } else if (ident !== undefined) {
      if (SYNTAX_KEYWORDS.has(ident)) {
        tokens.push({ text: ident, kind: "keyword" });
      } else if (/^[A-Z]/.test(ident)) {
        tokens.push({ text: ident, kind: "type" });
      } else {
        tokens.push({ text: ident, kind: "default" });
      }
    }
    cursor = match.index + full.length;
  }

  if (cursor < code.length) {
    tokens.push({ text: code.slice(cursor), kind: "default" });
  }

  return tokens;
}

// `FeatureSection` re-renders on every scroll frame (App calls `handle.update`
// via rAF on scroll), so tokenizing a long snippet each frame is wasted work.
// Snippets come from a static module-level array, so the set of unique
// strings seen here is tiny and bounded — a plain Map keyed by the snippet
// string is fine.
const highlightedSnippetCache = new Map<string, ReturnType<typeof buildHighlightedCode>>();

function buildHighlightedCode(code: string) {
  return tokenizeCode(code).map((token, i) =>
    token.kind === "default" ? (
      <span key={i}>{token.text}</span>
    ) : (
      <span key={i} style={{ color: SYNTAX_COLORS[token.kind] }}>
        {token.text}
      </span>
    ),
  );
}

function renderHighlightedCode(code: string) {
  const cached = highlightedSnippetCache.get(code);
  if (cached !== undefined) return cached;
  const rendered = buildHighlightedCode(code);
  highlightedSnippetCache.set(code, rendered);
  return rendered;
}


const kickerStyles = css({
  margin: "0 0 20px",
  fontFamily: "'JetBrains Mono', monospace",
  color: "#ffffff",
  fontSize: "12px",
  textTransform: "uppercase",
  "@supports (text-box-trim: trim-both)": {
    textBoxTrim: "trim-both",
    textBoxEdge: "cap alphabetic",
  },
});

const titleStyles = css({
  margin: "0",
  fontFamily: "'Inter Variable', 'Inter', sans-serif",
  fontWeight: "700",
  color: colors.fg,
  fontSize: "clamp(30px, 4vw, 56px)",
  lineHeight: "1",
  letterSpacing: "-0.02em",
  whiteSpace: "pre-line",
  textShadow: glowWhite,
  "@supports (text-box-trim: trim-both)": {
    textBoxTrim: "trim-both",
    textBoxEdge: "cap alphabetic",
  },
});

const bodyStyles = css({
  margin: "48px 0 0",
  fontFamily: "'Inter Variable', 'Inter', sans-serif",
  fontWeight: "400",
  color: colors.fg,
  fontSize: "16px",
  lineHeight: "1.4",
  letterSpacing: "-0.008px",
  "@supports (text-box-trim: trim-both)": {
    textBoxTrim: "trim-both",
    textBoxEdge: "cap alphabetic",
  },
});

const ctaStyles = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  marginTop: "20px",
  padding: "10px 16px",
  borderRadius: "999px",
  border: "none",
  boxShadow: "none",
  background: "rgba(255, 255, 255, 0.08)",
  color: "#ffffff",
  fontFamily: "'Inter Variable', 'Inter', sans-serif",
  fontWeight: "400",
  fontSize: "16px",
  lineHeight: "1.4",
  letterSpacing: "-0.008px",
  textDecoration: "none",
  transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
  "&:hover": {
    background: `color-mix(in srgb, var(--brand-cycle, ${colors.accent}) 18%, rgba(255, 255, 255, 0.08))`,
  },
});

const ctaIconStyles = css({
  width: "18px",
  height: "18px",
  flexShrink: "0",
});

const subscribeFormStyles = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "20px",
});

const subscribeLabelStyles = css({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: "0",
});

const subscribeInputStyles = css({
  flex: "1 1 220px",
  minWidth: "0",
  boxSizing: "border-box",
  appearance: "none",
  borderRadius: "999px",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  background: "transparent",
  color: "#ffffff",
  padding: "10px 16px",
  fontFamily: "'Inter Variable', 'Inter', sans-serif",
  fontSize: "16px",
  lineHeight: "1.4",
  letterSpacing: "-0.008px",
  "&::placeholder": {
    color: "rgba(255, 255, 255, 0.3)",
  },
});

const subscribeButtonStyles = css({
  flexShrink: "0",
  borderRadius: "999px",
  border: "none",
  boxShadow: "none",
  background: "rgba(255, 255, 255, 0.08)",
  color: "#ffffff",
  padding: "10px 16px",
  fontFamily: "'Inter Variable', 'Inter', sans-serif",
  fontWeight: "400",
  fontSize: "16px",
  lineHeight: "1.4",
  letterSpacing: "-0.008px",
  cursor: "pointer",
  transition: "background 150ms ease, color 150ms ease",
  "@media (max-width: 680px)": {
    width: "100%",
  },
  "&:hover": {
    background: `color-mix(in srgb, var(--brand-cycle, ${colors.accent}) 18%, rgba(255, 255, 255, 0.08))`,
  },
});

type FeatureSectionProps = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  align: "left" | "right";
  ctaLabel?: string;
  ctaHref?: string;
  ctaIcon?: "eye";
  codeSnippet?: string;
  secondary?: {
    kicker: string;
    title: string;
    body: string;
    newsletterAction?: string;
    newsletterPlaceholder?: string;
    newsletterButtonLabel?: string;
  };
};

function renderFeatureSection(props: FeatureSectionProps) {
  return (
    <section id={props.id} mix={[shellStyles]}>
      <div mix={[rowStyles]}>
        <div
          id={props.id === "full-stack" ? "full-stack-panel" : undefined}
          mix={[
            panelStyles,
            props.id === "full-stack"
              ? leftPanelFullStackStyles
              : props.id === "start-building"
                ? leftPanelStartBuildingStyles
                : props.id === "ai-ready"
                ? leftPanelAiReadyStyles
                : props.id === "powerful-components"
                  ? leftPanelPowerfulComponentsStyles
                  : props.id === "use-cases"
                    ? rightPanelUseCasesStyles
                    : props.align === "right"
                      ? rightPanelStyles
                      : leftPanelStyles,
          ]}
        >
          <p mix={[kickerStyles]}>{props.kicker}</p>
          <h2 mix={[titleStyles]}>{props.title}</h2>
          <p mix={[bodyStyles]}>{props.body}</p>
          {props.ctaLabel && props.ctaHref ? (
            <a href={props.ctaHref} target="_blank" rel="noopener noreferrer" mix={[ctaStyles]}>
              {props.ctaIcon === "eye" ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" mix={[ctaIconStyles]}>
                  <path
                    fill="currentColor"
                    d="M12 5C6.5 5 2.1 8.3.5 12c1.6 3.7 6 7 11.5 7s9.9-3.3 11.5-7c-1.6-3.7-6-7-11.5-7Zm0 11.2A4.2 4.2 0 1 1 12 7.8a4.2 4.2 0 0 1 0 8.4Zm0-2.1a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2Z"
                  />
                </svg>
              ) : null}
              {props.ctaLabel}
            </a>
          ) : null}
        </div>
        {props.codeSnippet ? (
          <div mix={[codeContainerStyles]}>
            <pre mix={[codePreStyles]}><code>{renderHighlightedCode(props.codeSnippet)}</code></pre>
          </div>
        ) : null}
        {props.secondary ? (
          <div mix={[panelStyles, props.id === "start-building" ? rightPanelNewsletterStyles : rightPanelStyles]}>
            <p mix={[kickerStyles]}>{props.secondary.kicker}</p>
            <h2 mix={[titleStyles]}>{props.secondary.title}</h2>
            <p mix={[bodyStyles]}>{props.secondary.body}</p>
            {props.secondary.newsletterAction ? (
              <form
                action={props.secondary.newsletterAction}
                method="post"
                target="_blank"
                mix={[subscribeFormStyles]}
              >
                <label for="newsletter-email" mix={[subscribeLabelStyles]}>Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  autocomplete="email"
                  placeholder={props.secondary.newsletterPlaceholder ?? "name@example.com"}
                  mix={[subscribeInputStyles]}
                />
                <button type="submit" mix={[subscribeButtonStyles]}>
                  {props.secondary.newsletterButtonLabel ?? "Subscribe"}
                </button>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function secondaryEqual(
  a: FeatureSectionProps["secondary"],
  b: FeatureSectionProps["secondary"],
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.kicker === b.kicker &&
    a.title === b.title &&
    a.body === b.body &&
    a.newsletterAction === b.newsletterAction &&
    a.newsletterPlaceholder === b.newsletterPlaceholder &&
    a.newsletterButtonLabel === b.newsletterButtonLabel
  );
}

function propsEqual(a: FeatureSectionProps, b: FeatureSectionProps): boolean {
  return (
    a.id === b.id &&
    a.kicker === b.kicker &&
    a.title === b.title &&
    a.body === b.body &&
    a.align === b.align &&
    a.ctaLabel === b.ctaLabel &&
    a.ctaHref === b.ctaHref &&
    a.ctaIcon === b.ctaIcon &&
    a.codeSnippet === b.codeSnippet &&
    secondaryEqual(a.secondary, b.secondary)
  );
}

// App calls `handle.update()` on every scroll frame, which walks its entire
// render output — including every FeatureSection. None of a FeatureSection's
// props depend on scroll state (they come from the static `storySections`
// module constant), so we cache the rendered tree per instance and return
// the same element reference on subsequent updates. That keeps remix from
// re-diffing the (now much larger) code-snippet subtree at 60Hz during
// scroll, which was starving the particle-canvas rAF loop.
export function FeatureSection(_handle: Handle) {
  let cachedProps: FeatureSectionProps | null = null;
  let cachedOutput: ReturnType<typeof renderFeatureSection> | null = null;

  return (props: FeatureSectionProps) => {
    if (cachedProps !== null && cachedOutput !== null && propsEqual(cachedProps, props)) {
      return cachedOutput;
    }
    cachedProps = props;
    cachedOutput = renderFeatureSection(props);
    return cachedOutput;
  };
}
