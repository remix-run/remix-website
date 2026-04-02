import cx from "clsx";
import { addEventListeners, clientEntry, type Handle } from "remix/component";
import assets from "./jam-scramble-text.tsx?assets=client";

const SCRAMBLE_CHARS =
  "!@#$%^&*(){}[]<>~`'\",.?/\\|=+-_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type ScrambleColor = "blue" | "green" | "yellow";

const colorMap: Record<ScrambleColor, string> = {
  blue: "text-blue-brand",
  green: "text-green-brand",
  yellow: "text-yellow-brand",
};

type ScrambleState = {
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

export let JamScrambleText = clientEntry(
  `${assets.entry}#JamScrambleText`,
  (handle: Handle, setup: ScrambleSetup) => {
    let text = setup.text;
    let animationKey = getAnimationKey(text);
    let textChars = text.split("");
    let delay = setup.delay ?? 0;
    let color = setup.color ?? "blue";
    let cyclesToResolve = setup.cyclesToResolve ?? 10;
    let charDelay = setup.charDelay ?? 100;
    let cycleDelay = setup.cycleDelay ?? 50;
    let state = playedAnimations.has(animationKey)
      ? getResolvedState(text)
      : getInitialState(text);
    let timers: number[] = [];

    let cleanupTimers = () => {
      for (let timerId of timers) {
        window.clearTimeout(timerId);
        window.clearInterval(timerId);
      }
      timers = [];
    };

    let startAnimation = () => {
      cleanupTimers();
      if (handle.signal.aborted) return;
      playedAnimations.add(animationKey);
      state = getInitialState(text);
      handle.update();

      for (let charIndex = 0; charIndex < text.length; charIndex++) {
        let revealTimer = window.setTimeout(
          () => {
            if (handle.signal.aborted) return;
            if (!state[charIndex]) return;

            state[charIndex] = {
              visible: true,
              iteration: 0,
              resolved: false,
            };
            handle.update();

            let iteration = 0;
            let cycleTimer = window.setInterval(() => {
              if (handle.signal.aborted) {
                window.clearInterval(cycleTimer);
                return;
              }
              iteration += 1;

              let canProgress =
                charIndex === 0 ||
                state.slice(0, charIndex).every((item) => item.resolved);
              if (!canProgress) return;

              if (!state[charIndex]) return;

              if (iteration >= cyclesToResolve) {
                window.clearInterval(cycleTimer);
                state[charIndex] = {
                  visible: true,
                  iteration,
                  resolved: true,
                };
              } else {
                state[charIndex] = {
                  visible: true,
                  iteration,
                  resolved: false,
                };
              }
              handle.update();
            }, cycleDelay);

            timers.push(cycleTimer);
          },
          delay + charIndex * charDelay,
        );

        timers.push(revealTimer);
      }
    };

    handle.queueTask((signal) => {
      if (signal.aborted || handle.signal.aborted) return;

      let cleanupOnPageHide = () => cleanupTimers();
      addEventListeners(window, handle.signal, {
        pagehide: cleanupOnPageHide,
      });
      handle.signal.addEventListener(
        "abort",
        () => {
          cleanupTimers();
        },
        { once: true },
      );
      let prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReducedMotion) {
        cleanupTimers();
        playedAnimations.add(animationKey);
        state = getResolvedState(text);
        handle.update();
        return;
      }
      if (playedAnimations.has(animationKey)) {
        cleanupTimers();
        state = getResolvedState(text);
        handle.update();
        return;
      }
      startAnimation();
    });

    return (props: { className?: string }) => {
      return (
        <>
          <span class="sr-only">{text}</span>
          <span class={props.className} aria-hidden="true">
            {textChars.map((char, index) => {
              let current = state[index];
              let visible = current?.visible ?? false;
              let resolved = current?.resolved ?? false;
              let iteration = current?.iteration ?? 0;
              let displayChar = resolved
                ? char
                : visible
                  ? getScrambledLetter(char, iteration, cyclesToResolve)
                  : char;

              return (
                <span
                  key={index}
                  class={cx(
                    visible ? "opacity-100" : "opacity-0",
                    resolved ? "text-white" : colorMap[color],
                  )}
                >
                  {displayChar}
                </span>
              );
            })}
          </span>
        </>
      );
    };
  },
);
