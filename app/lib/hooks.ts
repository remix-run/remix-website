import { useMatches } from "react-router";

/**
 * Hook to check if any route in the current route tree has `forceDark: true`
 * in its handle export. This is used to force dark mode styling on specific
 * routes (like marketing pages).
 */
export function useForceDark(): boolean {
  let matches = useMatches();
  return matches.some(({ handle }) => {
    if (handle && typeof handle === "object" && "forceDark" in handle) {
      return handle.forceDark;
    }
    return false;
  });
}
