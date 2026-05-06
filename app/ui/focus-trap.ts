import { addEventListeners, createMixin } from "remix/ui";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type FocusTrapTargetInput<T> = {
  activeElement: T | null;
  focusableElements: T[];
  rootContainsActiveElement: boolean;
  shiftKey: boolean;
  root: T;
};

function getFocusTrapTarget<T>({
  activeElement,
  focusableElements,
  rootContainsActiveElement,
  shiftKey,
  root,
}: FocusTrapTargetInput<T>) {
  if (focusableElements.length === 0) return root;

  let first = focusableElements[0];
  let last = focusableElements[focusableElements.length - 1];

  if (!rootContainsActiveElement) return shiftKey ? last : first;
  if (shiftKey && activeElement === first) return last;
  if (!shiftKey && activeElement === last) return first;

  return null;
}

export let focusTrap = createMixin<HTMLElement, [enabled?: boolean]>(
  (handle) => {
    let host: HTMLElement | null = null;
    let enabled = true;

    let getFocusableElements = () => {
      if (!host) return [];
      return getFocusableElementsWithin(host);
    };

    let focusBoundary = (direction: "start" | "end") => {
      if (!host) return;
      let focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        host.focus();
        return;
      }

      if (direction === "start") {
        focusableElements[0].focus();
        return;
      }

      focusableElements[focusableElements.length - 1].focus();
    };

    handle.addEventListener("insert", (event) => {
      host = event.node;

      addEventListeners(document, handle.signal, {
        keydown(event) {
          if (!enabled || event.defaultPrevented || event.key !== "Tab") {
            return;
          }

          let currentHost = host;
          if (!currentHost) return;

          let activeElement = document.activeElement;
          let active =
            activeElement instanceof HTMLElement ? activeElement : null;
          let target = getFocusTrapTarget({
            activeElement: active,
            focusableElements: getFocusableElements(),
            rootContainsActiveElement: active
              ? currentHost.contains(active)
              : false,
            shiftKey: event.shiftKey,
            root: currentHost,
          });

          if (!target) return;
          event.preventDefault();
          target.focus();
        },
        focusin(event) {
          if (!enabled) return;
          let target = event.target;
          let currentHost = host;
          if (!(target instanceof HTMLElement) || !currentHost) return;
          if (currentHost.contains(target)) return;

          focusBoundary("start");
        },
      });
    });

    handle.addEventListener("remove", () => {
      host = null;
    });

    return (nextEnabled = true) => {
      enabled = nextEnabled;
    };
  },
);

export function isFocusable(element: HTMLElement) {
  if (element.matches("[disabled], [aria-hidden='true']")) return false;
  if (element.tabIndex < 0) return false;

  let style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;

  return element.getClientRects().length > 0;
}

export function getFocusableElementsWithin(root: ParentNode) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(isFocusable);
}
