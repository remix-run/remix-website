import * as React from "react";
import { useNavigation } from "@remix-run/react";
import cx from "clsx";

export function GlobalLoading() {
  const transition = useNavigation();
  const active = transition.state !== "idle";

  const ref = React.useRef<HTMLDivElement>(null);
  const [animationComplete, setAnimationComplete] = React.useState(true);

  React.useEffect(() => {
    if (!ref.current) return;
    if (active) setAnimationComplete(false);

    Promise.allSettled(
      ref.current.getAnimations().map(({ finished }) => finished),
    ).then(() => !active && setAnimationComplete(true));
  }, [active]);

  return (
    <div
      role="progressbar"
      aria-hidden={!active}
      aria-valuetext={active ? "Loading" : undefined}
      className="fixed inset-x-0 left-0 top-0 z-50 h-1 animate-pulse"
    >
      <div
        ref={ref}
        className={cx(
          "h-full bg-gradient-to-r from-blue-brand to-aqua-brand transition-all duration-500 ease-in-out",
          transition.state === "idle" &&
            animationComplete &&
            "w-0 opacity-0 transition-none",
          transition.state === "submitting" && "w-4/12",
          transition.state === "loading" && "w-10/12",
          transition.state === "idle" && !animationComplete && "w-full",
        )}
      />
    </div>
  );
}
