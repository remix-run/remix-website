import * as React from "react";
import { useFetcher } from "@remix-run/react";
import type { FormProps } from "@remix-run/react";
import { Button, Input } from "./buttons";
import cx from "clsx";

function Subscribe({
  descriptionId,
  formClassName = "flex gap-4 flex-col",
}: {
  descriptionId: string;
  formClassName?: string;
}) {
  return (
    <div>
      <SubscribeProvider>
        <SubscribeForm
          className={formClassName}
          aria-describedby={descriptionId}
        >
          <SubscribeEmailInput />
          <SubscribeSubmit />
        </SubscribeForm>
        <SubscribeStatus />
      </SubscribeProvider>
    </div>
  );
}

type ActionType = { ok?: boolean; error?: string } | undefined;

const SubscribeContext = React.createContext<null | {
  fetcher: ReturnType<typeof useFetcher>;
}>(null);

function useSubscribeContext() {
  let ctx = React.useContext(SubscribeContext);
  if (!ctx)
    throw Error(
      "SubscribeForm components must be used inside of a SubscribeProvider"
    );
  return ctx;
}

function SubscribeProvider({ children }: { children: React.ReactNode }) {
  let subscribe = useFetcher();
  return (
    <SubscribeContext.Provider
      value={{
        fetcher: subscribe,
      }}
    >
      {children}
    </SubscribeContext.Provider>
  );
}

function SubscribeForm({
  className = "flex gap-4 flex-col",
  children,
  ...props
}: SubscribeFormProps) {
  let { fetcher: subscribe } = useSubscribeContext();

  return (
    <subscribe.Form
      replace
      action="/_actions/newsletter"
      method="post"
      className={cx(className, {
        ["opacity-50"]: subscribe.state === "submitting",
      })}
      {...props}
    >
      {children}
    </subscribe.Form>
  );
}

interface SubscribeFormProps extends Omit<FormProps, "replace" | "method"> {
  descriptionId?: string;
  className?: string;
  children: React.ReactNode;
}

const SubscribeInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentPropsWithRef<"input">, "value">
>(
  (
    {
      children,
      className = "w-full sm:w-auto sm:flex-1 dark:placeholder-gray-500",
      ...props
    },
    forwardedRef
  ) => {
    return <Input ref={forwardedRef} className={className} {...props} />;
  }
);

SubscribeInput.displayName = "SubscribeInput";

function SubscribeEmailInput({
  placeholder = "you@example.com",
  ...props
}: Omit<React.ComponentPropsWithoutRef<"input">, "type" | "name" | "value">) {
  let { fetcher } = useSubscribeContext();
  return (
    <SubscribeInput
      type="email"
      name="email"
      placeholder={placeholder}
      {...props}
      aria-invalid={
        props["aria-invalid"] ??
        (Boolean((fetcher as any).data?.error) || undefined)
      }
    />
  );
}

function SubscribeSubmit({
  children = "Subscribe",
  onClick,
  className = "w-full mt-2 sm:w-auto sm:mt-0 uppercase",
  ...props
}: Omit<React.ComponentPropsWithoutRef<"button">, "type">) {
  let { fetcher } = useSubscribeContext();
  return (
    <Button
      onClick={(event) => {
        onClick?.(event);
        if (fetcher.state === "submitting") {
          event.preventDefault();
        }
      }}
      type="submit"
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}

function SubscribeStatus() {
  let { fetcher: subscribe } = useSubscribeContext();
  return (
    <div aria-live="polite" className="py-2">
      {subscribe.type === "done" && (subscribe.data as ActionType)?.ok && (
        <div className="text-white">
          <b className="text-green-brand">Got it!</b> Please go{" "}
          <b className="text-red-brand">check your email</b> to confirm your
          subscription, otherwise you won't get our email.
        </div>
      )}
      {subscribe.type === "done" && (subscribe.data as ActionType)?.error && (
        <div className="text-red-brand">
          {(subscribe.data as ActionType)?.error}
        </div>
      )}
    </div>
  );
}

export {
  Subscribe,
  SubscribeProvider,
  SubscribeForm,
  SubscribeInput,
  SubscribeEmailInput,
  SubscribeSubmit,
  SubscribeStatus,
};
