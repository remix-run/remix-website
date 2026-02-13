import {
  useEffect,
  useLayoutEffect as React_useLayoutEffect,
  useState,
} from "react";

export const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

export const useLayoutEffect = canUseDOM ? React_useLayoutEffect : useEffect;

let hydrating = true;
export function useHydrated() {
  let [hydrated, setHydrated] = useState(() => !hydrating);
  useEffect(() => {
    hydrating = false;
    setHydrated(true);
  }, []);
  return hydrated;
}

export function slugify(string: string) {
  return string
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .join("-");
}
