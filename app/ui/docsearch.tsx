import { createPortal } from "react-dom";
import type { DocSearchProps } from "@docsearch/react";
import { useDocSearchKeyboardEvents } from "@docsearch/react";
import "@docsearch/css/dist/style.css";
import "~/styles/docsearch.css";
import { useHydrated } from "./primitives/utils";
import { Suspense, lazy, useCallback, useRef, useState } from "react";

const OriginalDocSearch = lazy(() =>
  import("@docsearch/react").then((module) => ({
    default: module.DocSearch,
  })),
);

let OriginalDocSearchModal = lazy(() =>
  import("@docsearch/react").then((module) => ({
    default: module.DocSearchModal,
  })),
);

let docSearchProps = {
  appId: "6OHWJSR8G4",
  indexName: "remix",
  apiKey: "dff56670dbec8494409989d6ec9c8ac2",
} satisfies DocSearchProps;

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

  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  useDocSearchKeyboardEvents({
    isOpen,
    onOpen,
    onClose,
    searchButtonRef,
  });

  if (isOpen) {
    return createPortal(
      <Suspense fallback={null}>
        <OriginalDocSearchModal
          initialScrollY={window.scrollY}
          onClose={onClose}
          {...docSearchProps}
        />
      </Suspense>,
      document.body,
    );
  }

  return null;
}
