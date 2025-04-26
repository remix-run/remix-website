/**
 * General hooks and components that don't need their own modules
 */
import clsx from "clsx";
import { useEffect, useState } from "react";

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

export function BrooksLink() {
  return (
    <address className="inline-block not-italic">
      <a
        className="text-blue-400 hover:underline"
        href="mailto:brooks.lybrand@shopify.com"
      >
        Brooks
      </a>
    </address>
  );
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
