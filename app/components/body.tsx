import { Scripts, LiveReload } from "@remix-run/react";
import { ScrollRestoration } from "./scroll-restoration";
import cx from "clsx";

export function Body({
  forceDark,
  darkBg = "bg-gray-900",
  className,
  children,
}: {
  forceDark?: boolean;
  darkBg?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <body
      className={cx(
        className,
        "min-h-screen flex flex-col w-full overflow-x-hidden",
        forceDark
          ? [darkBg || "bg-gray-900", "text-gray-200"]
          : "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-200"
      )}
    >
      {children}
      <ScrollRestoration />
      <Scripts />
      {process.env.NODE_ENV === "development" && <LiveReload />}
    </body>
  );
}
