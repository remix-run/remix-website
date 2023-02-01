import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "~/components/primitives/tabs";
import { Link, Outlet, useMatches, useNavigate } from "@remix-run/react";
import type { MetaFunction, HeadersFunction } from "@remix-run/node";
import { CACHE_CONTROL } from "~/utils/http.server";
import { InnerLayout } from "./_ui";

export const meta: MetaFunction = () => ({
  title: "Remix Conf Schedule",
  description: "What's happening and when at Remix Conf",
});

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  };
};

export default function Safety() {
  const matches = useMatches();
  const navigate = useNavigate();
  const last = matches[matches.length - 1];
  const days: Array<{ name: string; slug: string; displayDate: string }> = [
    { name: "Workshops", slug: "may-24", displayDate: "May 24th" },
    { name: "Conference", slug: "may-25", displayDate: "May 25th" },
    { name: "Activities", slug: "may-26", displayDate: "May 26th" },
  ];

  let splitPath = last.pathname.split("/");
  const day = splitPath[splitPath.length - 1] ?? "may-25";
  const selectedDay = days.findIndex(({ slug }) => slug === day);
  const tabIndex = selectedDay === -1 ? 1 : selectedDay;

  return (
    <InnerLayout>
      <div className="text-white">
        <h1 className="mb-16 font-display font-extrabold text-3xl sm:text-5xl xl:text-7xl">
          Remix Conf Schedule
        </h1>
        <div className="container flex flex-col gap-10 text-lg lg:text-xl">
          <p>
            Get ready for some amazing UX/DX goodness at Remix Conf!
            <br />
            <small>
              (This is a preliminary schedule and is subject to change).
            </small>
          </p>

          <Tabs
            index={tabIndex}
            onChange={(index) => {
              const { slug } = days[index] ?? {};
              if (slug) {
                navigate(slug, { replace: true });
              }
            }}
          >
            <TabList className="flex justify-around">
              {days.map(({ name, slug, displayDate }, i) => (
                <Tab
                  key={slug}
                  index={i}
                  tabIndex={-1}
                  className="w-full"
                  onFocus={(e) => {
                    const [link] = e.currentTarget.children;
                    if (link instanceof HTMLElement) {
                      link.focus();
                    }
                  }}
                >
                  <Link
                    className="block w-full"
                    prefetch="intent"
                    to={slug}
                    onClick={(e) => {
                      if (e.metaKey) {
                        e.stopPropagation();
                      } else {
                        e.preventDefault();
                      }
                    }}
                  >
                    <span className="hidden lg:inline">
                      {displayDate}
                      {": "}
                    </span>
                    {name}
                  </Link>
                </Tab>
              ))}
            </TabList>

            <TabPanels className="pt-10">
              {days.map(({ slug, displayDate, name }, index) => (
                <TabPanel key={slug} index={index}>
                  <h2 className="text-xl lg:text-3xl mb-4 font-display font-extrabold">
                    {displayDate}: {name}
                  </h2>
                  {tabIndex === index ? <Outlet /> : null}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </div>
      </div>
    </InnerLayout>
  );
}
