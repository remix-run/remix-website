import { Form, useTransition, useActionData } from "@remix-run/react";
import { Button, Input } from "~/components/buttons";
import { useEffect, useRef } from "react";
import { Subscribe } from "~/components/subscribe";

export function meta() {
  return {
    title: "Remix Newsletter",
  };
}

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
        <div className="font-display font-extrabold text-3xl text-white">Newsletter</div>
        <div className="h-6" />
        <div className="text-lg" id="newsletter-text">
          Stay up-to-date with news, announcements, and releases for our
          projects like Remix and React Router. We respect your privacy,
          unsubscribe at any time.
        </div>
        <div className="h-9" />
        <Subscribe
          formClassName="sm:flex sm:gap-2"
          descriptionId="newsletter-text"
        />
      </div>
    </div>
  );
}
