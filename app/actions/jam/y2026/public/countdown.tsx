import { prefersReducedMotion } from "@remix-run/ui/animation";
import { css, type Handle } from "remix/component";
import { theme } from "../../../../ui/public/styles/theme.ts";

import {
  advanceIntroCountdown,
  advanceLiveCountdown,
  countdownUnits,
  getJam2026Countdown,
  initialCountdownState,
  introTickCount,
  type CountdownState,
} from "./countdown-state.ts";
import { jamTheme } from "./theme.ts";

export function Jam2026Countdown(handle: Handle) {
  let countdown = initialCountdownState;

  function apply(next: CountdownState | undefined) {
    if (!next) return;
    countdown = next;
    handle.update();
  }

  handle.queueTask(() => {
    startCountdownTimers({
      signal: handle.signal,
      skipIntro: prefersReducedMotion(),
      onIntroTick: (tick) =>
        apply(advanceIntroCountdown(countdown, getJam2026Countdown(), tick)),
      onLiveTick: () =>
        apply(advanceLiveCountdown(countdown, getJam2026Countdown())),
    });
  });

  return () => (
    <div
      aria-label="Remix Jam starts October 2, 2026 at 9:00 AM Eastern time"
      mix={jam2026CountdownStyle}
    >
      <span aria-hidden="true" mix={jam2026CountdownDisplayStyle}>
        {countdownUnits.map((unit) => {
          let value = countdown.values[unit];
          let flip = countdown.flips[unit];
          return (
            <span key={unit} mix={jam2026CountdownPairStyle}>
              <strong>
                <span aria-hidden="true" mix={jam2026CountdownNumberStyle}>
                  {value.split("").map((digit, index) => (
                    <span
                      key={`${unit}-${index}-${digit}-${flip}`}
                      mix={jam2026CountdownDigitStyle}
                    >
                      {digit}
                    </span>
                  ))}
                </span>
              </strong>
              <span>{unit}</span>
            </span>
          );
        })}
        <span mix={jam2026CountdownLabelStyle}>remaining</span>
      </span>
    </div>
  );
}

/**
 * Runs the 150ms intro ticks (unless skipped), then a 1s live tick. All timers
 * are cleared when `signal` aborts.
 */
function startCountdownTimers({
  signal,
  skipIntro,
  onIntroTick,
  onLiveTick,
}: {
  signal: AbortSignal;
  skipIntro: boolean;
  onIntroTick: (tick: number) => void;
  onLiveTick: () => void;
}) {
  let introInterval: number | undefined;
  let liveInterval: number | undefined;

  let startLive = () => {
    onLiveTick();
    liveInterval = window.setInterval(onLiveTick, 1000);
  };

  if (skipIntro) {
    startLive();
  } else {
    let introTick = 0;
    introInterval = window.setInterval(() => {
      introTick += 1;
      onIntroTick(introTick);

      if (introTick >= introTickCount) {
        window.clearInterval(introInterval);
        startLive();
      }
    }, 150);
  }

  signal.addEventListener(
    "abort",
    () => {
      if (introInterval !== undefined) window.clearInterval(introInterval);
      if (liveInterval) window.clearInterval(liveInterval);
    },
    { once: true },
  );
}

let jam2026CountdownStyle = css({
  alignItems: "center",
  display: "none",
  height: "100%",
  minWidth: 0,
  overflow: "hidden",
  paddingLeft: "16px",
  "@media (min-width: 980px)": {
    display: "flex",
  },
});

let jam2026CountdownDisplayStyle = css({
  alignItems: "center",
  display: "flex",
  height: "100%",
});

let jam2026CountdownPairStyle = css({
  alignItems: "center",
  display: "inline-flex",
  gap: "16px",
  height: "100%",
  marginRight: "16px",
  perspective: "120px",
  "& strong": {
    color: jamTheme.ink,
    fontFamily: theme.fontFamily.mono,
    fontSize: "11px",
    fontWeight: theme.fontWeight.bold,
    lineHeight: 1,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  "& > span": {
    color: jamTheme.textMuted,
    fontFamily: theme.fontFamily.mono,
    fontSize: "11px",
    lineHeight: 1,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  "&:first-child strong > span": { minWidth: "3ch" },
});

let jam2026CountdownNumberStyle = css({
  display: "inline-flex",
  justifyContent: "flex-end",
  minWidth: "2ch",
});

let jam2026CountdownDigitStyle = css({
  animation:
    "jam-2026-countdown-flip 760ms cubic-bezier(0.22, 1, 0.36, 1), jam-2026-countdown-flip-opacity 280ms ease-out",
  backfaceVisibility: "hidden",
  color: jamTheme.ink,
  display: "inline-block",
  minWidth: "1ch",
  textAlign: "center",
  transformOrigin: "50% 55%",
  transformStyle: "preserve-3d",
  willChange: "transform",
  "@keyframes jam-2026-countdown-flip": {
    "0%": {
      transform: "rotateX(-88deg) translateY(-2px) scale(0.985)",
    },
    "52%": {
      transform: "rotateX(7deg) translateY(0) scale(1.008)",
    },
    "76%": {
      transform: "rotateX(-2deg) translateY(0) scale(1)",
    },
    "100%": {
      transform: "rotateX(0deg) translateY(0) scale(1)",
    },
  },
  "@keyframes jam-2026-countdown-flip-opacity": {
    "0%": {
      opacity: 0.75,
    },
    "100%": {
      opacity: 1,
    },
  },
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
});

let jam2026CountdownLabelStyle = css({
  color: jamTheme.textMuted,
  fontFamily: theme.fontFamily.mono,
  fontSize: "11px",
  lineHeight: 1,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});
