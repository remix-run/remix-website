import { usePendingLocation } from "remix";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function useWindowScrollRestoration() {
  if (typeof window === "undefined") {
    // avoid annoying react warning about useLayoutEffect
    return;
  }

  let positions = useRef<Map<string, number>>(new Map()).current;
  let location = useLocation();
  let pendingLocation = usePendingLocation();

  useEffect(() => {
    if (pendingLocation) {
      positions.set(location.key, window.scrollY);
    }
  }, [pendingLocation, location]);

  useLayoutEffect(() => {
    window.scrollTo(0, positions.get(location.key) || 0);
  }, [location]);
}
