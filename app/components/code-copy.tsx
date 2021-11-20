import { useCallback, useEffect, useReducer, useRef } from "react";
import type { ReactNode } from "react";

import { Copy } from "./icons";

function isPreCodeEvent(event: MouseEvent) {
  if (!(event.target instanceof HTMLElement)) return;
  let pre = event.target.closest("pre[data-lang]");
  return !!pre && (pre as HTMLPreElement);
}

function tidyUpText(text: string) {
  let result = "";
  let lastWasNewline = false;
  for (let i = 0; i < text.length; i++) {
    let char = text.charAt(i);

    if (char === "\r") continue;

    if (char === "\n") {
      if (lastWasNewline) {
        lastWasNewline = false;
        continue;
      }
      lastWasNewline = true;
    } else {
      lastWasNewline = false;
    }
    result += char;
  }

  return result;
}

type State = {
  position: {
    top: number;
    right: number;
  } | null;
  showNotification: boolean;
};

export function AddCopyToCodeBlocks({ children }: { children: ReactNode }) {
  let nodeRef = useRef<HTMLDivElement>(null);
  let activePreRef = useRef<HTMLPreElement | null>(null);
  let showNotificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  let [{ position, showNotification }, dispatch] = useReducer(
    (state: State, action: Partial<State>) => ({
      ...state,
      ...action,
    }),
    {
      position: null,
      showNotification: false,
    }
  );

  useEffect(() => {
    if (!navigator.clipboard) {
      return;
    }

    let enterHandler = (event: MouseEvent) => {
      if (!nodeRef.current) return;
      let pre = isPreCodeEvent(event);
      if (pre && pre !== activePreRef.current) {
        activePreRef.current = pre;
        dispatch({
          showNotification: false,
          position: {
            top: pre.offsetTop,
            right: window.innerWidth - (pre.offsetLeft + pre.clientWidth),
          },
        });
      }
    };

    let resizeHandler = () => {
      if (!activePreRef.current) return;
      activePreRef.current = null;
      if (showNotificationTimeoutRef.current) {
        clearTimeout(showNotificationTimeoutRef.current);
        showNotificationTimeoutRef.current = null;
      }

      dispatch({
        position: null,
        showNotification: false,
      });
    };

    if (!nodeRef.current) return;
    nodeRef.current.addEventListener("mouseenter", enterHandler, true);
    window.addEventListener("resize", resizeHandler);

    return () => {
      if (!nodeRef.current) return;
      nodeRef.current.removeEventListener("mouseenter", enterHandler);
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  let copyToClipboard = useCallback(() => {
    if (!activePreRef.current) return;
    let text = tidyUpText(activePreRef.current.innerText);

    navigator.clipboard
      .writeText(text)
      .then(() => {
        dispatch({ showNotification: true });

        if (showNotificationTimeoutRef.current) {
          clearTimeout(showNotificationTimeoutRef.current);
          showNotificationTimeoutRef.current = null;
        }

        showNotificationTimeoutRef.current = setTimeout(() => {
          dispatch({ showNotification: false });
        }, 2000);
      })
      .catch();
  }, []);

  return (
    <div ref={nodeRef}>
      {children}
      {position && (
        <div
          aria-live="polite"
          className="absolute hidden md:block p-4 text-gray-400"
          style={{
            top: position.top,
            right: position.right,
          }}
        >
          {showNotification ? (
            <span>copied to clipboard</span>
          ) : (
            <button title="copy to clipboard" onClick={copyToClipboard}>
              <Copy />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
