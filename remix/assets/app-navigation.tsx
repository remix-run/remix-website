import { clientEntry, type Handle } from "remix/component";
import assets from "./app-navigation.tsx?assets=client";
import {
  APP_FRAME_NAME,
  APP_NAV_HISTORY_STATE,
  APP_NAV_LINK_ATTRIBUTE,
  APP_NAV_SCOPE_ATTRIBUTE,
} from "../shared/app-navigation";

type BrowserNavigationEvent = Event & {
  canIntercept?: boolean;
  downloadRequest?: string | null;
  formData?: FormData | null;
  hashChange?: boolean;
  navigationType?: string;
  destination?: {
    url: string;
    getState?: () => unknown;
  };
  intercept?: (options: { handler: () => Promise<void> | void }) => void;
};

type BrowserNavigation = EventTarget & {
  addEventListener(
    type: "navigate",
    listener: (event: BrowserNavigationEvent) => void,
  ): void;
  removeEventListener(
    type: "navigate",
    listener: (event: BrowserNavigationEvent) => void,
  ): void;
  currentEntry?: {
    getState?: () => unknown;
  };
  navigate?: (
    url: string,
    options?: {
      history?: "auto" | "push" | "replace";
      state?: unknown;
    },
  ) => {
    committed: Promise<unknown>;
    finished: Promise<unknown>;
  };
  updateCurrentEntry?: (options: { state?: unknown }) => void;
};

interface ReloadFrameOptions {
  resetScroll?: boolean;
  focusContent?: boolean;
}

declare global {
  interface Window {
    navigation?: BrowserNavigation;
  }
}

function hasAppNavState(state: unknown) {
  return !!getAppNavFrameName(state);
}

function getAppNavFrameName(state: unknown) {
  if (!state || typeof state !== "object") return null;

  let value = (state as Record<string, unknown>)[APP_NAV_HISTORY_STATE];
  if (typeof value === "string") return value;
  if (value === true) return APP_FRAME_NAME;
  return null;
}

function createAppNavState(frameName: string) {
  return {
    [APP_NAV_HISTORY_STATE]: frameName,
  };
}

function mergeAppNavState(state: unknown, frameName: string) {
  if (state && typeof state === "object" && !Array.isArray(state)) {
    return {
      ...state,
      [APP_NAV_HISTORY_STATE]: frameName,
    };
  }

  return createAppNavState(frameName);
}

function isModifiedClick(event: MouseEvent) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  );
}

function shouldInterceptAnchor(anchor: HTMLAnchorElement) {
  if (!anchor.href) return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.target && anchor.target !== "_self") return false;

  if (
    !anchor.hasAttribute(APP_NAV_LINK_ATTRIBUTE) &&
    !anchor.closest(`[${APP_NAV_SCOPE_ATTRIBUTE}]`)
  ) {
    return false;
  }

  let currentUrl = new URL(window.location.href);
  let nextUrl = new URL(anchor.href, currentUrl);
  if (nextUrl.origin !== currentUrl.origin) return false;

  if (
    currentUrl.pathname === nextUrl.pathname &&
    currentUrl.search === nextUrl.search &&
    currentUrl.hash !== nextUrl.hash
  ) {
    return false;
  }

  return true;
}

function syncHeadAfterFrameNavigation() {
  let seen = new Map<string, Element>();

  for (let node of Array.from(document.head.children)) {
    let key = getHeadElementKey(node);
    if (!key) continue;

    let previous = seen.get(key);
    if (previous) {
      previous.remove();
    }
    seen.set(key, node);
  }
}

function getHeadElementKey(node: Element) {
  let tagName = node.tagName.toLowerCase();

  if (tagName === "title") {
    return "title";
  }

  if (tagName === "meta") {
    if (node.hasAttribute("charset")) return "meta:charset";

    let name = node.getAttribute("name");
    if (name) return `meta:name:${name.toLowerCase()}`;

    let property = node.getAttribute("property");
    if (property) return `meta:property:${property.toLowerCase()}`;

    let httpEquiv = node.getAttribute("http-equiv");
    if (httpEquiv) return `meta:http-equiv:${httpEquiv.toLowerCase()}`;
  }

  if (tagName === "link") {
    let rel = node.getAttribute("rel");
    let href = node.getAttribute("href");
    if (!rel || !href) return null;

    let as = node.getAttribute("as") ?? "";
    let type = node.getAttribute("type") ?? "";
    return `link:${rel.toLowerCase()}:${href}:${as.toLowerCase()}:${type.toLowerCase()}`;
  }

  return null;
}

function focusAppContent() {
  let main = document.querySelector("main[tabindex='-1']") ?? document.querySelector("main");
  if (!(main instanceof HTMLElement)) return;
  main.focus({ preventScroll: true });
}

function shouldResetScrollAndFocus(navigationType: string | undefined) {
  return navigationType !== "traverse";
}

export let AppNavigation = clientEntry(
  `${assets.entry}#AppNavigation`,
  (handle: Handle, setup?: { frameName?: string }) => {
    let frameName = setup?.frameName ?? APP_FRAME_NAME;
    let latestRequest = 0;
    let pendingFrameName: string | null = null;
    let browserNavigation = typeof window !== "undefined" ? window.navigation : undefined;

    let reloadFrame = async (
      url: URL,
      nextFrameName = frameName,
      options?: ReloadFrameOptions,
    ) => {
      let frame = handle.frames.get(nextFrameName);
      if (!frame) {
        window.location.assign(url.toString());
        return;
      }

      let requestId = ++latestRequest;

      frame.src = url.toString();

      try {
        await frame.reload();
      } catch {
        window.location.assign(url.toString());
        return;
      }

      if (requestId !== latestRequest) return;

      syncHeadAfterFrameNavigation();
      if (options?.resetScroll) {
        window.scrollTo(0, 0);
      }
      if (options?.focusContent) {
        focusAppContent();
      }
    };

    if (typeof window !== "undefined") {
      syncHeadAfterFrameNavigation();

      if (!browserNavigation?.addEventListener || !browserNavigation.navigate) {
        return () => <div hidden data-app-navigation="" />;
      }

      if (!hasAppNavState(browserNavigation.currentEntry?.getState?.())) {
        browserNavigation.updateCurrentEntry?.({
          state: mergeAppNavState(browserNavigation.currentEntry?.getState?.(), frameName),
        });
      }

      let onDocumentClick = (event: MouseEvent) => {
        if (event.defaultPrevented) return;
        if (isModifiedClick(event)) return;

        let target = event.target;
        if (!(target instanceof Element)) return;

        let anchor = target.closest("a[href]");
        if (!(anchor instanceof HTMLAnchorElement)) return;
        if (!shouldInterceptAnchor(anchor)) return;
        pendingFrameName = frameName;
      };

      document.addEventListener("click", onDocumentClick);
      handle.signal.addEventListener(
        "abort",
        () => {
          document.removeEventListener("click", onDocumentClick);
        },
        { once: true },
      );

      let onNavigate = (event: BrowserNavigationEvent) => {
        if (!event.canIntercept || event.hashChange) return;
        if (event.downloadRequest || event.formData) return;
        if (!event.destination?.url) return;

        let nextUrl = new URL(event.destination.url);
        if (nextUrl.origin !== window.location.origin) return;
        let stateFrameName = getAppNavFrameName(event.destination.getState?.());
        let isTraversal = event.navigationType === "traverse";
        let nextFrameName = isTraversal
          ? stateFrameName ?? frameName
          : stateFrameName ?? pendingFrameName;
        pendingFrameName = null;
        if (!nextFrameName) return;

        event.intercept?.({
          handler: async () => {
            browserNavigation.updateCurrentEntry?.({
              state: mergeAppNavState(
                browserNavigation.currentEntry?.getState?.(),
                nextFrameName,
              ),
            });
            let resetScrollAndFocus = shouldResetScrollAndFocus(
              event.navigationType,
            );
            await reloadFrame(nextUrl, nextFrameName, {
              resetScroll: resetScrollAndFocus,
              focusContent: resetScrollAndFocus,
            });
          },
        });
      };

      browserNavigation.addEventListener("navigate", onNavigate);
      handle.signal.addEventListener(
        "abort",
        () => {
          browserNavigation?.removeEventListener("navigate", onNavigate);
        },
        { once: true },
      );
    }

    return () => <div hidden data-app-navigation="" />;
  },
);
