import { HeadersFunction, Link, MetaFunction } from "remix";

export const meta: MetaFunction = () => ({
  title: "May 25th at Remix Conf",
  description: "May 25th is the day of the conference at Remix Conf.",
});

import type { LoaderFunction } from "remix";
import { json, useLoaderData } from "remix";
import { getSchedule } from "~/utils/conf.server";
import { CACHE_CONTROL } from "~/utils/http.server";
import { sluggify } from "~/utils/conf";

type LoaderData = { scheduleItems: Awaited<ReturnType<typeof getSchedule>> };

export const loader: LoaderFunction = async () => {
  const scheduleItems = await getSchedule();
  return json<LoaderData>(
    { scheduleItems },
    { headers: { "Cache-Control": CACHE_CONTROL } }
  );
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL,
  };
};

export default function May25Schedule() {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <div>
        <small>9:00am - 4:30pm</small>{" "}
        <small>(This schedule may change.)</small>
        <table className="w-full mt-6 border-collapse">
          <thead className="sr-only">
            <tr>
              <th>Time</th>
              <th>Talk Details</th>
            </tr>
          </thead>
          <tbody>
            {data.scheduleItems.map((scheduleItem) => (
              <tr
                key={scheduleItem.time}
                className="border-t border-b border-gray-200"
                id={`time-${sluggify(scheduleItem.time)}`}
              >
                <td className="p-2 whitespace-nowrap">{scheduleItem.time}</td>
                <td className="p-2 flex flex-col gap-4">
                  <span
                    className="md:text-m-p-lg text-d-p-lg font-bold"
                    dangerouslySetInnerHTML={{
                      __html: scheduleItem.titleHTML,
                    }}
                  />
                  <div className="flex gap-3 sm:gap-4 md:gap-5 items-start flex-col sm:flex-row">
                    {scheduleItem.speakers?.length ? (
                      <span className="flex gap-2 sm:gap-3 md:gap-5 flex-wrap">
                        {scheduleItem.speakers.map((s) => (
                          <Link
                            key={s.slug}
                            className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32"
                            to={`/conf/speakers/${s.slug}`}
                          >
                            <img
                              src={s.imgSrc}
                              className="rounded-md"
                              alt={s.name}
                              title={s.name}
                            />
                          </Link>
                        ))}
                      </span>
                    ) : null}
                    <div
                      className="flex-1"
                      dangerouslySetInnerHTML={{
                        __html: scheduleItem.contentHTML,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-10">
        <small>
          The conference will be live streamed and recordings of all the talks
          will be uploaded to{" "}
          <a className="underline" href="https://rmx.as/youtube">
            YouTube
          </a>{" "}
          soon after the event.
        </small>
      </div>
      <div className="mt-20">
        <h2 className="text-m-h3 font-display md:text-d-h3">After Party</h2>
        <small>7:00pm - 10:00pm</small>
        <p>
          After a full day of stellar talks, relax and have fun with fellow
          Remix enthusiasts, speakers, and sponsors at our official Remix
          after-party (same venue). We are busy planning all the details to
          ensure there is a little fun for everyone to enjoy... more information
          coming soon.{" "}
        </p>
      </div>
    </div>
  );
}
