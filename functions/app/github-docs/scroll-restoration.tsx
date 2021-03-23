import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { usePendingLocation } from "@remix-run/react";

export function useElementScrollRestoration(
  ref: React.MutableRefObject<HTMLElement | null>
) {
  let positions = useRef<Map<string, number>>(new Map()).current;
  let location = useLocation();
  let pendingLocation = usePendingLocation();

  useEffect(() => {
    if (!ref.current) return;
    if (pendingLocation) {
      positions.set(location.key, ref.current.scrollTop);
    }
  }, [pendingLocation, location]);

  if (typeof window !== "undefined") {
    // shutup React warnings, my gosh
    useLayoutEffect(() => {
      if (!ref.current) return;
      let y = positions.get(location.key);
      ref.current.scrollTo(0, y || 0);
    }, [location]);
  }
}
