import type { DocSearchProps } from "@docsearch/react";
import {
  DocSearchModal as OriginalDocSearchModal,
  DocSearch as OriginalDocSearch,
  useDocSearchKeyboardEvents,
} from "@docsearch/react";
import { useHydrated } from "~/lib/misc";
import "@docsearch/css/dist/style.css";
import "~/styles/docsearch.css";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

let docSearchProps = {
  appId: "6OHWJSR8G4",
  indexName: "remix",
  apiKey: "dff56670dbec8494409989d6ec9c8ac2",
} satisfies DocSearchProps;

// TODO: Refactor a bit when we add Vite with css imports per component
// This will allow us to have two versions of the component, one that has
// the button with display: none, and the other with button styles
export function DocSearch() {
  let hydrated = useHydrated();

  return hydrated ? (
    <div className="animate-[fadeIn_100ms_ease-in_1]">
      <OriginalDocSearch {...docSearchProps} />
    </div>
  ) : (
    // The Algolia doc search container is hard-coded at 40px. It doesn't
    // render anything on the server, so we get a mis-match after hydration.
    // This placeholder prevents layout shift when the search appears.
    <div className="h-10" />
  );
}

/**
 * DocSearch but only the modal accessible by keyboard command
 * Intended for people instinctively pressing cmd+k on a non-doc page
 *
 * If you need a DocSearch button to appear, use the DocSearch component
 * Modified from https://github.com/algolia/docsearch/blob/main/packages/docsearch-react/src/DocSearch.tsx
 */
export function DocSearchModal() {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen,
    onClose,
  });

  if (isOpen) {
    return createPortal(
      <OriginalDocSearchModal
        initialScrollY={window.scrollY}
        onClose={onClose}
        {...docSearchProps}
      />,
      document.body,
    );
  }

  return null;
}
