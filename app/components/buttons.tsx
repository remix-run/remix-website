import * as React from "react";
import { Link } from "~/components/link";

export const outlineButtonLinkClass =
  "inline-flex items-center justify-center xl:text-d-p-lg h-14 xl:h-16 t box-border px-8 rounded bg-transparent text-white border-current hover:border-blue-brand focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-blue-200 focus:ring-opacity-80 font-semibold border-2";

export function OutlineButtonLink({
  to,
  children,
  className,
  prefetch = "intent",
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: "intent" | "render";
}) {
  return (
    <Link
      to={to}
      prefetch={prefetch}
      x-comp="OutlineButtonLink"
      className={`${outlineButtonLinkClass} ${className}`}
      children={children}
    />
  );
}

export const primaryButtonLinkClass =
  "inline-flex items-center justify-center xl:text-d-p-lg h-14 xl:h-16 box-border px-8 rounded bg-blue-brand text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-blue-200 font-semibold";

export function PrimaryButtonLink({
  to,
  children,
  className,
  prefetch = "intent",
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: "intent" | "render";
}) {
  return (
    <Link
      x-comp="PrimaryButtonLink"
      to={to}
      prefetch={prefetch}
      className={`${primaryButtonLinkClass} ${className}`}
      children={children}
    />
  );
}

export let Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<"button">
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      x-comp="Button"
      className={
        "inline-flex items-center justify-center box-border py-4 px-8 rounded bg-blue-brand hover:bg-blue-500 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-blue-200 font-semibold " +
        className
      }
      type={props.type}
      {...props}
    >
      {children}
    </button>
  );
});

export let Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithRef<"input">
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      x-comp="Input"
      className={
        "inline-block box-border py-4 px-5 rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-white border-solid border border-gray-300 dark:border-none " +
        className
      }
      title={props.title}
      {...props}
    />
  );
});
