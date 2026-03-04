import clsx from "clsx";
import { clientEntry, type Handle } from "remix/component";
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
  (handle: Handle) => {
    let state: ScrambleState[] = [];
    let sequenceKey = "";
    let started = false;
    let timers: number[] = [];

    let cleanupTimers = () => {
      for (let timerId of timers) {
        window.clearTimeout(timerId);
        window.clearInterval(timerId);
      }
      timers = [];
    };

    let startAnimation = (config: {
      text: string;
      delay: number;
      cyclesToResolve: number;
      charDelay: number;
      cycleDelay: number;
    }) => {
      cleanupTimers();
      state = getInitialState(config.text);
      handle.update();

      for (let charIndex = 0; charIndex < config.text.length; charIndex++) {
        let revealTimer = window.setTimeout(
          () => {
            if (!state[charIndex]) return;

            state[charIndex] = {
              visible: true,
              iteration: 0,
              resolved: false,
            };
            handle.update();

            let iteration = 0;
            let cycleTimer = window.setInterval(() => {
              iteration += 1;

              let canProgress =
                charIndex === 0 ||
                state.slice(0, charIndex).every((item) => item.resolved);
              if (!canProgress) return;

              if (!state[charIndex]) return;

              if (iteration >= config.cyclesToResolve) {
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
            }, config.cycleDelay);

            timers.push(cycleTimer);
          },
          config.delay + charIndex * config.charDelay,
        );

        timers.push(revealTimer);
      }
    };

    handle.queueTask(() => {
      handle.on(window, {
        pagehide() {
          cleanupTimers();
        },
      });
    });

    return (props: {
      text: string;
      delay?: number;
      color?: ScrambleColor;
      className?: string;
      cyclesToResolve?: number;
      charDelay?: number;
      cycleDelay?: number;
    }) => {
      let delay = props.delay ?? 0;
      let color = props.color ?? "blue";
      let cyclesToResolve = props.cyclesToResolve ?? 10;
      let charDelay = props.charDelay ?? 100;
      let cycleDelay = props.cycleDelay ?? 50;
      let key = [
        props.text,
        delay,
        color,
        cyclesToResolve,
        charDelay,
        cycleDelay,
      ].join("|");

      if (key !== sequenceKey) {
        sequenceKey = key;
        started = false;
        state = getInitialState(props.text);
      }

      if (!started) {
        started = true;
        let config = {
          text: props.text,
          delay,
          cyclesToResolve,
          charDelay,
          cycleDelay,
        };
        handle.queueTask(() => {
          let prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          if (prefersReducedMotion) {
            cleanupTimers();
            state = getResolvedState(config.text);
            handle.update();
            return;
          }
          startAnimation(config);
        });
      }

      return (
        <>
          <span class="sr-only">{props.text}</span>
          <span class={props.className} aria-hidden="true">
            {props.text.split("").map((char, index) => {
              let current = state[index];
              let visible = current?.visible ?? false;
              let resolved = current?.resolved ?? false;
              let iteration = current?.iteration ?? 0;
              let displayChar = visible
                ? getScrambledLetter(char, iteration, cyclesToResolve)
                : char;

              return (
                <span
                  key={index}
                  class={clsx(
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
