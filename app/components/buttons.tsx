import * as React from "react";
import { Link } from "remix";
import clsx from "clsx";

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
      className={clsx(
        "inline-block text-center box-border py-4 px-8 rounded bg-transparent text-white font-semibold border-2",
        className
      )}
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
      className={clsx(
        "inline-block text-center box-border py-4 px-8 rounded bg-blue-brand text-white font-semibold",
        className
      )}
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
      className={clsx(
        "inline-block text-center box-border py-4 px-8 rounded bg-blue-brand text-white font-semibold",
        className
      )}
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
      className={clsx(
        "inline-block box-border py-4 px-8 rounded bg-gray-800 text-white",
        className
      )}
      title={props.title}
      {...props}
    />
  );
});
