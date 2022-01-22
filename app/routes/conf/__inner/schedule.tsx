import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import { Link, Outlet, useMatches, useNavigate } from "remix";
import type { MetaFunction } from "remix";

export const meta: MetaFunction = () => ({
  title: "Remix Conf Schedule",
  description: "What's happening and when at Remix Conf",
});

export default function Safety() {
  const matches = useMatches();
  const navigate = useNavigate();
  const last = matches[matches.length - 1];
  const days: Array<[string, string]> = [
    ["May 24th", "may-24"],
    ["May 25th", "may-25"],
    ["May 26th", "may-26"],
  ];
  const day = last.pathname.split("/").at(-1) ?? "may-25";
  const selectedDay = days.findIndex(([, d]) => d === day);
  const tabIndex = selectedDay === -1 ? 1 : selectedDay;

  return (
    <div className="text-white">
      <h1 className="font-display text-m-h1 sm:text-d-h2 xl:text-d-j mb-16">
        Remix Conf Schedule
      </h1>
      <div className="container text-m-p-lg lg:text-d-p-lg flex flex-col gap-10">
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
            const [, chosenRoute] = days[index];
            if (chosenRoute) {
              navigate(chosenRoute, { replace: true });
            }
          }}
        >
          <TabList className="flex justify-around">
            {days.map(([day, route]) => (
              <Tab
                key={route}
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
                  className="w-full block"
                  to={route}
                  onClick={(e) => {
                    if (e.metaKey) {
                      e.stopPropagation();
                    } else {
                      e.preventDefault();
                    }
                  }}
                >
                  {day}
                </Link>
              </Tab>
            ))}
          </TabList>

          <TabPanels className="pt-10">
            {days.map(([d], index) => (
              <TabPanel key={d}>
                {tabIndex === index ? <Outlet /> : null}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}
