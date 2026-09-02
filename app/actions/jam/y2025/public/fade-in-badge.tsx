import { clientEntry, css, type Handle, type RemixNode } from "remix/ui";

import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";

type JamFadeInBadgeProps = {
  delay?: number;
  children: RemixNode;
  live?: boolean;
};

export let JamFadeInBadge = clientEntry(
  import.meta.url,
  function JamFadeInBadge(handle: Handle<JamFadeInBadgeProps>) {
    let isVisible = false;
    let delay = handle.props.delay ?? 0;

    handle.queueTask((signal) => {
      if (signal.aborted) return;
      let prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReducedMotion) {
        isVisible = true;
        handle.update();
        return;
      }

      let timeout = window.setTimeout(() => {
        if (signal.aborted) return;
        isVisible = true;
        handle.update();
      }, delay);

      let clearTimeoutOnPageHide = () => {
        window.clearTimeout(timeout);
      };
      window.addEventListener("pagehide", clearTimeoutOnPageHide, {
        signal: handle.signal,
      });
      handle.signal.addEventListener(
        "abort",
        () => {
          window.clearTimeout(timeout);
        },
        { once: true },
      );
    });

    return () => {
      return (
        <span
          mix={[
            badgeStyle,
            handle.props.live ? liveBadgeStyle : outlinedBadgeStyle,
            isVisible ? visibleBadgeStyle : hiddenBadgeStyle,
          ]}
        >
          {handle.props.children}
        </span>
      );
    };
  },
);

let badgeStyle = css({
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

let liveBadgeStyle = css({
  backgroundColor: theme.colors.brand.red,
  color: "#ffffff",
});

let outlinedBadgeStyle = css({
  color: "#ffffff",
  boxShadow: "inset 0 0 0 4px #ffffff",
  [breakpointMedia.md]: { boxShadow: "inset 0 0 0 6px #ffffff" },
});

let visibleBadgeStyle = css({ opacity: 1 });
let hiddenBadgeStyle = css({ opacity: 0 });
