import * as React from "react";
import { Link } from "remix";

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
      className={
        "inline-flex items-center justify-center xl:text-d-p-lg h-14 xl:h-16 t box-border px-8 rounded bg-transparent text-white font-semibold border-2 " +
        className
      }
      children={children}
    />
  );
}

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
      className={
        "inline-flex items-center justify-center xl:text-d-p-lg h-14 xl:h-16 box-border px-8 rounded bg-blue-brand text-white font-semibold " +
        className
      }
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
        "inline-block text-center box-border py-4 px-8 rounded bg-blue-brand text-white font-semibold " +
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
        "inline-block box-border py-4 px-8 rounded dark:bg-gray-800 dark:text-white border-solid border border-gray-300 dark:border-none " +
        className
      }
      title={props.title}
      {...props}
    />
  );
});
