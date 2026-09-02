import { css } from "remix/ui";

import { Icon } from "../../ui/public/icon.tsx";
import {
  bodyLargeStyle,
  buttonTextLargeStyle,
} from "../../ui/public/marketing-styles.ts";
import { breakpointMedia, theme } from "../../ui/public/theme.ts";

export function PitchSection() {
  return () => (
    <section mix={pitchSectionStyle}>
      <div mix={[bodyLargeStyle, pitchContentStyle]}>
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
          mix={[buttonTextLargeStyle, watchButtonStyle]}
        >
          <Icon
            name="github"
            mix={watchButtonIconStyle}
            fill="none"
            aria-hidden="true"
          />
          <span>Watch the repo</span>
        </a>
      </div>
    </section>
  );
}

let pitchSectionStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "48px",
  [breakpointMedia.md]: { paddingBottom: "96px" },
});

let pitchContentStyle = css({
  display: "flex",
  width: "100%",
  maxWidth: "1024px",
  flexDirection: "column",
  alignItems: "center",
  gap: "48px",
  color: "var(--rmx-text-primary)",
});

let pitchParagraphStyle = css({ width: "100%" });

let watchButtonStyle = css({
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
});

let watchButtonIconStyle = css({
  width: "24px",
  height: "24px",
  flexShrink: 0,
});
