import type { HeadersFunction, MetaFunction } from "remix";
import { CACHE_CONTROL } from "~/utils/http.server";

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
    <div>
      <h1 className="font-display text-m-h1 sm:text-d-h2 text-white xl:text-d-j mb-16">
        Become a Remix Conf Sponsor
      </h1>
      <div className="container text-m-p-lg lg:text-d-p-lg text-white flex flex-col gap-4">
        <p>
          We're excited you're interested in sponsoring the conference!
          Sponsoring Remix Conf will connect your company and brand to a group
          of <strong>experienced</strong> software engineers (and their
          managers) looking into the latest and greatest technology for building
          web applications.
        </p>
        <p>
          If that sounds interesting to you, please email us at{" "}
          <strong>
            <a className="underline" href="mailto:conf@remix.run">
              conf@remix.run
            </a>
            {". "}
          </strong>
        </p>
        <p>We look forward to hearing from you.</p>
      </div>
    </div>
  );
}
