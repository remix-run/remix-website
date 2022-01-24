import * as React from "react";
import { useFetcher, useTransition } from "remix";
import type { FormProps } from "remix";
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

const SubscribeContext = React.createContext<null | {
  fetcher: ReturnType<typeof useFetcher>;
  inputRef: React.RefObject<HTMLInputElement>;
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
  let transition = useTransition();
  let subscribe = useFetcher();
  let inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (transition.state === "idle" && subscribe.data?.ok && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [transition.state, subscribe.data]);
  return (
    <SubscribeContext.Provider
      value={{
        fetcher: subscribe,
        inputRef,
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
  let subscribe = useFetcher();
  let transition = useTransition();

  return (
    <subscribe.Form
      replace
      action="/_actions/newsletter"
      method="post"
      className={cx(className, {
        ["opacity-50"]: transition.state === "submitting",
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
  let { inputRef, fetcher } = useSubscribeContext();
  return (
    <SubscribeInput
      ref={inputRef}
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
  let transition = useTransition();
  return (
    <Button
      onClick={(event) => {
        onClick?.(event);
        if (transition.state === "submitting") {
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
  let transition = useTransition();
  let { fetcher } = useSubscribeContext();
  let subscribe = fetcher as any;
  return (
    <div aria-live="polite" className="py-2 h-4">
      {transition.state === "idle" && subscribe.data?.ok && (
        <div className="text-white">
          <b className="text-green-brand">Got it!</b> Please go{" "}
          <b className="text-red-brand">check your email</b> to confirm your
          subscription, otherwise you won't get our email.
        </div>
      )}
      {transition.state === "idle" && subscribe.data?.error && (
        <div className="text-red-brand">{subscribe.data.error}</div>
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
