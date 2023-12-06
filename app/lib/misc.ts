import {
  useLayoutEffect as React_useLayoutEffect,
  useEffect,
  useState,
} from "react";

export const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

export const useIsomorphicLayoutEffect = canUseDOM
  ? React_useLayoutEffect
  : useEffect;

let hydrating = true;
export function useHydrated() {
  let [hydrated, setHydrated] = useState(() => !hydrating);
  useEffect(() => {
    hydrating = false;
    setHydrated(true);
  }, []);
  return hydrated;
}
