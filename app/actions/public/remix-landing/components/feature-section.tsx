import { clientEntry, css, type Handle } from "remix/component";
import {
  createNewsletterFrameForm,
  NewsletterSubscribeFrameHost,
  type NewsletterSubscriptionStatus,
} from "../../../../ui/public/newsletter-frame-form.tsx";
import { breakpointMedia, theme } from "../../../../ui/public/styles/theme.ts";
import { routes } from "../../../../routes.ts";
import { textBoxTrim } from "../../../../ui/public/styles/css-mixins.ts";
import { colors, glowWhite, pageMaxWidth } from "../tokens.ts";

type FeaturePoint = { title: string; body: string };

type FeatureSectionProps = {
  id: string;
  title: string;
  body: string;
  align: "left" | "right";
  ctaLabel?: string;
  ctaHref?: string;
  points?: ReadonlyArray<FeaturePoint>;
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
                  color: colors.fgStrong,
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
                  color: colors.fgStrong,
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
    let { id, title, body, align, ctaLabel, ctaHref, points, secondary } =
      handle.props;

    return (
      <section id={id} mix={[sectionStyles]}>
        <div mix={[rowStyles]}>
          <div
            data-home-card=""
            mix={[
              panelStyles,
              PRIMARY_PANEL_STYLES_BY_ID[id] ??
                (align === "right" ? rightPanelStyles : leftPanelStyles),
            ]}
          >
            <h2 mix={[titleStyles]}>{title}</h2>
            <p mix={[bodyStyles]}>{body}</p>
            {points ? <FeaturePoints sectionId={id} points={points} /> : null}
            {ctaLabel && ctaHref ? (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                mix={[ctaStyles]}
              >
                {ctaLabel}
              </a>
            ) : null}
          </div>
          {secondary ? (
            <div
              data-home-card=""
              mix={[
                panelStyles,
                SECONDARY_PANEL_STYLES_BY_ID[id] ?? rightPanelStyles,
              ]}
            >
              <h2 mix={[titleStyles]}>{secondary.title}</h2>
              <p mix={[bodyStyles]}>{secondary.body}</p>
              {secondary.newsletter ? (
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

function FeaturePoints(
  handle: Handle<{ sectionId: string; points: ReadonlyArray<FeaturePoint> }>,
) {
  return () => {
    let variant = POINT_VARIANT_STYLES_BY_ID[handle.props.sectionId];

    return (
      <ul data-card-grid="" mix={[pointListStyles, variant?.list]}>
        {handle.props.points.map((point) => (
          <li
            key={point.title}
            data-card-item=""
            mix={[pointStyles, variant?.item]}
          >
            <span mix={[pointTitleStyles]}>{point.title}</span>
            <span mix={[pointBodyStyles]}>{point.body}</span>
          </li>
        ))}
      </ul>
    );
  };
}

// Vertically center the inner row inside each section's `min-height` box.
// `align-items: center` handles grid-cell alignment, but this single
// auto-sized row also needs `align-content: center` so the leftover section
// height is distributed above and below the content.
const sectionStyles = css({
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
});

const rowStyles = css({
  width: "min(1040px, 100%)",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "24px",
  [breakpointMedia.lg]: {
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
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
  padding: "32px 24px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderTop: "3px solid var(--brand-cycle, #7ce95a)",
  borderRadius: "24px",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  background: colors.cardBg,
  contain: "paint",
  [breakpointMedia.lg]: {
    padding: "48px",
  },
});

const leftPanelStyles = css({
  gridColumn: "1 / -1",
  [breakpointMedia.lg]: {
    gridColumn: "2 / span 5",
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

const ctaStyles = css({
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
  color: colors.fgStrong,
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
});

const pointListStyles = css({
  display: "grid",
  gap: "22px",
  margin: "32px 0 0",
  padding: "0",
  listStyle: "none",
});

const pointStyles = css({
  paddingTop: "20px",
  borderTop: "1px solid rgba(255, 255, 255, 0.14)",
});

const pointTitleStyles = css({
  display: "block",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.bold,
  color: colors.fgStrong,
  fontSize: "18px",
  lineHeight: "1.3",
  letterSpacing: "-0.008px",
  ...textBoxTrim,
});

const pointBodyStyles = css({
  display: "block",
  marginTop: "20px",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.normal,
  color: "rgba(255, 255, 255, 0.72)",
  fontSize: "16px",
  lineHeight: "1.5",
  letterSpacing: "-0.008px",
  ...textBoxTrim,
});

// Sections whose points render as a divided grid that bleeds to the panel edges.
const POINT_VARIANT_STYLES_BY_ID: Record<
  string,
  { list: ReturnType<typeof css>; item: ReturnType<typeof css> } | undefined
> = {
  "smaller-mental-model": {
    list: css({
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
    }),
    item: css({
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
    }),
  },
  "humans-and-agents": {
    list: css({
      gap: "0",
      margin: "24px -24px -32px",
      borderTop: "1px solid rgba(255, 255, 255, 0.14)",
      [breakpointMedia.lg]: {
        margin: "32px -48px -48px",
      },
    }),
    item: css({
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
    }),
  },
};
