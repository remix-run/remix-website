import { useNavigation, useActionData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Subscribe } from "~/ui/subscribe";
import type { action } from "~/routes/[_]actions.newsletter";

export const meta: MetaFunction = () => [
  {
    title: "Remix Newsletter",
  },
];

export default function Newsletter() {
  let navigation = useNavigation();
  let actionData = useActionData<typeof action>();
  let inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (navigation.state === "idle" && actionData?.ok && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [navigation.state, actionData]);

  return (
    <div
      x-comp="Newsletter"
      className="container flex flex-1 flex-col justify-center md:max-w-2xl"
    >
      <div>
        <div className="h-8" />
        <div className="text-3xl font-extrabold text-white">Newsletter</div>
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
