import { css, type Handle } from "remix/component";
import { NewsletterSubscribeFrameHost } from "../../../../ui/public/newsletter-frame-form.tsx";
import { breakpointMedia, theme } from "../../../../ui/public/styles/theme.ts";
import { routes } from "../../../../routes.ts";
import { textBoxTrim } from "../../../../ui/public/styles/css-mixins.ts";
import { colors, glowWhite, pageMaxWidth } from "../tokens.ts";

type FeaturePoint = { title: string; body: string };

/**
 * How a feature section arranges its panels:
 * - `centered-grid`: one centered panel whose points form a two-column grid.
 * - `centered-list`: one centered panel whose points form a divided list.
 * - `split`: primary and secondary panels side by side on large screens.
 */
export type FeatureSectionLayout = "centered-grid" | "centered-list" | "split";

type FeatureSectionProps = {
  id: string;
  title: string;
  body: string;
  layout: FeatureSectionLayout;
  ctaLabel?: string;
  ctaHref?: string;
  points?: ReadonlyArray<FeaturePoint>;
  secondary?: {
    title: string;
    body: string;
    newsletter?: boolean;
  };
};

export function FeatureSection(handle: Handle<FeatureSectionProps>) {
  return () => {
    let { id, title, body, layout, ctaLabel, ctaHref, points, secondary } =
      handle.props;
    let layoutStyles = LAYOUT_STYLES[layout];

    return (
      <section id={id} mix={[sectionStyles]}>
        <div mix={[rowStyles]}>
          <div data-home-card="" mix={[panelStyles, layoutStyles.primary]}>
            <h2 mix={[titleStyles]}>{title}</h2>
            <p mix={[bodyStyles]}>{body}</p>
            {points ? (
              <ul
                data-card-grid=""
                mix={[pointListStyles, layoutStyles.points?.list]}
              >
                {points.map((point) => (
                  <li
                    key={point.title}
                    data-card-item=""
                    mix={[pointStyles, layoutStyles.points?.item]}
                  >
                    <span mix={[pointTitleStyles]}>{point.title}</span>
                    <span mix={[pointBodyStyles]}>{point.body}</span>
                  </li>
                ))}
              </ul>
            ) : null}
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
            <div data-home-card="" mix={[panelStyles, layoutStyles.secondary]}>
              <h2 mix={[titleStyles]}>{secondary.title}</h2>
              <p mix={[bodyStyles]}>{secondary.body}</p>
              {secondary.newsletter ? (
                <NewsletterSubscribeFrameHost
                  src={routes.homeNewsletterSubscribeForm.href()}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
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

// Blur stays at 12px because backdrop-filter cost grows ~quadratically with
// radius; the opaque card tint carries the frosted-glass look. `contain: paint`
// bounds the invalidation region so scrolling past the panel doesn't force a
// broader paint walk.
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

const centeredPanelStyles = css({
  gridColumn: "1 / -1",
  justifySelf: "center",
  maxWidth: "640px",
});

// Points that render as a divided grid/list bleeding to the panel edges.
const gridPointStyles = {
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
};

const listPointStyles = {
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
};

type CssMix = ReturnType<typeof css>;

const LAYOUT_STYLES = {
  "centered-grid": {
    primary: centeredPanelStyles,
    secondary: centeredPanelStyles,
    points: gridPointStyles,
  },
  "centered-list": {
    primary: centeredPanelStyles,
    secondary: centeredPanelStyles,
    points: listPointStyles,
  },
  split: {
    primary: css({
      gridColumn: "1 / -1",
      justifySelf: "center",
      [breakpointMedia.lg]: {
        gridColumn: "1 / span 6",
        justifySelf: "end",
      },
    }),
    secondary: css({
      gridColumn: "1 / -1",
      justifySelf: "center",
      [breakpointMedia.lg]: {
        gridColumn: "7 / -1",
        justifySelf: "start",
      },
    }),
    points: undefined,
  },
} satisfies Record<
  FeatureSectionLayout,
  {
    primary: CssMix;
    secondary: CssMix;
    points: { list: CssMix; item: CssMix } | undefined;
  }
>;
