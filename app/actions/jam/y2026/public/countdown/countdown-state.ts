const EVENT_START = new Date("2026-10-02T09:00:00-04:00").getTime();
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export type CountdownValue = {
  days: string;
  hrs: string;
  min: string;
  sec: string;
};

export type CountdownUnit = keyof CountdownValue;

export type CountdownState = {
  values: CountdownValue;
  flips: Record<CountdownUnit, number>;
};

export const countdownUnits: CountdownUnit[] = ["days", "hrs", "min", "sec"];

export const initialCountdownState: CountdownState = {
  values: { days: "000", hrs: "00", min: "00", sec: "00" },
  flips: { days: 0, hrs: 0, min: 0, sec: 0 },
};

// Each unit starts flipping on its own tick and lands on the live value after
// its last flip, so the digits settle left to right.
const introFlipPlan: Record<CountdownUnit, { startAt: number; flips: number }> =
  {
    days: { startAt: 0, flips: 5 },
    hrs: { startAt: 1, flips: 5 },
    min: { startAt: 2, flips: 6 },
    sec: { startAt: 3, flips: 6 },
  };

export const introTickCount = Math.max(
  ...Object.values(introFlipPlan).map(({ startAt, flips }) => startAt + flips),
);

export function getJam2026Countdown(now = Date.now()): CountdownValue {
  let remaining = Math.max(EVENT_START - now, 0);

  return {
    days: formatCountdownUnit("days", Math.floor(remaining / DAY)),
    hrs: formatCountdownUnit("hrs", Math.floor((remaining % DAY) / HOUR)),
    min: formatCountdownUnit("min", Math.floor((remaining % HOUR) / MINUTE)),
    sec: formatCountdownUnit("sec", Math.floor((remaining % MINUTE) / SECOND)),
  };
}

/**
 * Moves to the live countdown, bumping the flip counter of every unit whose
 * digits changed. Returns `undefined` when nothing changed.
 */
export function advanceLiveCountdown(
  state: CountdownState,
  live: CountdownValue,
): CountdownState | undefined {
  let changed = countdownUnits.filter(
    (unit) => live[unit] !== state.values[unit],
  );
  if (changed.length === 0) return undefined;

  let flips = { ...state.flips };
  for (let unit of changed) flips[unit] += 1;
  return { values: live, flips };
}

/**
 * Advances the intro animation by one tick (1-based): every unit inside its
 * flip window climbs a random step toward the live value, reaching it exactly
 * on its final flip. Returns `undefined` when no unit flips on this tick.
 */
export function advanceIntroCountdown(
  state: CountdownState,
  live: CountdownValue,
  tick: number,
  random: () => number = Math.random,
): CountdownState | undefined {
  let values = { ...state.values };
  let flips = { ...state.flips };
  let changed = false;

  for (let unit of countdownUnits) {
    let plan = introFlipPlan[unit];
    let unitTick = tick - plan.startAt;
    if (unitTick <= 0 || unitTick > plan.flips) continue;

    values[unit] = getIntroCountdownValue(
      unit,
      Number(values[unit]),
      Number(live[unit]),
      plan.flips - unitTick + 1,
      random,
    );
    flips[unit] += 1;
    changed = true;
  }

  return changed ? { values, flips } : undefined;
}

function getIntroCountdownValue(
  unit: CountdownUnit,
  current: number,
  target: number,
  turnsRemaining: number,
  random: () => number,
) {
  let remaining = target - current;
  if (remaining <= 0 || turnsRemaining <= 1) {
    return formatCountdownUnit(unit, target);
  }

  let minStep = Math.ceil(remaining / turnsRemaining);
  let maxStep = Math.max(minStep, remaining - (turnsRemaining - 1));
  let nextValue =
    current + minStep + Math.floor(random() * (maxStep - minStep + 1));

  return formatCountdownUnit(unit, Math.min(nextValue, target));
}

function formatCountdownUnit(unit: CountdownUnit, value: number) {
  return String(value).padStart(unit === "days" ? 3 : 2, "0");
}
