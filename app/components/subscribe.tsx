import * as React from "react";
import { useFetcher, useTransition } from "remix";
import { Button, Input } from "./buttons";

export function Subscribe({ descriptionId }: { descriptionId: string }) {
  let subscribe = useFetcher();
  let transition = useTransition();
  let inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (transition.state === "idle" && subscribe.data?.ok && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [transition.state, subscribe.data]);

  return (
    <subscribe.Form
      replace
      action="/_actions/newsletter"
      method="post"
      className={
        "flex gap-4 flex-col " +
        (transition.state === "submitting" ? "opacity-50" : "")
      }
    >
      <Input
        ref={inputRef}
        type="email"
        name="email"
        placeholder="you@example.com"
        className="w-full sm:w-auto sm:flex-1 dark:placeholder-gray-500"
        aria-invalid={Boolean(subscribe.data?.error) || undefined}
        aria-describedby={subscribe.data?.error ? "email-error" : descriptionId}
      />
      {subscribe.data?.error ? (
        <p
          className="text-red-600 dark:text-red-500"
          role="alert"
          id="email-error"
        >
          {subscribe.data.error}
        </p>
      ) : null}
      <Button
        onClick={(event) => {
          if (transition.state === "submitting") {
            event.preventDefault();
          }
        }}
        type="submit"
        className="w-full mt-2 sm:w-auto sm:mt-0 uppercase"
      >
        Subscribe
      </Button>
    </subscribe.Form>
  );
}
