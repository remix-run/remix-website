import type { HeadersFunction, MetaFunction } from "@remix-run/node";
import { CACHE_CONTROL } from "~/utils/http.server";

export const meta: MetaFunction = () => ({
  title: "Remix Conf 2023 Sponsorship",
  description: "Sponsorship opportunities for Remix Conf.",
});

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  };
};

export default function SponsorUs() {
  return (
    <div>
      <div className="">
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white mb-5 sm:mb-8 lg:mb-16">
          Become a Remix Conf Sponsor
        </h1>
        <div className="text-lg lg:text-xl flex flex-col gap-3 lg:gap-4">
          <p>
            We're excited you're interested in sponsoring the conference!
            Sponsoring Remix Conf will connect your company and brand to a group
            of <strong>experienced</strong> software engineers (and their
            managers) looking into the latest and greatest technology for
            building web applications.
          </p>
          <p>
            If that sounds interesting to you, please email us at{" "}
            <a className="underline font-bold" href="mailto:conf@remix.run">
              conf@remix.run
            </a>
            .
          </p>
          <p>We look forward to hearing from you!</p>
        </div>
      </div>
    </div>
  );
}
