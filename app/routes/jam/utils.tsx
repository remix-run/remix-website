/**
 * General hooks and components that don't need their own modules
 */
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Link, type LinkProps } from "react-router";
import { ButtonHTMLAttributes } from "react";

const jamStyles =
  "min-w-fit flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors duration-300 hover:bg-blue-brand hover:text-white md:px-6 md:py-4 md:text-xl";

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

export function AddressMain() {
  return (
    <address className="inline-block text-lg font-bold not-italic leading-relaxed text-white md:text-3xl">
      620 King St W
      <br />
      Toronto, ON M5V 1M7, Canada
    </address>
  );
}

export function AddressLink() {
  return (
    <a
      href="https://maps.app.goo.gl/GpacrBAJJMnctN9W7"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:underline"
    >
      <address className="inline not-italic">
        620 King St W Toronto, ON M5V 1M7, Canada
      </address>
    </a>
  );
}

export function JamLink({
  className,
  children,
  active = false,
  ...props
}: LinkProps & { active?: boolean }) {
  return (
    <Link
      className={clsx(
        jamStyles,
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black",
        active ? "bg-blue-brand text-white" : "bg-white text-black",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function JamButton({
  className,
  children,
  disabled,
  active,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={clsx(
        jamStyles,
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black",
        active ? "bg-blue-brand text-white" : "bg-white text-black",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
