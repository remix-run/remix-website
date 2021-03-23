import { useMatches } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

let firstRender = true;

export default function Breadcrumbs({
  skipText = "Jump to menu",
}: {
  skipText?: string;
}) {
  let matches = useMatches();
  let location = useLocation();
  let ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // don't manage focus on initial page load
    if (firstRender) {
      firstRender = false;
      return;
    }
    if (ref.current) {
      ref.current.focus();
    }
  }, [location]);

  let crumbs = matches
    .filter((match) => match.handle && match.handle.crumb)
    .map((match, index, arr) => (
      <div data-docs-crumb key={match.pathname}>
        {match.handle.crumb(match)}
      </div>
    ));

  return (
    <nav tabIndex={-1} ref={ref} data-docs-crumbs aria-label="Page Breadcrumbs">
      {crumbs}{" "}
      <button
        data-docs-skip
        onClick={() => {
          document
            .querySelector<HTMLSelectElement>("[data-docs-version-select]")
            ?.focus();
        }}
      >
        {skipText}
      </button>
    </nav>
  );
}
