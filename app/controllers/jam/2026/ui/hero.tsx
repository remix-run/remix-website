import { css } from "remix/ui";
import { theme } from "remix/ui/theme";
import { textBoxTrim, visuallyHiddenStyle } from "../../../../ui/css-mixins.ts";
import { breakpointMedia } from "../../../../ui/theme.ts";
import { Wordmark } from "../../../../ui/wordmark.tsx";
import { jamTheme } from "../theme.ts";
import {
  jam2026WindowBodyStyle,
  jam2026WindowSurfaceStyle,
  jam2026WindowTitleStyle,
} from "./window-styles.ts";

export function Jam2026Hero() {
  return () => (
    <section mix={heroStyle}>
      <div mix={heroVisualStyle}>
        <div mix={heroStackStyle}>
          <div mix={brandStackStyle}>
            <Wordmark
              aria-hidden
              mix={[
                remixWordmarkStyle,
                heroLineEntranceStyle,
                heroLineEntranceDelayStyle(120),
              ]}
            />
            <JamMark />
          </div>

          <h1 mix={visuallyHiddenStyle}>Remix Jam 2026</h1>

          <div
            mix={[
              eventDetailsStyle,
              heroLineEntranceStyle,
              heroLineEntranceDelayStyle(430),
            ]}
          >
            <p mix={[eventDetailStyle, eventDetailLeftStyle]}>
              <span mix={eventDetailPlainLineStyle}>Start your engines</span>
              <span mix={eventDetailPlainLineStyle}>October 2</span>
            </p>
            <YearBadge />
            <p mix={[eventDetailStyle, eventDetailRightStyle]}>
              <span mix={eventDetailPlainLineStyle}>
                For a grand Remix showcase
              </span>
              <span mix={eventDetailPlainLineStyle}>Toronto</span>
            </p>
          </div>
        </div>
      </div>

      <div mix={storyStyle}>
        <h2 mix={[storyHeadingStyle, conferenceHeadingStyle]}>
          The Remix team's annual conference returns to Toronto to show off
          Remix 3.
        </h2>

        <div mix={[storyNoteStyle, jam2026WindowSurfaceStyle, readmeNoteStyle]}>
          <p mix={jam2026WindowTitleStyle}>README.MD</p>
          <div mix={jam2026WindowBodyStyle}>
            <p mix={storyCopyStyle}>
              Remix Jam is back, and we're putting Remix 3 through its paces.
              <br />
              <br />
              Come hear from the team about the features, modules, and ideas
              that make Remix our favorite all-in-one JavaScript framework.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function JamMark() {
  return () => (
    <svg
      aria-hidden="true"
      viewBox="0 0 1119 284"
      xmlns="http://www.w3.org/2000/svg"
      mix={[
        jamMarkStyle,
        heroLineEntranceStyle,
        heroLineEntranceDelayStyle(260),
      ]}
    >
      <path
        d="M406.298 0L394.532 54.7714H361.361C358.053 54.7714 355.196 57.0879 354.512 60.325L322.011 214.217C312.679 257.223 279.411 284 235.999 284H41.4128C11.7956 284 -4.83868 264.12 1.24704 234.503L10.1728 193.526C16.2585 163.909 42.2242 143.623 71.4356 143.623H168.503L156.737 198.394H77.927C72.6527 198.394 69.407 201.234 68.1899 206.509L64.9442 221.114C63.727 226.389 66.1613 229.229 71.4356 229.229H247.765C247.765 229.229 257.908 228.417 260.342 218.274C262.433 209.565 286.361 95.2543 293.082 63.1217C293.991 58.7738 290.656 54.7714 286.214 54.7714H197.535L209.301 0L406.298 0Z"
        mix={jamPathStyle}
      />
      <path
        d="M374.449 283.189C344.832 283.189 327.792 263.309 334.283 233.691L355.381 132.669C361.872 103.051 387.432 82.7657 417.049 82.7657H550.661C585.552 82.7657 607.461 100.211 615.169 130.64L635.455 216.651C637.078 221.926 640.323 224.36 646.003 224.36H646.815C654.523 224.36 658.581 219.491 657.363 212.594L624.906 62.48C623.689 57.2057 620.443 54.7714 614.763 54.7714H412.181L423.946 0H622.878C655.335 0 678.055 15.0114 686.169 50.7143L720.655 199.206C731.609 245.051 696.718 283.189 647.626 283.189H635.861C607.866 283.189 582.306 272.234 575.003 238.56L554.312 145.246C553.095 139.971 549.443 137.537 543.763 137.537H425.569C419.078 137.537 414.615 141.189 413.398 147.68L398.386 218.274C396.763 224.766 399.603 228.417 406.095 228.417H564.151L552.791 283.189H374.449Z"
        mix={jamPathStyle}
      />
      <path
        d="M756.887 284H820.279L766.015 64.1029C764.798 58.8286 766.827 55.9886 772.101 55.9886C775.752 55.9886 779.404 58.4229 781.432 62.8857L814.295 133.48C833.364 174.457 857.706 195.96 897.061 195.554H927.097C966.451 195.554 981.868 174.457 983.896 133.48L986.736 61.6686C987.142 56.8 989.982 54.7714 994.851 54.7714C998.908 54.7714 1001.75 57.6114 1002.97 62.8857L1055.1 284H1118.49L1060.98 49.9029C1054.9 20.2857 1028.93 0 999.719 0H966.856C942.514 0 927.502 12.5772 925.879 42.6L923.039 123.337C922.634 134.697 916.142 140.783 904.376 140.783H897.467C885.701 140.783 876.369 134.697 871.095 123.337L833.364 43.4114C818.352 12.9829 797.661 1.21715 774.941 1.21715H742.484C712.866 1.21715 695.826 21.5029 702.318 51.12L756.887 284Z"
        mix={jamPathStyle}
      />
    </svg>
  );
}

function YearBadge() {
  return () => (
    <svg
      aria-hidden="true"
      viewBox="0 0 151.494 29.424"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      mix={yearBadgeStyle}
    >
      <path
        d="M142.566 10.752C146.934 10.752 149.478 14.304 148.326 18.624L147.558 21.552C146.358 25.872 141.942 29.424 137.574 29.424H120.006C115.014 29.424 112.086 25.344 113.382 20.4L116.454 9.024C117.798 4.032 122.886 0 127.878 0H151.494L149.382 7.824H130.902C129.414 7.824 127.878 9.072 127.494 10.56L127.398 10.752H142.566ZM126.006 21.552H134.646C135.462 21.552 136.278 20.88 136.518 20.064C136.71 19.296 136.23 18.624 135.414 18.624H125.286L124.902 20.064C124.71 20.88 125.19 21.552 126.006 21.552Z"
        mix={yearBadgePathStyle}
      />
      <path
        d="M88.0215 21.552H109.382L107.27 29.376H74.4375L77.3175 18.624C78.4695 14.304 82.9335 10.752 87.3015 10.752H99.1095C99.9255 10.752 100.79 10.128 100.982 9.312C101.222 8.496 100.741 7.824 99.9255 7.824H80.1975L82.3095 0H107.077C111.398 0 113.99 3.504 112.838 7.824L112.021 10.752C110.87 15.12 106.406 18.624 102.086 18.624H90.2775C89.4615 18.624 88.6455 19.296 88.4535 20.112L88.4055 20.064L88.0215 21.552Z"
        mix={yearBadgePathStyle}
      />
      <path
        d="M55.2657 0H67.5057C73.6017 0 77.2497 4.992 75.6177 11.136L73.6977 18.288C72.0657 24.432 65.7297 29.424 59.5857 29.424H47.3937C41.2497 29.424 37.6017 24.432 39.2817 18.288L41.2017 11.136C42.8337 4.992 49.1217 0 55.2657 0ZM62.5617 17.232L63.9057 12.144C64.5297 9.792 63.1377 7.824 60.7377 7.824H57.8097C55.4097 7.824 52.9617 9.792 52.3377 12.144L50.9937 17.232C50.3217 19.632 51.7617 21.552 54.1617 21.552H57.0897C59.4417 21.552 61.8897 19.632 62.5617 17.232Z"
        mix={yearBadgePathStyle}
      />
      <path
        d="M13.584 21.552H34.944L32.832 29.376H0L2.88 18.624C4.032 14.304 8.496 10.752 12.864 10.752H24.672C25.488 10.752 26.352 10.128 26.544 9.312C26.784 8.496 26.304 7.824 25.488 7.824H5.76L7.872 0H32.64C36.96 0 39.552 3.504 38.4 7.824L37.584 10.752C36.432 15.12 31.968 18.624 27.648 18.624H15.84C15.024 18.624 14.208 19.296 14.016 20.112L13.968 20.064L13.584 21.552Z"
        mix={yearBadgePathStyle}
      />
    </svg>
  );
}

function heroLineEntranceDelayStyle(delay: number) {
  return css({ animationDelay: `${delay}ms` });
}

let heroLineEntranceStyle = css({
  animation:
    "jam-2026-hero-line-fade-up 980ms cubic-bezier(0.16, 1, 0.3, 1) both",
  position: "relative",
  willChange: "opacity, transform",
  "@keyframes jam-2026-hero-line-fade-up": {
    "0%": {
      opacity: 0,
      transform: "translateY(26px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
    opacity: 1,
    transform: "none",
  },
});

let heroStyle = css({
  position: "relative",
  overflow: "clip",
  color: jamTheme.ink,
});

let heroVisualStyle = css({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  minHeight: "560px",
  paddingBlock: "96px 40px",
  paddingInline: "14px",
  [breakpointMedia.sm]: {
    minHeight: "640px",
    paddingInline: "32px",
  },
  [breakpointMedia.lg]: {
    minHeight: 0,
    paddingInline: "max(32px, 5vw)",
  },
  [breakpointMedia.xl]: {
    height: "760px",
    paddingBlock: "96px 72px",
  },
});

let heroStackStyle = css({
  width: "100%",
  maxWidth: "1920px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "48px",
});

let brandStackStyle = css({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "48px",
});

let remixWordmarkStyle = css({
  position: "relative",
  zIndex: 1,
  width: "clamp(10.75rem, 15.25vw, 15.25rem)",
  height: "clamp(1.06rem, 1.5vw, 1.5rem)",
  color: jamTheme.ink,
  [breakpointMedia.sm]: {
    transform: "none",
  },
});

let jamMarkStyle = css({
  position: "relative",
  zIndex: -1,
  display: "block",
  width: "calc(100vw - 48px)",
  maxWidth: "none",
  height: "auto",
  overflow: "visible",
  [breakpointMedia.sm]: {
    width: "100%",
  },
});

let jamPathStyle = css({
  fill: jamTheme.ink,
});

let eventDetailsStyle = css({
  position: "relative",
  display: "grid",
  gridTemplateColumns: "1fr",
  alignItems: "center",
  justifyContent: "center",
  justifyItems: "center",
  gap: "22px",
  color: jamTheme.ink,
  textAlign: "center",
  zIndex: 1,
  [breakpointMedia.lg]: {
    gridTemplateColumns: "minmax(0, 320px) auto minmax(0, 320px)",
    gap: "clamp(28px, 2.4vw, 44px)",
    justifyItems: "stretch",
    width: "min(100%, 920px)",
  },
});

let eventDetailStyle = css({
  display: "flex",
  flexDirection: "column",
  justifySelf: "center",
  margin: 0,
  fontFamily: theme.fontFamily.mono,
  fontSize: "12px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "0.06em",
  lineHeight: 1.6,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  [breakpointMedia.lg]: {
    fontSize: "14px",
    letterSpacing: "0.18em",
    lineHeight: 1.85,
  },
});

let eventDetailLeftStyle = css({
  [breakpointMedia.lg]: {
    alignItems: "flex-end",
    justifySelf: "end",
    textAlign: "right",
  },
});

let eventDetailRightStyle = css({
  [breakpointMedia.lg]: {
    alignItems: "flex-start",
    justifySelf: "start",
    textAlign: "left",
  },
});

let eventDetailPlainLineStyle = css({
  display: "block",
  [breakpointMedia.lg]: {
    textAlign: "inherit",
  },
});

let yearBadgeStyle = css({
  display: "inline-flex",
  boxSizing: "content-box",
  border: `6px solid ${jamTheme.ink}`,
  borderRadius: "1rem",
  padding: "1rem",
  overflow: "visible",
  color: jamTheme.ink,
  width: "9rem",
  height: "1.75rem",
  [breakpointMedia.lg]: {
    width: "165px",
    height: "32px",
  },
});

let yearBadgePathStyle = css({
  fill: "currentColor",
});

let storyNarrowMedia = "@media (max-width: 980px)" as const;
let storyTabletMedia =
  "@media (min-width: 601px) and (max-width: 980px)" as const;

let storyStyle = css({
  position: "relative",
  zIndex: 1,
  width: "100%",
  maxWidth: "1920px",
  minHeight: 0,
  marginInline: "auto",
  display: "grid",
  gridTemplateColumns:
    "minmax(32px, 0.47fr) minmax(0, 2.12fr) minmax(24px, 0.71fr) minmax(0, 2.53fr) minmax(24px, 0.71fr) minmax(0, 2.12fr) minmax(32px, 0.47fr)",
  paddingBlock: "88px 120px",
  [storyNarrowMedia]: {
    display: "block",
    paddingBlock: "64px 88px",
    paddingInline: "24px",
  },
  [storyTabletMedia]: {
    display: "grid",
    columnGap: "24px",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    rowGap: "48px",
  },
});

let storyHeadingStyle = css({
  margin: 0,
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "clamp(48px, 4.07vw, 57px)",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "-0.03em",
  lineHeight: "clamp(56px, 4.71vw, 66px)",
  textAlign: "left",
  textTransform: "none",
  ...textBoxTrim,
  [storyNarrowMedia]: {
    fontSize: "clamp(28px, 5.5vw, 40px)",
    lineHeight: 1.1,
  },
});

let conferenceHeadingStyle = css({
  gridColumn: "2 / 6",
  gridRow: 1,
  [storyTabletMedia]: {
    gridColumn: 1,
    gridRow: 1,
  },
});

let storyNoteStyle = css({
  alignSelf: "start",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  [storyNarrowMedia]: {
    maxWidth: "520px",
    marginBlockStart: "32px",
  },
  [storyTabletMedia]: {
    maxWidth: "none",
    marginBlockStart: 0,
  },
});

let readmeNoteStyle = css({
  gridColumn: 6,
  gridRow: 1,
  marginBlockStart: "-48px",
  [storyNarrowMedia]: {
    marginBlockStart: "32px",
  },
  [storyTabletMedia]: {
    gridColumn: 2,
    gridRow: 1,
    marginBlockStart: 0,
  },
});

let storyCopyStyle = css({
  margin: 0,
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "16px",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "-0.01em",
  lineHeight: "1.6em",
  textAlign: "left",
  textTransform: "none",
  ...textBoxTrim,
});
