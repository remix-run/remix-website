import { json, Form, useTransition, useActionData } from "remix";
import type { ActionFunction } from "remix";
import { Button, Input } from "~/components/buttons";
import { requirePost } from "~/utils/http.server";
import { subscribeToNewsletter } from "~/utils/convertkit";
import { useEffect, useRef } from "react";

export function meta() {
  return {
    title: "Remix Newsletter",
  };
}

export let action: ActionFunction = async ({ request }) => {
  requirePost(request);

  let body = new URLSearchParams(await request.text());
  let email = body.get("email");
  if (typeof email !== "string" || email.indexOf("@") === -1) {
    return json({ error: "Invalid Email" }, { status: 400 });
  }

  try {
    await subscribeToNewsletter(email);
  } catch (e: any) {
    return json({ error: e.message || "Unknown error" });
  }

  return json({ ok: true });
};

export default function Newsletter() {
  let transition = useTransition();
  let actionData = useActionData();
  let inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (transition.state === "idle" && actionData?.ok && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [transition.state, actionData]);

  return (
    <div
      x-comp="Newsletter"
      className="container md:max-w-2xl flex-1 flex flex-col justify-center"
    >
      <div>
        <div className="h-8" />
        <div className="font-display text-m-h1 text-white">Newsletter</div>
        <div className="h-6" />
        <div className="text-m-p-lg" id="newsletter-text">
          Stay up-to-date with news, announcements, and releases for our
          projects like Remix and React Router. We respect your privacy,
          unsubscribe at any time.
        </div>
        <div className="h-9" />
        <Form
          replace
          method="post"
          className={
            "sm:flex sm:gap-2 " +
            (transition.state === "submitting" ? "opacity-50" : "")
          }
        >
          <Input
            aria-describedby="newsletter-text"
            ref={inputRef}
            type="email"
            name="email"
            placeholder="you@example.com"
            className="w-full sm:w-auto sm:flex-1 placeholder-gray-500"
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
        </Form>
        <div aria-live="polite" className="py-2 h-4">
          {transition.state === "idle" && actionData?.ok && (
            <div className="text-white">
              <b className="text-green-brand">Got it!</b> Please go{" "}
              <b className="text-red-brand">check your email</b> to confirm your
              subscription, otherwise you won't get our email.
            </div>
          )}
          {transition.state === "idle" && actionData?.error && (
            <div className="text-red-brand">{actionData.error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
