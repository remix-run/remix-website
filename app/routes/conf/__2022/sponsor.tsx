import type { HeadersFunction, MetaFunction } from "@remix-run/node";
import { CACHE_CONTROL } from "~/utils/http.server";
import { InnerLayout } from "./_ui";

export const meta: MetaFunction = () => ({
  title: "Remix Conf Sponsorship",
  description: "Sponsorship opportunities for Remix Conf.",
});

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL,
  };
};

export default function SponsorUs() {
  return (
    <InnerLayout>
      <div>
        <h1 className="font-display text-m-h1 sm:text-d-h2 text-white xl:text-d-j mb-16">
          Become a Remix Conf Sponsor
        </h1>
        <div className="container text-m-p-lg lg:text-d-p-lg text-white flex flex-col gap-4">
          <p>
            Sponsorship for Remix Conf 2022 is sold out, but we are currently
            planning Remix Conf 2023.
          </p>
          <p>
            If you're interested in sponsoring for next year, please email us at{" "}
            <a className="underline font-bold" href="mailto:conf@remix.run">
              conf@remix.run
            </a>
            .
          </p>
          <p>We look forward to hearing from you!</p>
        </div>
      </div>
    </InnerLayout>
  );
}
