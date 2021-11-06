import * as React from "react";
import { useLocation } from "react-router-dom";
import { useTransition, useBeforeUnload } from "remix";

const STORAGE_KEY = "positions";

let positions: { [key: string]: number } = {};

if (typeof window !== "undefined") {
  let sessionPositions = sessionStorage.getItem(STORAGE_KEY);
  if (sessionPositions) {
    positions = JSON.parse(sessionPositions);
  }
}

export function ScrollRestoration() {
  useScrollRestoration();
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          const STORAGE_KEY = "positions";
          window.history.scrollRestoration = 'manual'
          try {
            let positions = JSON.parse(sessionStorage.getItem(${JSON.stringify(
              STORAGE_KEY
            )}) ?? '{}')
            let storedY = positions[window.history.state.key] || positions["default"]
            if (typeof storedY === 'number') {
              window.scrollTo(0, storedY)
            }
          } catch {
            sessionStorage.removeItem(STORAGE_KEY)
          }
        `,
      }}
    />
  );
}

let hydrated = false;

function useScrollRestoration() {
  let location = useLocation();
  let transition = useTransition();

  let wasSubmissionRef = React.useRef(false);

  React.useEffect(() => {
    if (transition.submission) {
      wasSubmissionRef.current = true;
    }
  }, [transition]);

  React.useEffect(() => {
    let savePosition = () => {
      positions[location.key] = window.scrollY;
    };
    window.addEventListener("scroll", savePosition);
    return () => window.removeEventListener("scroll", savePosition);
  }, [location]);

  useBeforeUnload(
    React.useCallback(() => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    }, [])
  );

  if (typeof window !== "undefined") {
    React.useLayoutEffect(() => {
      // don't do anything on hydration, the component already did this with an
      // inline script.
      if (!hydrated) {
        hydrated = true;
        return;
      }

      let y = positions[location.key];

      // been here before, scroll to it
      if (y) {
        window.scrollTo(0, y);
        return;
      }

      // try to scroll to the hash
      if (location.hash) {
        let el = document.querySelector(location.hash);
        if (el) {
          el.scrollIntoView();
          return;
        }
      }

      // don't do anything on submissions
      if (wasSubmissionRef.current === true) {
        wasSubmissionRef.current = false;
        return;
      }

      // otherwise go to the top on new locations
      window.scrollTo(0, 0);
    }, [location]);
  }

  React.useEffect(() => {
    if (transition.submission) {
      wasSubmissionRef.current = true;
    }
  }, [transition]);
}
