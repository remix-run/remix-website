import * as React from "react";
import { useFetcher, useTransition } from "remix";
import { Button, Input } from "./buttons";

export function Subscribe({
  descriptionId,
  formClassName = "flex gap-4 flex-col",
}: {
  descriptionId: string;
  formClassName?: string;
}) {
  let subscribe = useFetcher();
  let transition = useTransition();
  let inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (transition.state === "idle" && subscribe.data?.ok && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [transition.state, subscribe.data]);

  return (
    <div>
      <subscribe.Form
        replace
        action="/_actions/newsletter"
        method="post"
        className={
          formClassName +
          (transition.state === "submitting" ? " opacity-50" : "")
        }
      >
        <Input
          ref={inputRef}
          type="email"
          name="email"
          placeholder="you@example.com"
          className="w-full sm:w-auto sm:flex-1 dark:placeholder-gray-500"
          aria-invalid={Boolean(subscribe.data?.error) || undefined}
          aria-describedby={descriptionId}
        />
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
    </div>
  );
}
