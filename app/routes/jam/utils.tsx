/**
 * General hooks and components that don't need their own modules
 */
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Link, useMatches, type LinkProps } from "react-router";
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
      620 King St W Toronto, ON M5V 1M7, Canada
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

/**
 * Transform a Shopify image URL to use CDN optimizations
 * @param url - Original Shopify image URL
 * @param options - Transformation options (width, height, format, quality)
 */
export function transformShopifyImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    format?: "webp" | "jpg" | "png";
    quality?: number;
  } = {},
): string {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    Object.entries(options).forEach(([key, value]) => {
      params.set(key, value.toString());
    });

    urlObj.search = params.toString();
    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Check if the current route has the hideBackground handle
 * @example
 * ```tsx
 * // routes/jam/pages/2025.lineup.tsx
 * export let handle = {
 *   hideBackground: true,
 * };
 *
 * // routes/jam/pages/layout.tsx
 * function Background({ children }: { children: React.ReactNode }) {
 *   let hideBackground = useHideBackground();
 * }
 * ```
 */
export function useHideBackground() {
  let matches = useMatches();
  return matches.some(({ handle }) => {
    if (handle && typeof handle === "object" && "hideBackground" in handle) {
      return handle.hideBackground;
    }
    return false;
  });
}
