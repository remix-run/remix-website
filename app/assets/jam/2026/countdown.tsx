import { css, type Handle } from "remix/ui";
import { theme } from "remix/ui/theme";

import { jamTheme } from "../../../controllers/jam/2026/theme.ts";

const EVENT_START = new Date("2026-10-01T09:00:00-04:00").getTime();
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

type CountdownValue = {
  days: string;
  hrs: string;
  min: string;
  sec: string;
};

type CountdownUnit = keyof CountdownValue;

type CountdownState = {
  values: CountdownValue;
  flips: Record<CountdownUnit, number>;
};

const countdownUnits: Array<[CountdownUnit, string]> = [
  ["days", "days"],
  ["hrs", "hrs"],
  ["min", "min"],
  ["sec", "sec"],
];

function formatCountdownUnit(unit: CountdownUnit, value: number) {
  return String(value).padStart(unit === "days" ? 3 : 2, "0");
}

function getJam2026Countdown(now = Date.now()): CountdownValue {
  let remaining = Math.max(EVENT_START - now, 0);
  let days = Math.floor(remaining / DAY);
  let hrs = Math.floor((remaining % DAY) / HOUR);
  let min = Math.floor((remaining % HOUR) / MINUTE);
  let sec = Math.floor((remaining % MINUTE) / SECOND);

  return {
    days: formatCountdownUnit("days", days),
    hrs: formatCountdownUnit("hrs", hrs),
    min: formatCountdownUnit("min", min),
    sec: formatCountdownUnit("sec", sec),
  };
}

function getIntroCountdownValue({
  unit,
  currentValue,
  targetValue,
  turnsRemaining,
  random,
}: {
  unit: CountdownUnit;
  currentValue: string;
  targetValue: string;
  turnsRemaining: number;
  random?: () => number;
}) {
  let current = Number(currentValue);
  let target = Number(targetValue);
  let remaining = target - current;

  if (remaining <= 0) return formatCountdownUnit(unit, target);
  if (turnsRemaining <= 1) return formatCountdownUnit(unit, target);

  let minStep = Math.ceil(remaining / turnsRemaining);
  let maxStep = Math.max(minStep, remaining - (turnsRemaining - 1));
  let nextValue =
    current +
    minStep +
    Math.floor((random ?? Math.random)() * (maxStep - minStep + 1));

  return formatCountdownUnit(unit, Math.min(nextValue, target));
}

export function Jam2026Countdown(handle: Handle) {
  let countdown: CountdownState = {
    values: {
      days: "000",
      hrs: "00",
      min: "00",
      sec: "00",
    },
    flips: {
      days: 0,
      hrs: 0,
      min: 0,
      sec: 0,
    },
  };

  function updateCountdownToLive() {
    let liveCountdown = getJam2026Countdown();
    let changed = false;
    let nextFlips = { ...countdown.flips };

    for (let [unit] of countdownUnits) {
      if (liveCountdown[unit] !== countdown.values[unit]) {
        nextFlips[unit] += 1;
        changed = true;
      }
    }

    if (!changed) return;
    countdown = { values: liveCountdown, flips: nextFlips };
    handle.update();
  }

  handle.queueTask(() => {
    let liveInterval: number | undefined;

    let startLiveCountdown = () => {
      updateCountdownToLive();
      liveInterval = window.setInterval(updateCountdownToLive, SECOND);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      startLiveCountdown();
      handle.signal.addEventListener(
        "abort",
        () => {
          if (liveInterval) window.clearInterval(liveInterval);
        },
        { once: true },
      );
      return;
    }

    let introFlipPlan: Record<
      CountdownUnit,
      { startAt: number; flips: number }
    > = {
      days: { startAt: 0, flips: 5 },
      hrs: { startAt: 1, flips: 5 },
      min: { startAt: 2, flips: 6 },
      sec: { startAt: 3, flips: 6 },
    };
    let introFlipCount = Math.max(
      ...Object.values(introFlipPlan).map(
        ({ startAt, flips }) => startAt + flips,
      ),
    );
    let introTick = 0;
    let introInterval = window.setInterval(() => {
      introTick += 1;
      let liveCountdown = getJam2026Countdown();
      let changed = false;
      let nextValues = { ...countdown.values };
      let nextFlips = { ...countdown.flips };

      for (let [unit] of countdownUnits) {
        let { startAt, flips } = introFlipPlan[unit];
        let unitTick = introTick - startAt;

        if (unitTick <= 0 || unitTick > flips) continue;

        nextValues[unit] = getIntroCountdownValue({
          unit,
          currentValue: nextValues[unit],
          targetValue: liveCountdown[unit],
          turnsRemaining: flips - unitTick + 1,
        });
        nextFlips[unit] += 1;
        changed = true;
      }

      if (changed) {
        countdown = { values: nextValues, flips: nextFlips };
        handle.update();
      }

      if (introTick >= introFlipCount) {
        window.clearInterval(introInterval);
        startLiveCountdown();
      }
    }, 150);

    handle.signal.addEventListener(
      "abort",
      () => {
        window.clearInterval(introInterval);
        if (liveInterval) window.clearInterval(liveInterval);
      },
      { once: true },
    );
  });

  return () => (
    <div
      aria-label="Remix Jam starts October 1, 2026 at 9:00 AM Eastern time"
      mix={jam2026CountdownStyle}
    >
      <span aria-hidden="true" mix={jam2026CountdownDisplayStyle}>
        {countdownUnits.map(([unit, label]) => {
          let value = countdown.values[unit];
          let flip = countdown.flips[unit];
          return (
            <span key={label} mix={jam2026CountdownPairStyle}>
              <strong>
                <span
                  aria-hidden="true"
                  data-countdown-number=""
                  mix={jam2026CountdownNumberStyle}
                >
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
              <span>{label}</span>
            </span>
          );
        })}
        <span mix={jam2026CountdownLabelStyle}>remaining</span>
      </span>
    </div>
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
    fontWeight: 700,
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
  "&:first-child [data-countdown-number]": {
    minWidth: "3ch",
  },
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
