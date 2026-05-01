import { clientEntry, css, on, type Handle } from "remix/ui";
import { routes } from "../../../routes.ts";
import {
  submitNewsletterRequest,
  type SubscribeState,
} from "../../newsletter-subscribe.tsx";
import { colors, glowWhite, pageMaxWidth } from "../styles/tokens.ts";

// Vertically center the inner row inside each section's `min-height: 100vh`
// box. `align-items: center` handles grid-cell alignment, but this single
// auto-sized row also needs `align-content: center` so the leftover section
// height is distributed above and below the content.
const shellStyles = css({
  width: pageMaxWidth,
  minHeight: "100vh",
  margin: "0 auto",
  boxSizing: "border-box",
  padding: "120px 0",
  display: "grid",
  alignItems: "center",
  alignContent: "center",
});

const rowStyles = css({
  display: "grid",
  gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
  gap: "24px",
  "@media (max-width: 880px)": {
    gridTemplateColumns: "1fr",
  },
});

const rowPowerfulComponentsStyles = css({
  transform: "translateY(clamp(48px, 7dvh, 88px))",
  "@media (max-width: 880px)": {
    transform: "none",
  },
});

// Option A perf pass: reduce blur radius from 18px → 10px (blur cost is
// ~quadratic in radius, so this cuts this section's backdrop-filter work
// to ~31% of its previous per-frame cost) and compensate the slight loss
// of diffusion with a more opaque local tint so the frosted-glass
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
  background: "rgba(0, 0, 0, 0.50)",
  contain: "paint",
  "@media (max-width: 880px)": {
    background: "rgba(0, 0, 0, 0.55)",
  },
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

// The shell stays static so its backdrop-filter layer doesn't get
// re-rasterized on every scroll — which was pinning the main thread and
// starving the particle canvas / scroll-linked logo animation. The snippet
// expands vertically with its content to avoid trapping page scroll.
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
  background: "rgba(0, 0, 0, 0.38)",
  overflow: "hidden",
  contain: "paint",
  "@media (max-width: 880px)": {
    gridColumn: "1 / -1",
    background: "rgba(0, 0, 0, 0.72)",
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
  overflowX: "auto",
  tabSize: "2",
});

// Remix brand cycle colors, used to syntax-highlight the code snippet.
const SYNTAX_COLORS = {
  keyword: "#2dacf9", // blue
  string: "#7ce95a", // green
  number: "#ffdf5f", // yellow
  jsxTag: "#fa73da", // pink
  type: "#ff3c32", // red
  default: "inherit",
} as const;

type SyntaxKind = keyof typeof SYNTAX_COLORS;

const SYNTAX_KEYWORDS = new Set([
  "import",
  "from",
  "export",
  "default",
  "function",
  "return",
  "let",
  "const",
  "var",
  "type",
  "interface",
  "enum",
  "class",
  "extends",
  "implements",
  "if",
  "else",
  "switch",
  "case",
  "break",
  "continue",
  "for",
  "while",
  "do",
  "try",
  "catch",
  "finally",
  "throw",
  "new",
  "await",
  "async",
  "typeof",
  "instanceof",
  "in",
  "of",
  "this",
  "super",
  "as",
  "satisfies",
  "true",
  "false",
  "null",
  "undefined",
  "void",
  "number",
  "string",
  "boolean",
  "any",
  "never",
  "unknown",
  "public",
  "private",
  "protected",
  "readonly",
  "static",
  "abstract",
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

// Snippets come from a static route-owned array, so the set of unique strings
// seen here is tiny and bounded. Keep the tokenizer cache local and keyed by
// the snippet string instead of rebuilding the highlighted tree repeatedly.
const highlightedSnippetCache = new Map<
  string,
  ReturnType<typeof buildHighlightedCode>
>();

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
  transition:
    "background 150ms ease, border-color 150ms ease, color 150ms ease",
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
  "&:disabled": {
    cursor: "not-allowed",
    opacity: "0.55",
  },
});

const subscribeMessageStyles = css({
  marginTop: "12px",
  fontFamily: "'Inter Variable', 'Inter', sans-serif",
  fontSize: "14px",
  lineHeight: "1.45",
  letterSpacing: "-0.008px",
  color: "rgba(255, 255, 255, 0.76)",
});

const subscribeMessageHiddenStyles = css({
  display: "none",
});

const subscribeSuccessStyles = css({
  display: "block",
  color: "#7ce95a",
});

const subscribeErrorStyles = css({
  display: "block",
  color: "#ff6b6b",
});

const PRIMARY_PANEL_STYLES_BY_ID: Record<
  string,
  ReturnType<typeof css> | undefined
> = {
  "full-stack": leftPanelFullStackStyles,
  "start-building": leftPanelStartBuildingStyles,
  "ai-ready": leftPanelAiReadyStyles,
  "powerful-components": leftPanelPowerfulComponentsStyles,
  "use-cases": rightPanelUseCasesStyles,
};

const SECONDARY_PANEL_STYLES_BY_ID: Record<
  string,
  ReturnType<typeof css> | undefined
> = {
  "start-building": rightPanelNewsletterStyles,
};

const ROW_STYLES_BY_ID: Record<string, ReturnType<typeof css> | undefined> = {
  "powerful-components": rowPowerfulComponentsStyles,
};

type FeatureSectionProps = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  align: "left" | "right";
  packageLogosAnchor?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  ctaIcon?: "eye";
  codeSnippet?: string;
  secondary?: {
    kicker: string;
    title: string;
    body: string;
    newsletter?: boolean;
    newsletterPlaceholder?: string;
    newsletterButtonLabel?: string;
  };
};

export let LandingNewsletterSubscribeForm = clientEntry(
  import.meta.url,
  function LandingNewsletterSubscribeForm(handle: Handle) {
    let submitting = false;
    let state: SubscribeState = "idle";
    let error: string | null = null;

    return (props: { placeholder?: string; buttonLabel?: string }) => (
      <>
        <form
          action={routes.actions.newsletter.href()}
          method="post"
          mix={[
            subscribeFormStyles,
            on("submit", async (event, signal) => {
              event.preventDefault();
              if (submitting) return;

              let form = event.currentTarget as HTMLFormElement;
              submitting = true;
              state = "idle";
              error = null;
              handle.update();

              try {
                let result = await submitNewsletterRequest({
                  action: form.action,
                  formData: new FormData(form),
                  signal,
                });
                if (signal.aborted) return;
                state = result.state;
                error = result.error;
                if (result.shouldReset) {
                  form.reset();
                }
              } finally {
                submitting = false;
                handle.update();
              }
            }),
          ]}
        >
          <label for="landing-newsletter-email" mix={[subscribeLabelStyles]}>
            Email address
          </label>
          <input
            id="landing-newsletter-email"
            type="email"
            name="email"
            required
            autocomplete="email"
            placeholder={props.placeholder ?? "name@example.com"}
            aria-invalid={state === "error" ? true : undefined}
            aria-describedby={
              state === "idle" ? undefined : "landing-newsletter-message"
            }
            mix={[subscribeInputStyles]}
          />
          <button
            type="submit"
            disabled={submitting}
            mix={[subscribeButtonStyles]}
          >
            {submitting ? "Subscribing..." : (props.buttonLabel ?? "Subscribe")}
          </button>
        </form>
        <div
          id="landing-newsletter-message"
          aria-live="polite"
          mix={[
            subscribeMessageStyles,
            state === "success"
              ? subscribeSuccessStyles
              : state === "error"
                ? subscribeErrorStyles
                : subscribeMessageHiddenStyles,
          ]}
        >
          {state === "success"
            ? "Got it! Please check your email to confirm your subscription."
            : state === "error"
              ? (error ?? "Something went wrong")
              : null}
        </div>
      </>
    );
  },
);

export function FeatureSection(_handle: Handle) {
  return (props: FeatureSectionProps) => {
    const primaryPanelStyles =
      PRIMARY_PANEL_STYLES_BY_ID[props.id] ??
      (props.align === "right" ? rightPanelStyles : leftPanelStyles);

    return (
      <section id={props.id} mix={[shellStyles]}>
        <div mix={[rowStyles, ROW_STYLES_BY_ID[props.id]]}>
          <div
            data-package-logos-panel={
              props.packageLogosAnchor ? "true" : undefined
            }
            mix={[panelStyles, primaryPanelStyles]}
          >
            <p mix={[kickerStyles]}>{props.kicker}</p>
            <h2 mix={[titleStyles]}>{props.title}</h2>
            <p mix={[bodyStyles]}>{props.body}</p>
            {props.ctaLabel && props.ctaHref ? (
              <a
                href={props.ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                mix={[ctaStyles]}
              >
                {props.ctaIcon === "eye" ? (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    mix={[ctaIconStyles]}
                  >
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
              <pre mix={[codePreStyles]}>
                <code>{renderHighlightedCode(props.codeSnippet)}</code>
              </pre>
            </div>
          ) : null}
          {props.secondary ? (
            <div
              mix={[
                panelStyles,
                SECONDARY_PANEL_STYLES_BY_ID[props.id] ?? rightPanelStyles,
              ]}
            >
              <p mix={[kickerStyles]}>{props.secondary.kicker}</p>
              <h2 mix={[titleStyles]}>{props.secondary.title}</h2>
              <p mix={[bodyStyles]}>{props.secondary.body}</p>
              {props.secondary.newsletter ? (
                <LandingNewsletterSubscribeForm
                  placeholder={props.secondary.newsletterPlaceholder}
                  buttonLabel={props.secondary.newsletterButtonLabel}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    );
  };
}
