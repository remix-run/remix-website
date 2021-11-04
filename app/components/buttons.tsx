import { forwardRef } from "react";
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
        "inline-flex items-center justify-center xl:text-base h-14 xl:h-16 t box-border px-8 rounded bg-transparent text-white font-semibold border-2 " +
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
        "inline-flex items-center justify-center xl:text-base h-14 xl:h-16 box-border px-8 rounded bg-blue-brand text-white font-semibold " +
        className
      }
      children={children}
    />
  );
}

export let Button = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<"button">
>(({ className, ...props }, ref) => {
  return (
    <button
      x-comp="Button"
      className={
        "inline-block text-center box-border py-4 px-8 rounded bg-blue-brand text-white font-semibold " +
        className
      }
      {...props}
    />
  );
});

export let Input = forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithRef<"input">
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      x-comp="Input"
      className={
        "inline-block box-border py-4 px-8 rounded bg-gray-800 text-white " +
        className
      }
      {...props}
    />
  );
});
