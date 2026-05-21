import { css } from "remix/ui";
import { theme } from "remix/ui/theme";

import { ticketModalConfig } from "../tickets-modal-contract.ts";
import { routes } from "../../../../routes.ts";
import { visuallyHiddenStyle } from "../../../../ui/css-mixins.ts";
import { breakpointMedia } from "../../../../ui/theme.ts";
import { assetPaths } from "../../../../utils/asset-paths.ts";
import { jamTheme } from "../theme.ts";

export function Jam2026FloatingTicketCta() {
  return () => (
    <div mix={floatingCtaRegionStyle}>
      <a
        href={routes.jam.y2026.ticket.href()}
        mix={floatingCtaLinkStyle}
        rmx-reset-scroll="false"
        rmx-target={ticketModalConfig.frameName}
      >
        <span mix={visuallyHiddenStyle}>Get Remix Jam 2026 tickets</span>
        <span aria-hidden="true" mix={floatingCtaRingFrameStyle}>
          <img
            alt=""
            height={170}
            src={assetPaths.jam2026.floatingTicketCta}
            width={170}
            mix={floatingCtaRingStyle}
          />
        </span>
        <img
          alt=""
          draggable="false"
          height={1024}
          width={1024}
          src={assetPaths.jam2026.workshopKeyring}
          mix={floatingCtaKeysStyle}
        />
      </a>
    </div>
  );
}

let floatingCtaRegionStyle = css({
  height: "0",
  pointerEvents: "none",
  position: "relative",
  width: "100%",
  zIndex: 3,
});

let floatingCtaLinkStyle = css({
  "--ticket-ring-animation-play-state": "running",
  cursor: "pointer",
  display: "block",
  height: "260px",
  outline: "none",
  pointerEvents: "auto",
  position: "absolute",
  right: `calc(${theme.space.xl} + 28px)`,
  top: "-84px",
  transform: "scale(0.82)",
  transformOrigin: "top right",
  width: "180px",
  "&:focus-visible": {
    outline: `3px solid ${jamTheme.brandRed}`,
    outlineOffset: theme.space.sm,
  },
  "&:hover, &:focus-visible": {
    "--ticket-ring-animation-play-state": "paused",
  },
  [breakpointMedia.lg]: {
    right: "10.2%",
    transform: "none",
  },
});

let floatingCtaRingFrameStyle = css({
  display: "block",
  height: "170px",
  position: "absolute",
  right: 0,
  top: 0,
  width: "170px",
});

let floatingCtaRingStyle = css({
  animation: "jam-2026-floating-ticket-spin 16s linear infinite",
  animationPlayState: "var(--ticket-ring-animation-play-state)",
  display: "block",
  height: "100%",
  transformOrigin: "center",
  width: "100%",
  "@keyframes jam-2026-floating-ticket-spin": {
    to: {
      transform: "rotate(360deg)",
    },
  },
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
});

let floatingCtaKeysStyle = css({
  display: "block",
  height: "394px",
  maxWidth: "none",
  objectFit: "contain",
  position: "absolute",
  right: "-56px",
  top: "-24px",
  userSelect: "none",
  width: "280px",
});
