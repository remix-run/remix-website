import { Scripts, LiveReload } from "remix";
import { ScrollRestoration } from "./scroll-restoration";

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
      x-comp="Body"
      className={
        "min-h-screen flex flex-col w-full" +
        (forceDark
          ? ` ${darkBg} text-gray-300 `
          : " bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-300 ") +
        className
      }
    >
      {children}
      <ScrollRestoration />
      <Scripts />
      {process.env.NODE_ENV === "development" && <LiveReload />}
    </body>
  );
}
