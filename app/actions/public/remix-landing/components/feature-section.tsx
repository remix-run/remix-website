import { clientEntry, css, type Handle } from "remix/ui";
import {
  createNewsletterFrameForm,
  NewsletterSubscribeFrameHost,
  type NewsletterSubscriptionStatus,
} from "../../../../ui/public/newsletter-subscribe.tsx";
import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";
import { routes } from "../../../../routes.ts";
import { textBoxTrim } from "../../../../ui/public/css-mixins.ts";
import { colors, glowWhite, pageMaxWidth } from "../styles/tokens.ts";

// Vertically center the inner row inside each section's `min-height: 100vh`
// box. `align-items: center` handles grid-cell alignment, but this single
// auto-sized row also needs `align-content: center` so the leftover section
// height is distributed above and below the content.

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
  padding: "32px 24px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderTop: "3px solid var(--brand-cycle, #7ce95a)",
  borderRadius: "24px",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  background: "rgba(0, 0, 0, 0.64)",
  contain: "paint",
  [breakpointMedia.lg]: {
    padding: "48px",
    background: "rgba(0, 0, 0, 0.58)",
  },
});

const rightPanelStyles = css({
  gridColumn: "1 / -1",
  justifySelf: "stretch",
  [breakpointMedia.lg]: {
    gridColumn: "8 / -2",
    justifySelf: "end",
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

const titleStyles = css({
  margin: "0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.bold,
  color: colors.fg,
  fontSize: "clamp(32px, 3.6vw, 50px)",
  lineHeight: "1.04",
  letterSpacing: "-0.02em",
  whiteSpace: "pre-line",
  textShadow: glowWhite,
  ...textBoxTrim,
});

const bodyStyles = css({
  margin: "36px 0 0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.normal,
  color: colors.fg,
  fontSize: "18px",
  lineHeight: "1.55",
  letterSpacing: "-0.008px",
  ...textBoxTrim,
});

const PRIMARY_PANEL_STYLES_BY_ID: Record<
  string,
  ReturnType<typeof css> | undefined
> = {
  "smaller-mental-model": css({
    gridColumn: "1 / -1",
    justifySelf: "center",
    maxWidth: "640px",
  }),
  "test-drive": css({
    gridColumn: "1 / -1",
    justifySelf: "center",
    [breakpointMedia.lg]: {
      gridColumn: "1 / span 6",
      justifySelf: "end",
    },
  }),
  "re-rethinking-best-practices": css({
    gridColumn: "1 / -1",
    maxWidth: "720px",
    [breakpointMedia.lg]: {
      gridColumn: "1 / span 5",
    },
  }),
  "humans-and-agents": css({
    gridColumn: "1 / -1",
    justifySelf: "center",
    maxWidth: "640px",
  }),
};

const SECONDARY_PANEL_STYLES_BY_ID: Record<
  string,
  ReturnType<typeof css> | undefined
> = {
  "test-drive": css({
    gridColumn: "1 / -1",
    justifySelf: "center",
    [breakpointMedia.lg]: {
      gridColumn: "7 / -1",
      justifySelf: "start",
    },
  }),
};

const ROW_STYLES_BY_ID: Record<string, ReturnType<typeof css> | undefined> = {
  "re-rethinking-best-practices": css({
    transform: "none",
  }),
};

type FeatureSectionProps = {
  id: string;
  title: string;
  body: string;
  align: "left" | "right";
  ctaLabel?: string;
  ctaHref?: string;
  ctaIcon?: "eye";
  codeSnippet?: string;
  points?: ReadonlyArray<{ title: string; body: string }>;
  detailPanel?: ReadonlyArray<{ title: string; body: string }>;
  secondary?: {
    title: string;
    body: string;
    newsletter?: boolean;
  };
};

export let LandingNewsletterSubscribeForm = clientEntry(
  import.meta.url,
  function LandingNewsletterSubscribeForm(
    handle: Handle<{ status?: NewsletterSubscriptionStatus | null }>,
  ) {
    let form = createNewsletterFrameForm(handle, "home");

    return () => {
      let status = form.state.status;

      return (
        <>
          <form
            action={routes.newsletter.subscribe.href()}
            method="post"
            {...form.navigation}
            mix={[
              css({
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "32px",
              }),
              ...form.submit,
            ]}
          >
            <label
              for="landing-newsletter-email"
              mix={[
                css({
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: "0",
                  margin: "-1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  border: "0",
                }),
              ]}
            >
              Email address
            </label>
            <input
              id="landing-newsletter-email"
              type="email"
              name="email"
              required
              autocomplete="email"
              placeholder="name@example.com"
              aria-invalid={status === "invalid-email" ? true : undefined}
              aria-describedby={
                status === "idle" ? undefined : "landing-newsletter-message"
              }
              mix={[
                css({
                  flex: "1 1 220px",
                  minWidth: "0",
                  boxSizing: "border-box",
                  appearance: "none",
                  borderRadius: "999px",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  background: "transparent",
                  color: "#ffffff",
                  height: "44px",
                  padding: "0 18px",
                  fontFamily: theme.fontFamily.sans,
                  fontSize: "16px",
                  lineHeight: "1.4",
                  letterSpacing: "-0.008px",
                  "&::placeholder": {
                    color: "rgba(255, 255, 255, 0.3)",
                  },
                }),
              ]}
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              mix={[
                css({
                  flexShrink: "0",
                  borderRadius: "999px",
                  border: "none",
                  boxShadow: "none",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#ffffff",
                  height: "44px",
                  padding: "0 18px",
                  fontFamily: theme.fontFamily.sans,
                  fontWeight: theme.fontWeight.normal,
                  fontSize: "16px",
                  lineHeight: "1.4",
                  letterSpacing: "-0.008px",
                  cursor: "pointer",
                  width: "100%",
                  transition: "background 150ms ease, color 150ms ease",
                  [breakpointMedia.sm]: {
                    width: "auto",
                  },
                  "&:hover": {
                    background: `color-mix(in srgb, var(--brand-cycle, ${colors.accent}) 18%, rgba(255, 255, 255, 0.08))`,
                  },
                  "&:disabled": {
                    cursor: "not-allowed",
                    opacity: "0.55",
                  },
                }),
              ]}
            >
              {status === "submitting" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          <div
            id="landing-newsletter-message"
            aria-live="polite"
            mix={[
              css({
                marginTop: "12px",
                fontFamily: theme.fontFamily.sans,
                fontSize: "14px",
                lineHeight: "1.45",
                letterSpacing: "-0.008px",
                color: "rgba(255, 255, 255, 0.76)",
              }),
              status === "success"
                ? css({
                    display: "block",
                    color: "#7ce95a",
                  })
                : status !== "idle" && status !== "submitting"
                  ? css({
                      display: "block",
                      color: "#ff6b6b",
                    })
                  : css({
                      display: "none",
                    }),
            ]}
          >
            {status === "success"
              ? "Got it! Please check your email to confirm your subscription."
              : status === "invalid-email"
                ? "Please enter a valid email address."
                : status === "invalid-tag"
                  ? "The selected newsletter is not available."
                  : status === "error"
                    ? "Something went wrong. Please try again."
                    : null}
          </div>
        </>
      );
    };
  },
);

export function FeatureSection(handle: Handle<FeatureSectionProps>) {
  return () => {
    const primaryPanelStyles =
      PRIMARY_PANEL_STYLES_BY_ID[handle.props.id] ??
      (handle.props.align === "right"
        ? rightPanelStyles
        : css({
            gridColumn: "1 / -1",
            [breakpointMedia.lg]: {
              gridColumn: "2 / span 5",
            },
          }));
    const rowVariantStyles = ROW_STYLES_BY_ID[handle.props.id];
    const pointListVariantStyles =
      handle.props.id === "smaller-mental-model"
        ? css({
            gridTemplateColumns: "1fr",
            gap: "0",
            margin: "24px -24px -32px",
            borderTop: "1px solid rgba(255, 255, 255, 0.14)",
            [breakpointMedia.sm]: {
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            },
            [breakpointMedia.lg]: {
              margin: "32px -48px -48px",
            },
          })
        : handle.props.id === "humans-and-agents"
          ? css({
              gap: "0",
              margin: "24px -24px -32px",
              borderTop: "1px solid rgba(255, 255, 255, 0.14)",
              [breakpointMedia.lg]: {
                margin: "32px -48px -48px",
              },
            })
          : undefined;
    const pointVariantStyles =
      handle.props.id === "smaller-mental-model"
        ? css({
            padding: "24px",
            borderTop: "0",
            borderRight: "0",
            "&:not(:first-child)": {
              borderTop: "1px solid rgba(255, 255, 255, 0.14)",
            },
            "&:nth-last-child(-n + 2)": {
              paddingBottom: "32px",
            },
            [breakpointMedia.sm]: {
              padding: "32px 48px",
              "&:nth-child(odd)": {
                borderRight: "1px solid rgba(255, 255, 255, 0.14)",
              },
              "&:not(:first-child)": {
                borderTop: "0",
              },
              "&:nth-child(n + 3)": {
                borderTop: "1px solid rgba(255, 255, 255, 0.14)",
              },
              "&:nth-last-child(-n + 2)": {
                paddingBottom: "48px",
              },
            },
          })
        : handle.props.id === "humans-and-agents"
          ? css({
              padding: "24px",
              borderTop: "0",
              "&:not(:first-child)": {
                borderTop: "1px solid rgba(255, 255, 255, 0.14)",
              },
              "&:last-child": {
                paddingBottom: "32px",
              },
              [breakpointMedia.lg]: {
                padding: "32px 48px",
                "&:last-child": {
                  paddingBottom: "48px",
                },
              },
            })
          : undefined;

    return (
      <section
        id={handle.props.id}
        mix={[
          css({
            width: pageMaxWidth,
            minHeight: "112vh",
            margin: "0 auto",
            boxSizing: "border-box",
            padding: "128px 0",
            display: "grid",
            alignItems: "center",
            alignContent: "center",
            [breakpointMedia.lg]: {
              padding: "160px 0",
            },
          }),
        ]}
      >
        <div
          mix={[
            css({
              width: "min(1040px, 100%)",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "24px",
              [breakpointMedia.lg]: {
                gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
              },
            }),
            ...(rowVariantStyles === undefined ? [] : [rowVariantStyles]),
          ]}
        >
          <div data-home-card="" mix={[panelStyles, primaryPanelStyles]}>
            <h2 mix={[titleStyles]}>{handle.props.title}</h2>
            <p mix={[bodyStyles]}>{handle.props.body}</p>
            {handle.props.points ? (
              <ul
                data-card-grid=""
                mix={[
                  css({
                    display: "grid",
                    gap: "22px",
                    margin: "32px 0 0",
                    padding: "0",
                    listStyle: "none",
                  }),
                  ...(pointListVariantStyles === undefined
                    ? []
                    : [pointListVariantStyles]),
                ]}
              >
                {handle.props.points.map((point) => (
                  <li
                    key={point.title}
                    data-card-item=""
                    mix={[
                      css({
                        paddingTop: "20px",
                        borderTop: "1px solid rgba(255, 255, 255, 0.14)",
                      }),
                      ...(pointVariantStyles === undefined
                        ? []
                        : [pointVariantStyles]),
                    ]}
                  >
                    <span
                      mix={[
                        css({
                          display: "block",
                          fontFamily: theme.fontFamily.sans,
                          fontWeight: theme.fontWeight.bold,
                          color: "#ffffff",
                          fontSize: "18px",
                          lineHeight: "1.3",
                          letterSpacing: "-0.008px",
                          ...textBoxTrim,
                        }),
                      ]}
                    >
                      {point.title}
                    </span>
                    <span
                      mix={[
                        css({
                          display: "block",
                          marginTop: "20px",
                          fontFamily: theme.fontFamily.sans,
                          fontWeight: theme.fontWeight.normal,
                          color: "rgba(255, 255, 255, 0.72)",
                          fontSize: "16px",
                          lineHeight: "1.5",
                          letterSpacing: "-0.008px",
                          ...textBoxTrim,
                        }),
                      ]}
                    >
                      {point.body}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {handle.props.ctaLabel && handle.props.ctaHref ? (
              <a
                href={handle.props.ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                mix={[
                  css({
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    minHeight: "44px",
                    marginTop: "32px",
                    padding: "0 18px",
                    borderRadius: "999px",
                    border: "none",
                    boxShadow: "none",
                    background: "rgba(255, 255, 255, 0.08)",
                    color: "#ffffff",
                    fontFamily: theme.fontFamily.sans,
                    fontWeight: theme.fontWeight.normal,
                    fontSize: "16px",
                    lineHeight: "1.4",
                    letterSpacing: "-0.008px",
                    textDecoration: "none",
                    transition:
                      "background 150ms ease, border-color 150ms ease, color 150ms ease",
                    "&:hover": {
                      background: `color-mix(in srgb, var(--brand-cycle, ${colors.accent}) 18%, rgba(255, 255, 255, 0.08))`,
                    },
                  }),
                ]}
              >
                {handle.props.ctaIcon === "eye" ? (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    mix={[
                      css({
                        width: "18px",
                        height: "18px",
                        flexShrink: "0",
                      }),
                    ]}
                  >
                    <path
                      fill="currentColor"
                      d="M12 5C6.5 5 2.1 8.3.5 12c1.6 3.7 6 7 11.5 7s9.9-3.3 11.5-7c-1.6-3.7-6-7-11.5-7Zm0 11.2A4.2 4.2 0 1 1 12 7.8a4.2 4.2 0 0 1 0 8.4Zm0-2.1a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2Z"
                    />
                  </svg>
                ) : null}
                {handle.props.ctaLabel}
              </a>
            ) : null}
          </div>
          {handle.props.codeSnippet ? (
            <div
              mix={[
                css({
                  gridColumn: "1 / -1",
                  minWidth: "0",
                  boxSizing: "border-box",
                  padding: "24px",
                  borderRadius: "24px",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  background: "rgba(0, 0, 0, 0.72)",
                  overflow: "hidden",
                  contain: "paint",
                  [breakpointMedia.lg]: {
                    gridColumn: "6 / -1",
                    background: "rgba(0, 0, 0, 0.38)",
                  },
                }),
              ]}
            >
              <pre
                mix={[
                  css({
                    margin: "0",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    letterSpacing: "0",
                    color: "#ffffff",
                    whiteSpace: "pre",
                    overflowX: "auto",
                    tabSize: "2",
                  }),
                ]}
              >
                <code>{renderHighlightedCode(handle.props.codeSnippet)}</code>
              </pre>
            </div>
          ) : null}
          {handle.props.detailPanel ? (
            <div
              mix={[
                css({
                  gridColumn: "1 / -1",
                  minWidth: "0",
                  boxSizing: "border-box",
                  padding: "24px",
                  borderRadius: "24px",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  background: "rgba(0, 0, 0, 0.72)",
                  contain: "paint",
                  [breakpointMedia.lg]: {
                    gridColumn: "6 / -1",
                    background: "rgba(0, 0, 0, 0.46)",
                  },
                }),
              ]}
            >
              <ul
                mix={[
                  css({
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "12px",
                    margin: "0",
                    padding: "0",
                    listStyle: "none",
                    [breakpointMedia.xl]: {
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    },
                  }),
                ]}
              >
                {handle.props.detailPanel.map((detail) => (
                  <li
                    key={detail.title}
                    mix={[
                      css({
                        minHeight: "0",
                        boxSizing: "border-box",
                        padding: "20px",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "18px",
                        background: "rgba(255, 255, 255, 0.045)",
                        [breakpointMedia.xl]: {
                          minHeight: "172px",
                        },
                      }),
                    ]}
                  >
                    <h3
                      mix={[
                        css({
                          margin: "0",
                          fontFamily: theme.fontFamily.sans,
                          fontWeight: theme.fontWeight.bold,
                          color: "#ffffff",
                          fontSize: "18px",
                          lineHeight: "1.3",
                          letterSpacing: "-0.012em",
                          ...textBoxTrim,
                        }),
                      ]}
                    >
                      {detail.title}
                    </h3>
                    <p
                      mix={[
                        css({
                          margin: "20px 0 0",
                          fontFamily: theme.fontFamily.sans,
                          fontWeight: theme.fontWeight.normal,
                          color: "rgba(255, 255, 255, 0.74)",
                          fontSize: "16px",
                          lineHeight: "1.5",
                          ...textBoxTrim,
                        }),
                      ]}
                    >
                      {detail.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {handle.props.secondary ? (
            <div
              data-home-card=""
              mix={[
                panelStyles,
                SECONDARY_PANEL_STYLES_BY_ID[handle.props.id] ??
                  rightPanelStyles,
              ]}
            >
              <h2 mix={[titleStyles]}>{handle.props.secondary.title}</h2>
              <p mix={[bodyStyles]}>{handle.props.secondary.body}</p>
              {handle.props.secondary.newsletter ? (
                <NewsletterSubscribeFrameHost
                  src={routes.homeNewsletterSignup.href()}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    );
  };
}
