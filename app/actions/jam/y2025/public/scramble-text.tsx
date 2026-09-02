import { clientEntry, css, type Handle } from "remix/ui";

import { theme } from "../../../../ui/public/theme.ts";

const SCRAMBLE_CHARS =
  "!@#$%^&*(){}[]<>~`'\",.?/\\|=+-_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type ScrambleColor = "blue" | "green" | "yellow";

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
  import.meta.url,
  function JamScrambleText(handle: Handle<JamScrambleTextProps>) {
    let text = handle.props.text;
    let animationKey = getAnimationKey(text);
    let textChars = text.split("");
    let delay = handle.props.delay ?? 0;
    let cyclesToResolve = handle.props.cyclesToResolve ?? 10;
    let charDelay = handle.props.charDelay ?? 100;
    let cycleDelay = handle.props.cycleDelay ?? 50;
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
      window.addEventListener("pagehide", cleanupOnPageHide, {
        signal: handle.signal,
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

    return () => {
      return (
        <>
          <span mix={screenReaderOnlyStyle}>{text}</span>
          <span
            mix={handle.props.nowrap ? nowrapStyle : undefined}
            aria-hidden="true"
          >
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
                  mix={[
                    visible ? visibleCharacterStyle : hiddenCharacterStyle,
                    resolved
                      ? resolvedCharacterStyle
                      : colorStyles[handle.props.color ?? "blue"],
                  ]}
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

let screenReaderOnlyStyle = css({
  position: "absolute",
  width: "1px",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
});

let nowrapStyle = css({ whiteSpace: "nowrap" });
let visibleCharacterStyle = css({ opacity: 1 });
let hiddenCharacterStyle = css({ opacity: 0 });
let resolvedCharacterStyle = css({ color: "#ffffff" });

let colorStyles = {
  blue: css({ color: theme.colors.brand.blue }),
  green: css({ color: theme.colors.brand.green }),
  yellow: css({ color: "#fecc1b" }),
} satisfies Record<ScrambleColor, ReturnType<typeof css>>;
