import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./utils";
import clsx from "clsx";

/**
 * Main title component with three animated lines of text
 * Each line appears in sequence with a different color while scrambling
 */
export function Title({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={clsx(
        "flex flex-col gap-2 text-3xl font-extrabold uppercase leading-none tracking-tight text-white sm:text-5xl md:text-7xl md:leading-none lg:text-8xl",
        className,
      )}
      role="banner"
    >
      {children}
    </h1>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-conf-mono text-xs uppercase tracking-widest text-white/50 md:text-base">
      {children}
    </p>
  );
}

const SCRAMBLE_CHARS =
  "!@#$%^&*(){}[]<>~`'\",.?/\\|=+-_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Generates a scrambled character based on the target character and current iteration
 * Uses a deterministic sequence unique to each character
 * @param targetChar - The final character we're trying to reach
 * @param iteration - Current iteration in the scramble sequence
 * @param maxIterations - Number of iterations before resolving to target character
 */
function getScrambledLetter(
  targetChar: string,
  iteration: number,
  maxIterations: number,
) {
  // Return the target character if we're done cycling
  if (iteration >= maxIterations) return targetChar;

  // Create a repeatable sequence for this character
  const charCode = targetChar.charCodeAt(0);
  const start = (charCode * 7) % SCRAMBLE_CHARS.length;
  const position = (start + iteration * 11) % SCRAMBLE_CHARS.length;
  return SCRAMBLE_CHARS[position];
}

type ScrambleColor = "blue" | "green" | "yellow";

const colorMap: Record<ScrambleColor, string> = {
  blue: "text-blue-brand",
  green: "text-green-brand",
  yellow: "text-yellow-brand",
} as const;

type ScrambleTextProps = {
  /** The text to animate */
  text: string;
  /** Delay before animation starts (in ms) */
  delay?: number;
  /** Color theme of the text while scrambling (becomes white when resolved) */
  color?: ScrambleColor;
  /** Additional classes to apply to the container */
  className?: string;
  /** Number of cycles before a character resolves */
  cyclesToResolve?: number;
  /** Delay between each character appearing (in ms) */
  charDelay?: number;
  /** Delay between each scramble cycle (in ms) */
  cycleDelay?: number;
};

/**
 * Animated text component that reveals characters one by one with a scramble effect
 * Each character cycles through random characters before settling on its final form
 */
export function ScrambleText({
  text,
  delay = 0,
  color = "blue",
  className = "",
  cyclesToResolve = 10,
  charDelay = 100,
  cycleDelay = 50,
}: ScrambleTextProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [progress, setProgress] = useState<
    Array<{ visible: boolean; iteration: number; resolved: boolean }>
  >(() =>
    text
      .split("")
      .map(() => ({ visible: false, iteration: 0, resolved: false })),
  );

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Handle the reveal and cycling of each character
    const cleanupFns = text.split("").map((_, charIndex) => {
      // Reveal the character
      const timeout = setTimeout(
        () => {
          setProgress((prev) =>
            prev.map((p, i) => (i === charIndex ? { ...p, visible: true } : p)),
          );

          // Start cycling after character is revealed
          let iteration = 0;
          const cycleInterval = setInterval(() => {
            iteration++;
            setProgress((prev) => {
              // Only proceed if previous characters are done
              const canProgress =
                charIndex === 0 ||
                prev.slice(0, charIndex).every((p) => p.resolved);

              if (!canProgress) return prev;

              const newProgress = [...prev];
              if (iteration >= cyclesToResolve) {
                clearInterval(cycleInterval);
                newProgress[charIndex] = {
                  visible: true,
                  iteration,
                  resolved: true,
                };
              } else {
                newProgress[charIndex] = {
                  visible: true,
                  iteration,
                  resolved: false,
                };
              }
              return newProgress;
            });
          }, cycleDelay);

          return () => clearInterval(cycleInterval);
        },
        delay + charIndex * charDelay,
      );

      return () => clearTimeout(timeout);
    });

    // Cleanup all timeouts and intervals
    return () => cleanupFns.forEach((cleanup) => cleanup());
  }, [
    text,
    delay,
    cyclesToResolve,
    charDelay,
    cycleDelay,
    prefersReducedMotion,
  ]);

  return (
    <>
      <span className="sr-only">{text}</span>
      {prefersReducedMotion ? (
        <span className={clsx("text-white", className)} aria-hidden="true">
          {text}
        </span>
      ) : (
        <span className={className} aria-hidden="true">
          {text.split("").map((char, i) => {
            const currentChar = progress[i].visible
              ? getScrambledLetter(char, progress[i].iteration, cyclesToResolve)
              : char;

            return (
              <span
                key={i}
                className={clsx(
                  progress[i].visible ? "opacity-100" : "opacity-0",
                  progress[i].resolved ? "text-white" : colorMap[color],
                )}
              >
                {currentChar}
              </span>
            );
          })}
        </span>
      )}
    </>
  );
}

/**
 * A simple component for displaying centered informational text blocks.
 */
export function InfoText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("text-center", className)}>
      <p className="text-lg font-bold leading-[1.4] text-white md:text-3xl">
        {children}
      </p>
    </div>
  );
}

/**
 * Standard subheading used within JAM pages (FAQ questions etc.)
 * Automatically creates an anchor link - whole header is clickable
 */
export function Subheader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={clsx(
        "text-2xl font-bold tracking-tight text-white md:text-3xl",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/**
 * Standard paragraph used within JAM pages.
 */
export function Paragraph({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={clsx("text-white/80", className)}>{children}</p>;
}
