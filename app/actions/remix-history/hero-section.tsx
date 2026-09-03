import { css } from "remix/ui";

import { breakpointMedia, theme } from "../../ui/public/theme.ts";

export function HeroSection() {
  return () => (
    <section
      mix={css({
        display: "flex",
        minHeight: "540px",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        overflow: "hidden",
        paddingInline: "48px",
        paddingBottom: "24px",
        [breakpointMedia.md]: { minHeight: "70vh", paddingBottom: "48px" },
        [breakpointMedia.xl]: { minHeight: "80vh" },
      })}
    >
      <div
        mix={css({
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          gap: "48px",
          [breakpointMedia.md]: { gap: "96px" },
        })}
      >
        <div
          mix={css({
            display: "flex",
            width: "100%",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "48px",
            color: "var(--rmx-text-primary)",
            opacity: 0,
            animation:
              "rmx-history-fade-in var(--rmx-hero-fade-duration) ease-out var(--rmx-hero-fade-delay) forwards",
            [breakpointMedia.md]: {
              alignItems: "center",
              gap: "24px",
              textAlign: "center",
            },
            "@media (prefers-reduced-motion: reduce)": {
              animation: "none",
              opacity: 1,
            },
          })}
        >
          <h1
            mix={css({
              fontSize: "1.5rem",
              fontWeight: theme.fontWeight.bold,
              lineHeight: 1.4,
              [breakpointMedia.md]: {
                fontSize: "2.25rem",
                fontWeight: theme.fontWeight.semibold,
                letterSpacing: "-0.025em",
              },
            })}
          >
            The history of Remix
          </h1>
        </div>

        <div
          mix={css({
            position: "relative",
            width: "100%",
            maxWidth: "1600px",
            aspectRatio: "1600 / 367",
            "@media (max-width: 767px)": {
              width: "100vw",
              minWidth: "480px",
              maxWidth: "none",
              marginInline: "-48px",
              aspectRatio: "480 / 110",
            },
          })}
        >
          <img
            src="/marketing/racecar-teaser-hero.webp"
            alt="Racecar under a black sheet with a Remix 3 logo"
            mix={css({
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              objectFit: "cover",
            })}
            width={1600}
            height={367}
          />
        </div>
      </div>
    </section>
  );
}
