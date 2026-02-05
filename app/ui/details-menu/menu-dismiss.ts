import { defineInteraction, type Interaction } from "remix/interaction";
import { escape } from "remix/interaction/keys";

export const menuDismiss = defineInteraction("rmx:menu-dismiss", MenuDismiss);

declare global {
  interface HTMLElementEventMap {
    [menuDismiss]: MenuDismissEvent;
  }
  interface DocumentEventMap {
    [menuDismiss]: MenuDismissEvent;
  }
}

class MenuDismissEvent extends Event {
  constructor(type: typeof menuDismiss) {
    super(type, { bubbles: true, cancelable: true });
  }
}

function MenuDismiss(handle: Interaction) {
  if (!(handle.target instanceof HTMLDetailsElement)) return;

  let target = handle.target;
  let summary = target.querySelector("summary");

  function isOutsideTarget(event: Event) {
    let eventTarget = event.target;
    if (eventTarget instanceof Node && target.contains(eventTarget)) {
      return false;
    }
    let path = event.composedPath();

    if (path.includes(target)) return false;
    return true;
  }

  function dispatchIfOutside(event: Event) {
    if (!target.open) return;
    if (!isOutsideTarget(event)) return;
    target.dispatchEvent(new MenuDismissEvent(menuDismiss));
  }

  handle.on(target.ownerDocument, {
    mousedown(event) {
      dispatchIfOutside(event);
    },
    touchstart(event) {
      dispatchIfOutside(event);
    },
    focusin(event) {
      dispatchIfOutside(event);
    },
    [escape]() {
      if (!target.open) return;
      target.dispatchEvent(new MenuDismissEvent(menuDismiss));
      if (summary instanceof HTMLElement) {
        summary.focus();
      }
    },
  });
}
