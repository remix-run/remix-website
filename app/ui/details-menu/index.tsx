import { useRef, useEffect } from "react";
import { useLocation, useNavigation } from "react-router";
import { menuDismiss } from "./menu-dismiss";
import { on } from "remix/interaction";

/**
 * An enhanced `<details>` component that's intended to be used as a menu (a bit
 * like a menu-button).
 */
export function DetailsMenu(props: React.ComponentPropsWithRef<"details">) {
  let detailsRef = useRef<HTMLDetailsElement | null>(null);
  let location = useLocation();
  let navigation = useNavigation();

  useEffect(() => {
    let details = detailsRef.current;
    if (!details) return;
    let disposeDetails = on(details, {
      [menuDismiss](event) {
        if (event.defaultPrevented) return;
        if (!details.open) return;
        details.open = false;
      },
    });

    return () => {
      disposeDetails();
    };
  }, []);

  useEffect(() => {
    let details = detailsRef.current;
    if (!details) return;
    if (navigation.state === "submitting") {
      details.open = false;
    }
  }, [navigation.state]);

  useEffect(() => {
    let details = detailsRef.current;
    if (!details) return;
    details.open = false;
  }, [location.key]);

  return <details ref={detailsRef} {...props} />;
}

export function DetailsPopup({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute right-0 z-20 md:left-0">
      <div className="relative top-1 w-40 rounded-md border border-gray-100 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {children}
      </div>
    </div>
  );
}
