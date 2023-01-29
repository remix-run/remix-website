import { primaryButtonLinkClass } from "~/components/buttons";
import type { HeadersFunction, MetaFunction } from "@remix-run/node";
import { CACHE_CONTROL } from "~/utils/http.server";
import { InnerLayout } from "./_ui";

export const meta: MetaFunction = () => ({
  title: "Remix Conf Workshops",
  description: "Premium Remix Workshops from the Remix Team",
});

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  };
};

export default function Workshops() {
  return (
    <InnerLayout>
      <div className="text-white">
        <h1 className="font-display text-m-h1 sm:text-d-h2 xl:text-d-j mb-16">
          Premium Remix Workshops from the Remix Team
        </h1>
        <div className="container text-m-p-lg lg:text-d-p-lg flex flex-col gap-4">
          <p>
            Remix workshops are a great way to get insights and experience from
            the Remix team on how to use Remix to build stellar user
            experiences. They happen the day before the conference at the venue.
            Lunch, snacks, and beverages are included.
          </p>
          <div className="text-center">
            <a
              href="https://rmx.as/tickets"
              className={`${primaryButtonLinkClass} font-display uppercase`}
              children="Get Tickets"
            />
          </div>
        </div>
        <div className="mt-12 container grid grid-cols-1 lg:grid-cols-6 gap-12">
          <div className="col-span-3 lg:col-span-2">
            <div className="mt-4 text-m-p-lg lg:text-d-p-lg flex flex-col gap-6">
              <h2 className="font-display text-m-h2 lg:text-d-h2">
                Your instructors
              </h2>
              <div className="flex flex-col items-center lg:items-start lg:flex-row gap-8">
                <a
                  className="underline flex flex-col gap-4"
                  href="https://twitter.com/kentcdodds"
                >
                  <img
                    src="/k.jpg"
                    alt="Kent C. Dodds"
                    className="w-36 rounded-md"
                  />
                  <span>Kent C. Dodds</span>
                </a>
                <a
                  className="underline flex flex-col gap-4"
                  href="https://twitter.com/ryanflorence"
                >
                  <img
                    src="/r.jpg"
                    alt="Ryan Florence"
                    className="w-36 rounded-md"
                  />
                  <span>Ryan Florence</span>
                </a>
              </div>
            </div>
          </div>
          <div className="col-span-3 lg:col-span-4">
            <div className="mt-4 text-m-p-lg lg:text-d-p-lg flex flex-col gap-6">
              <h2 className="font-display text-m-h2 lg:text-d-h2">
                Web Apps with Remix
              </h2>
              <p>
                Learn to build state-of-the-art user interfaces on the web with
                Remix. If you've been wondering how to make the jump from
                "website" to "web app" with Remix, this is for you.
              </p>
              <p>At the end of this workshop, you'll know how to:</p>
              <ul className="list-disc list-inside">
                <li>
                  Eliminate busy indicators with Optimistic UI (while still
                  handling errors)
                </li>
                <li>
                  Optimize Remix's automatic data revalidation after mutations
                </li>
                <li>
                  Fetch data outside of navigations for data driven components
                  like Combobox/Autocomplete
                </li>
                <li>
                  Build global, animated navigation indicators, aware of
                  submissions, revalidation, and redirects.
                </li>
                <li>
                  Build skeleton UI for instant user feedback on navigation
                </li>
                <li>Step up your app's accessibility with focus management</li>
                <li>Map keyboard shortcuts to data mutations</li>
                <li>and more!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </InnerLayout>
  );
}
