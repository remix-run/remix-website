import { css } from "remix/ui";

import { Icon } from "../../ui/public/icon.tsx";
import { breakpointMedia, theme } from "../../ui/public/theme.ts";

export function PitchSection() {
  return () => (
    <section
      mix={css({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px",
        [breakpointMedia.md]: { paddingBottom: "96px" },
      })}
    >
      <div
        mix={css({
          display: "flex",
          width: "100%",
          maxWidth: "1024px",
          flexDirection: "column",
          alignItems: "center",
          gap: "48px",
          color: "var(--rmx-text-primary)",
          fontSize: "1rem",
          lineHeight: 1.6,
          letterSpacing: "0.025em",
          [breakpointMedia.md]: {
            fontSize: "1.5rem",
            lineHeight: 1.4,
            letterSpacing: 0,
          },
          [breakpointMedia.xl]: {
            fontSize: "2.25rem",
            lineHeight: 1.4,
            letterSpacing: "-0.025em",
          },
        })}
      >
        <p mix={pitchParagraphStyle}>
          Remix is a batteries-included, ultra-productive, zero dependencies and
          bundler-free framework, ready to develop with in a model-first world.
        </p>
        <p mix={pitchParagraphStyle}>
          Remix 3 is a reimagining of what a web framework can be;
          <br aria-hidden="true" />a fresh foundation shaped by decades of
          experience building for the web. It focuses on simplicity, clarity,
          and performance, without giving up the power developers need.
        </p>
        <a
          href="https://github.com/remix-run/remix"
          mix={css({
            display: "inline-flex",
            width: "100%",
            height: "56px",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            border: "1px solid rgb(0 0 0 / 0.1)",
            borderRadius: "8px",
            padding: "16px",
            background: theme.colors.action.primary,
            color: theme.colors.action.primaryLabel,
            boxShadow: theme.shadow.mid,
            fontSize: "1.25rem",
            fontWeight: theme.fontWeight.semibold,
            lineHeight: 1,
            letterSpacing: "-0.025em",
            textDecoration: "none",
            transition: "all 150ms ease",
            "&:hover": { opacity: 0.9 },
            "&:active": { opacity: 0.8, transform: "scale(0.98)" },
            "&:focus-visible": {
              outline: `2px solid ${theme.colors.action.primary}`,
              outlineOffset: "2px",
            },
            [breakpointMedia.sm]: { width: "auto", whiteSpace: "nowrap" },
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
              "&:active": { transform: "none" },
            },
          })}
        >
          <Icon
            name="github"
            mix={css({
              width: "24px",
              height: "24px",
              flexShrink: 0,
            })}
            fill="none"
            aria-hidden="true"
          />
          <span>Watch the repo</span>
        </a>
      </div>
    </section>
  );
}

let pitchParagraphStyle = css({ width: "100%" });
