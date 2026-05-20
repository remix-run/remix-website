import { clientEntry, css, type Handle } from "remix/ui";
import { theme } from "remix/ui/theme";

import { syncDocumentHead } from "../../document-head-sync.tsx";
import { assetPaths } from "../../../utils/asset-paths.ts";
import {
  getJam2026ClientManagedHeadTags,
  getJam2026HeadContent,
} from "../../../controllers/jam/2026/head-content.ts";
import { jamTheme } from "../../../controllers/jam/2026/theme.ts";
import {
  getJam2026TicketsBackdropLinkProps,
  getJam2026TicketsCloseLinkProps,
  getJam2026TicketsModalRootProps,
} from "../../../controllers/jam/2026/tickets-modal-contract.ts";
import { createJam2026TicketsModalEffects } from "./tickets-modal-effects.ts";

type Jam2026TicketsModalProps = {
  open?: boolean;
};

export let Jam2026TicketsModalFrame = clientEntry(
  import.meta.url,
  function Jam2026TicketsModalFrame(handle: Handle<Jam2026TicketsModalProps>) {
    let modalEffects = createJam2026TicketsModalEffects(handle);
    let headSyncQueued = false;

    function queueHeadSync() {
      if (headSyncQueued) return;
      headSyncQueued = true;

      handle.queueTask(() => {
        headSyncQueued = false;
        let head = getJam2026HeadContent({
          ticketsModalOpen: modalEffects.isOpen(),
        });

        syncDocumentHead(
          {
            title: head.title,
            headTags: getJam2026ClientManagedHeadTags(head),
          },
          { syncTheme: false },
        );
      });
    }

    return () => {
      let ticketsModalOpen = modalEffects.isOpen();

      modalEffects.queueStateSync();
      queueHeadSync();

      return ticketsModalOpen ? <Jam2026TicketsModalContent /> : null;
    };
  },
);

export function Jam2026TicketsModalContent() {
  let backdropLinkProps = getJam2026TicketsBackdropLinkProps();
  let closeLinkProps = getJam2026TicketsCloseLinkProps();

  return () => (
    <div {...getJam2026TicketsModalRootProps()} mix={ticketsModalScrimStyle}>
      <a
        aria-label="Close tickets"
        {...backdropLinkProps}
        tabIndex={-1}
        mix={ticketsModalBackdropStyle}
      />
      <section
        aria-labelledby="tickets-modal-title"
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        mix={ticketsModalWindowStyle}
      >
        <div mix={ticketsModalTitlebarStyle}>
          <a
            aria-label="Close tickets"
            {...closeLinkProps}
            mix={ticketsModalCloseStyle}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              mix={ticketsModalCloseIconStyle}
            >
              <use href={`${assetPaths.iconsSprite}#x-mark`} />
            </svg>
          </a>
          <p id="tickets-modal-title" mix={ticketsModalFilenameStyle}>
            TICKETS.TS
          </p>
        </div>
        <div mix={ticketsModalBodyStyle} />
      </section>
    </div>
  );
}

let ticketsModalScrimStyle = css({
  alignItems: "center",
  background: "rgb(0 0 0 / 0.85)",
  display: "flex",
  inset: 0,
  justifyContent: "center",
  padding: "16px",
  position: "fixed",
  zIndex: 60,
});

let ticketsModalBackdropStyle = css({
  background: "transparent",
  display: "block",
  inset: 0,
  position: "absolute",
});

let ticketsModalWindowStyle = css({
  background: "light-dark(rgb(255 255 255 / 0.82), rgb(10 29 39 / 0.82))",
  borderRadius: "8px",
  boxShadow:
    "0 1px 2px light-dark(rgb(8 40 69 / 0.06), rgb(0 0 0 / 0.2)), 0 6px 16px light-dark(rgb(8 40 69 / 0.08), rgb(0 0 0 / 0.28)), 0 24px 60px light-dark(rgb(8 40 69 / 0.18), rgb(0 0 0 / 0.36)), 0 60px 120px light-dark(rgb(8 40 69 / 0.22), rgb(0 0 0 / 0.44))",
  color: jamTheme.ink,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  maxHeight: "868px",
  maxWidth: "854px",
  overflow: "hidden",
  position: "relative",
  width: "100%",
});

let ticketsModalTitlebarStyle = css({
  alignItems: "center",
  display: "flex",
  flexShrink: 0,
  gap: "6px",
  padding: "8px",
  width: "100%",
});

let ticketsModalCloseStyle = css({
  alignItems: "center",
  background: "transparent",
  borderRadius: "50%",
  color: jamTheme.ink,
  cursor: "pointer",
  display: "inline-flex",
  flexShrink: 0,
  height: "16px",
  justifyContent: "center",
  padding: 0,
  textDecoration: "none",
  width: "16px",
  "&:hover, &:focus-visible": {
    opacity: 0.7,
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "2px",
  },
});

let ticketsModalCloseIconStyle = css({
  display: "block",
  height: "14px",
  width: "14px",
});

let ticketsModalFilenameStyle = css({
  color: jamTheme.ink,
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: "10px",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "0.02em",
  lineHeight: 1.2,
  margin: 0,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});

let ticketsModalBodyStyle = css({
  background:
    "radial-gradient(ellipse 64% 60% at 50% 50%, light-dark(rgb(255 255 255), rgb(10 29 39 / 0.9)) 18%, transparent 100%)",
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
  padding: "24px 24px 32px",
  width: "100%",
  "@media (max-width: 640px)": {
    padding: "16px 16px 24px",
  },
});
