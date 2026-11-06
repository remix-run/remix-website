import { prefersReducedMotion } from "@remix-run/ui/animation";
import { clientEntry, css, type Handle, type RemixNode } from "remix/component";

import { breakpointMedia, theme } from "../../../../ui/public/styles/theme.ts";
import { jamColors } from "./theme.ts";

type JamFadeInBadgeProps = {
  delay?: number;
  children: RemixNode;
  live?: boolean;
};

export const JamFadeInBadge = clientEntry(
  import.meta.url,
  function JamFadeInBadge(handle: Handle<JamFadeInBadgeProps>) {
    let isVisible = false;
    let delay = handle.props.delay ?? 0;
    let reveal = () => {
      isVisible = true;
      handle.update();
    };

    handle.queueTask((signal) => {
      if (signal.aborted) return;
      if (prefersReducedMotion()) reveal();
      else revealAfterDelay(delay, signal, handle.signal, reveal);
    });

    return () => (
      <span
        mix={[
          badgeStyle,
          handle.props.live ? liveBadgeStyle : outlinedBadgeStyle,
          isVisible ? visibleStyle : hiddenStyle,
        ]}
      >
        {handle.props.children}
      </span>
    );
  },
);

/** Calls `reveal` after `delay` ms unless the task aborts, the page hides, or the component unmounts. */
function revealAfterDelay(
  delay: number,
  taskSignal: AbortSignal,
  lifetimeSignal: AbortSignal,
  reveal: () => void,
) {
  let timeout = window.setTimeout(() => {
    if (!taskSignal.aborted) reveal();
  }, delay);
  let cancel = () => window.clearTimeout(timeout);
  window.addEventListener("pagehide", cancel, { signal: lifetimeSignal });
  lifetimeSignal.addEventListener("abort", cancel, { once: true });
}

const badgeStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  borderRadius: theme.radius.full,
  padding: "12px 16px",
  fontSize: "1.25rem",
  lineHeight: 1,
  transition: "opacity 500ms",
  [breakpointMedia.md]: {
    gap: "16px",
    padding: "20px 32px",
    fontSize: "2.25rem",
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

const liveBadgeStyle = css({
  backgroundColor: theme.colors.brand.red,
  color: jamColors.white,
});

const outlinedBadgeStyle = css({
  color: jamColors.white,
  boxShadow: `inset 0 0 0 4px ${jamColors.white}`,
  [breakpointMedia.md]: {
    boxShadow: `inset 0 0 0 6px ${jamColors.white}`,
  },
});

const visibleStyle = css({ opacity: 1 });
const hiddenStyle = css({ opacity: 0 });
