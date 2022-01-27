import { HeadersFunction, Link, MetaFunction } from "remix";

export const meta: MetaFunction = () => ({
  title: "May 25th at Remix Conf",
  description: "May 25th is the day of the conference at Remix Conf.",
});

import type { LoaderFunction } from "remix";
import { json, useLoaderData } from "remix";
import { getSpeakers, getTalks } from "~/utils/conf.server";
import { Speaker, Talk } from "~/utils/conf";
import { CACHE_CONTROL } from "~/utils/http.server";

type SpeakerInfo = Pick<Speaker, "imgSrc" | "name" | "slug">;
type TalkWithSpeaker = Omit<Talk, "speakers" | "description"> & {
  speakers: Array<SpeakerInfo>;
};
type LoaderData = { talks: Array<TalkWithSpeaker> };

export const loader: LoaderFunction = async () => {
  const [talks, speakers] = await Promise.all([getTalks(), getSpeakers()]);
  const talksWithSpeakers = talks.map(({ description, ...talk }) => {
    const speakersForTalk = speakers
      .filter((speaker) => talk.speakers.includes(speaker.name))
      .map(({ name, slug, imgSrc }) => ({ name, slug, imgSrc }));
    return { ...talk, speakers: speakersForTalk };
  });
  return json<LoaderData>(
    { talks: talksWithSpeakers },
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
        <h2 className="text-m-h3 font-display md:text-d-h3">
          Single Track Conference
        </h2>
        <small>9:00am - 4:30pm</small>{" "}
        <small>
          (This schedule is likely to change.{" "}
          <Link className="underline" to="/conf/speakers/you">
            Want to Speak?
          </Link>
          )
        </small>
        <table className="w-full mt-6 border-collapse">
          <thead className="sr-only">
            <tr>
              <th>Time</th>
              <th>Talk Details</th>
            </tr>
          </thead>
          <tbody>
            {data.talks.map((talk) => (
              <tr key={talk.time}>
                <td className="border-t border-b border-gray-200 p-2">
                  {talk.time}
                </td>
                <td className="border-t border-b border-gray-200 p-2">
                  <TalkDetails talk={talk} />
                </td>
              </tr>
            ))}
            <tr>
              <td className="border-t border-b border-gray-200 p-2">...</td>
              <td className="border-t border-b border-gray-200 p-2">
                <div className="flex sm:items-center flex-col gap-2 sm:gap-4 sm:flex-row">
                  <TalkDetails
                    talk={{
                      time: "...",
                      title: "TBA",
                      speakers: [
                        {
                          imgSrc: "/conf-images/mystery-speaker.jpg",
                          name: "You?",
                          slug: "you",
                        },
                      ],
                    }}
                  />
                  <Link
                    className="underline text-d-p-sm md:text-d-p-lg"
                    to="/conf/speakers/you"
                  >
                    Submit your talk
                  </Link>
                </div>
              </td>
            </tr>
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

function TalkDetails({ talk }: { talk: TalkWithSpeaker }) {
  return (
    <div className="flex gap-2 sm:gap-3 md:gap-5 items-start flex-col">
      <span>{talk.title} by</span>
      <span className="flex gap-2 sm:gap-3 md:gap-5 flex-wrap">
        {talk.speakers.map((s) => (
          <Link
            key={s.slug}
            className="w-10 h-10 sm:w-16 sm:h-16 md:w-24 md:h-24"
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
    </div>
  );
}
