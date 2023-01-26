/**
 * Welcome to @reach/portal!
 *
 * Creates and appends a DOM node to the end of `document.body` and renders a
 * React tree into it. Useful for rendering a natural React element hierarchy
 * with a different DOM hierarchy to prevent parent styles from clipping or
 * hiding content (for popovers, dropdowns, and modals).
 *
 * @see Docs   TODO
 * @see Source TODO
 * @see React  https://reactjs.org/docs/portals.html
 */

import * as React from "react";
import { useForceUpdate, useHydrated, useLayoutEffect } from "./utils";
import { createPortal } from "react-dom";

const PortalImpl: React.FC<PortalProps> = ({
  children,
  type = "reach-portal",
  containerRef,
}) => {
  let mountNode = React.useRef<HTMLSpanElement | null>(null);
  let portalNode = React.useRef<HTMLElement | null>(null);
  let forceUpdate = useForceUpdate();

  useLayoutEffect(() => {
    // This ref may be null when a hot-loader replaces components on the page
    if (!mountNode.current) {
      return;
    }

    let ownerDocument = mountNode.current?.ownerDocument || document;
    let body = containerRef?.current || ownerDocument.body;
    portalNode.current = ownerDocument.createElement(type);
    body.appendChild(portalNode.current);
    forceUpdate();
    return () => {
      if (portalNode.current && body) {
        body.removeChild(portalNode.current);
      }
    };
  }, [type, forceUpdate, containerRef]);

  return portalNode.current ? (
    createPortal(children, portalNode.current)
  ) : (
    <span ref={mountNode} />
  );
};

/**
 * Creates and appends a DOM node to the end of `document.body` and renders a
 * React tree into it. Useful for rendering a natural React element hierarchy
 * with a different DOM hierarchy to prevent parent styles from clipping or
 * hiding content (for popovers, dropdowns, and modals).
 *
 * @see Docs https://TODO.com/portal#portal
 */
const Portal: React.FC<PortalProps> = ({
  unstable_preventRenderBeforeHydration,
  ...props
}) => {
  let hydrated = useHydrated();
  if (unstable_preventRenderBeforeHydration && !hydrated) {
    return null;
  }
  return <PortalImpl {...props} />;
};

/**
 * @see Docs https://TODO.com/portal#portal-props
 */
interface PortalProps {
  /**
   * Regular React children.
   *
   * @see Docs https://TODO.com/portal#portal-children
   */
  children: React.ReactNode;
  /**
   * The DOM element type to render.
   *
   * @see Docs https://TODO.com/portal#portal-type
   */
  type?: string;
  /**
   * The container ref to which the portal will be appended. If not set the
   * portal will be appended to the body of the component's owner document
   * (typically this is the `document.body`).
   *
   * @see Docs https://TODO.com/portal#portal-containerRef
   */
  containerRef?: React.RefObject<Node>;
  unstable_preventRenderBeforeHydration?: boolean;
}

Portal.displayName = "Portal";

export type { PortalProps };
export { Portal };
