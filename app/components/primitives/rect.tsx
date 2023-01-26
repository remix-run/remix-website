/**
 * Welcome to @reach/rect!
 *
 * Measures a DOM element's bounding client rect
 *
 * @see getBoundingClientRect https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
 * @see Docs                  TODO
 * @see Source                TODO
 */

import * as React from "react";
import observeRect from "@reach/observe-rect";
import { useLayoutEffect } from "./utils";

/**
 * Measures a DOM element's bounding client rect
 *
 * @param nodeRef
 * @param options
 */
function useRect<T extends Element = HTMLElement>(
  nodeRef: React.RefObject<T | undefined | null>,
  options: UseRectOptions = {}
): null | DOMRect {
  let { observe, onChange } = options;
  let [element, setElement] = React.useState(nodeRef.current);
  let initialRectIsSet = React.useRef(false);
  let initialRefIsSet = React.useRef(false);
  let [rect, setRect] = React.useState<DOMRect | null>(null);
  let onChangeRef = React.useRef(onChange);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
    if (nodeRef.current !== element) {
      setElement(nodeRef.current);
    }
  });

  useLayoutEffect(() => {
    if (element && !initialRectIsSet.current) {
      initialRectIsSet.current = true;
      setRect(element.getBoundingClientRect());
    }
  }, [element]);

  useLayoutEffect(() => {
    if (!observe) {
      return;
    }

    let elem = element;
    // State initializes before refs are placed, meaning the element state will
    // be undefined on the first render. We still want the rect on the first
    // render, so initially we'll use the nodeRef that was passed instead of
    // state for our measurements.
    if (!initialRefIsSet.current) {
      initialRefIsSet.current = true;
      elem = nodeRef.current;
    }

    if (!elem) {
      // TODO: Consider a warning
      return;
    }

    let observer = observeRect(elem, (rect) => {
      onChangeRef.current?.(rect);
      setRect(rect);
    });
    observer.observe();
    return () => {
      observer.unobserve();
    };
  }, [observe, element, nodeRef]);

  return rect;
}

/**
 * @see Docs https://TODO.com/rect#userect
 */
interface UseRectOptions {
  /**
   * Tells `Rect` to observe the position of the node or not. While observing,
   * the `children` render prop may call back very quickly (especially while
   * scrolling) so it can be important for performance to avoid observing when
   * you don't need to.
   *
   * This is typically used for elements that pop over other elements (like a
   * dropdown menu), so you don't need to observe all the time, only when the
   * popup is active.
   *
   * Pass `true` to observe, `false` to ignore.
   *
   * @see Docs https://TODO.com/rect#userect-observe
   */
  observe?: boolean;
  /**
   * Calls back whenever the `rect` of the element changes.
   *
   * @see Docs https://TODO.com/rect#userect-onchange
   */
  onChange?(rect: Rect): void;
}

interface Rect extends Partial<DOMRect> {
  readonly bottom: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly width: number;
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type { Rect, UseRectOptions };
export { useRect };
