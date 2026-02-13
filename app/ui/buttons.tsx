import * as React from "react";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<"button">
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      x-comp="Button"
      className={
        "box-border inline-flex items-center justify-center rounded bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 focus:ring-offset-transparent " +
        className
      }
      type={props.type}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithRef<"input">
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      x-comp="Input"
      className={
        "box-border inline-block rounded border border-solid border-gray-300 bg-white px-5 py-4 text-gray-900 dark:border-none dark:bg-gray-800 dark:text-white " +
        className
      }
      title={props.title}
      {...props}
    />
  );
});
Input.displayName = "Input";
