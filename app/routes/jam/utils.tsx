/**
 * General hooks and components that don't need their own modules
 */
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Link, type LinkProps } from "react-router";
import { ButtonHTMLAttributes } from "react";

const jamStyles =
  "flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-black transition-colors duration-300 hover:bg-blue-brand hover:text-white md:px-6 md:py-4 md:text-xl";

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    // Set the initial state
    setPrefersReducedMotion(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add the listener
    mediaQueryList.addEventListener("change", listener);

    // Clean up the listener on unmount
    return () => {
      mediaQueryList.removeEventListener("change", listener);
    };
  }, []);

  return prefersReducedMotion;
}

export function Address({ className }: { className?: string }) {
  return (
    <address className={clsx("inline-block not-italic", className)}>
      620 King St W
      <br />
      Toronto, ON M5V 1M7, Canada
    </address>
  );
}

export function JamLink({ className, children, ...props }: LinkProps) {
  return (
    <Link className={clsx(jamStyles, className)} {...props}>
      {children}
    </Link>
  );
}

export function JamButton({
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        jamStyles,
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
