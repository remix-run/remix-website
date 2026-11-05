import { prefersReducedMotion } from "@remix-run/ui/animation";
import { clientEntry, css, type Handle } from "remix/component";

import { theme } from "../../../../ui/public/styles/theme.ts";
import { jamColors } from "./theme.ts";

const SCRAMBLE_CHARS =
  "!@#$%^&*(){}[]<>~`'\",.?/\\|=+-_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type ScrambleColor = "blue" | "green" | "yellow";

export type ScrambleState = {
  visible: boolean;
  iteration: number;
  resolved: boolean;
};

type ScrambleSetup = {
  text: string;
  delay?: number;
  color?: ScrambleColor;
  cyclesToResolve?: number;
  charDelay?: number;
  cycleDelay?: number;
};

type ScrambleTiming = {
  delay: number;
  charDelay: number;
  cycleDelay: number;
  cyclesToResolve: number;
};

type JamScrambleTextProps = ScrambleSetup & {
  nowrap?: boolean;
};

let playedAnimations = new Set<string>();
let activePathname: string | null = null;

function syncPlayedAnimationsPathname() {
  if (typeof window === "undefined") return;
  if (activePathname === window.location.pathname) return;

  activePathname = window.location.pathname;
  playedAnimations.clear();
}

function getAnimationKey(text: string) {
  if (typeof window === "undefined") return text;
  syncPlayedAnimationsPathname();
  return `${window.location.pathname}::${text}`;
}

export let JamScrambleText = clientEntry(
  import.meta.url,
  function JamScrambleText(handle: Handle<JamScrambleTextProps>) {
    let text = handle.props.text;
    let animationKey = getAnimationKey(text);
    let textChars = text.split("");
    let cyclesToResolve = handle.props.cyclesToResolve ?? 10;
    let timing: ScrambleTiming = {
      delay: handle.props.delay ?? 0,
      charDelay: handle.props.charDelay ?? 100,
      cycleDelay: handle.props.cycleDelay ?? 50,
      cyclesToResolve,
    };
    let state = playedAnimations.has(animationKey)
      ? getResolvedState(text)
      : getInitialState(text);
    let cancelScramble = () => {};

    handle.queueTask((signal) => {
      if (signal.aborted || handle.signal.aborted) return;

      window.addEventListener("pagehide", () => cancelScramble(), {
        signal: handle.signal,
      });
      handle.signal.addEventListener("abort", () => cancelScramble(), {
        once: true,
      });

      let alreadyPlayed = playedAnimations.has(animationKey);
      playedAnimations.add(animationKey);
      if (alreadyPlayed || prefersReducedMotion()) {
        state = getResolvedState(text);
        handle.update();
        return;
      }

      state = getInitialState(text);
      handle.update();
      cancelScramble = scheduleScramble(state, timing, handle.signal, () =>
        handle.update(),
      );
    });

    return () => (
      <>
        <span mix={visuallyHiddenStyle}>{text}</span>
        <span
          mix={handle.props.nowrap ? nowrapStyle : undefined}
          aria-hidden="true"
        >
          {textChars.map((char, index) => {
            let current = state[index];
            return (
              <span
                key={index}
                mix={[
                  current?.visible ? visibleStyle : hiddenStyle,
                  current?.resolved
                    ? resolvedStyle
                    : colorStyles[handle.props.color ?? "blue"],
                ]}
              >
                {getDisplayChar(char, current, cyclesToResolve)}
              </span>
            );
          })}
        </span>
      </>
    );
  },
);

/**
 * Starts the per-character timers: each character fades in `charDelay` after the
 * previous one, then cycles through scramble glyphs every `cycleDelay` until it
 * resolves (only once every character before it has resolved). Mutates `state`
 * in place and calls `onChange` after each step. Returns a cancel function.
 */
function scheduleScramble(
  state: ScrambleState[],
  { delay, charDelay, cycleDelay, cyclesToResolve }: ScrambleTiming,
  signal: AbortSignal,
  onChange: () => void,
) {
  let timers: number[] = [];

  let revealChar = (charIndex: number) => {
    if (signal.aborted) return;
    state[charIndex] = { visible: true, iteration: 0, resolved: false };
    onChange();

    let iteration = 0;
    let cycleTimer = window.setInterval(() => {
      if (signal.aborted) {
        window.clearInterval(cycleTimer);
        return;
      }
      iteration += 1;

      let next = advanceScrambleChar(
        state,
        charIndex,
        iteration,
        cyclesToResolve,
      );
      if (!next) return;
      if (next.resolved) window.clearInterval(cycleTimer);
      state[charIndex] = next;
      onChange();
    }, cycleDelay);
    timers.push(cycleTimer);
  };

  for (let charIndex = 0; charIndex < state.length; charIndex++) {
    timers.push(
      window.setTimeout(
        () => revealChar(charIndex),
        delay + charIndex * charDelay,
      ),
    );
  }

  return () => {
    for (let timerId of timers) {
      window.clearTimeout(timerId);
      window.clearInterval(timerId);
    }
    timers = [];
  };
}

/**
 * Next state for a revealed character on scramble cycle `iteration`, or `null`
 * while an earlier character is still unresolved (characters resolve in order).
 */
export function advanceScrambleChar(
  state: ScrambleState[],
  charIndex: number,
  iteration: number,
  cyclesToResolve: number,
): ScrambleState | null {
  let canProgress = state.slice(0, charIndex).every((item) => item.resolved);
  if (!canProgress) return null;
  return { visible: true, iteration, resolved: iteration >= cyclesToResolve };
}

/** Glyph to show for `char`: a deterministic scramble glyph while it is visible but unresolved. */
export function getDisplayChar(
  char: string,
  current: ScrambleState | undefined,
  cyclesToResolve: number,
) {
  if (!current?.visible || current.resolved) return char;
  return getScrambledLetter(char, current.iteration, cyclesToResolve);
}

function getScrambledLetter(
  targetChar: string,
  iteration: number,
  maxIterations: number,
) {
  if (iteration >= maxIterations) return targetChar;

  let charCode = targetChar.charCodeAt(0);
  let start = (charCode * 7) % SCRAMBLE_CHARS.length;
  let position = (start + iteration * 11) % SCRAMBLE_CHARS.length;
  return SCRAMBLE_CHARS[position];
}

function getInitialState(text: string): ScrambleState[] {
  return text
    .split("")
    .map(() => ({ visible: false, iteration: 0, resolved: false }));
}

function getResolvedState(text: string): ScrambleState[] {
  return text
    .split("")
    .map(() => ({ visible: true, iteration: 0, resolved: true }));
}

let visuallyHiddenStyle = css({
  position: "absolute",
  width: "1px",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
});

let nowrapStyle = css({ whiteSpace: "nowrap" });
let visibleStyle = css({ opacity: 1 });
let hiddenStyle = css({ opacity: 0 });
let resolvedStyle = css({ color: jamColors.white });

let colorStyles = {
  blue: css({ color: theme.colors.brand.blue }),
  green: css({ color: theme.colors.brand.green }),
  yellow: css({ color: theme.colors.brand.yellow }),
} satisfies Record<ScrambleColor, ReturnType<typeof css>>;
