import * as React from "react";
import { Link, MetaFunction } from "remix";

export const meta: MetaFunction = () => ({
  title: "May 25th at Remix Conf",
  description: "May 25th is the day of the conference at Remix Conf.",
});

import type { LoaderFunction } from "remix";
import { json, useLoaderData } from "remix";
import { getSpeakers, getTalks } from "~/utils/conf.server";
import { Speaker, Talk } from "~/utils/conf";

type SpeakerInfo = Pick<Speaker, "imgSrc" | "name" | "slug">;
type TalkWithSpeaker = Omit<Talk, "speakers"> & {
  speakers: Array<SpeakerInfo>;
};
type LoaderData = { talks: Array<TalkWithSpeaker> };

export const loader: LoaderFunction = async () => {
  const [talks, speakers] = await Promise.all([getTalks(), getSpeakers()]);
  const talksWithSpeakers = talks.map((talk) => {
    const speakersForTalk = speakers
      .filter((speaker) => talk.speakers.includes(speaker.name))
      .map(({ name, slug, imgSrc }) => ({ name, slug, imgSrc }));
    return { ...talk, speakers: speakersForTalk };
  });
  return json<LoaderData>({
    talks: talksWithSpeakers,
  });
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
          <Link className="underline" to="/conf/speak">
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
                  {talk.title} by{" "}
                  {listify(
                    talk.speakers.map((s) => (
                      <Link
                        key={s.slug}
                        className="underline"
                        to={`/conf/speakers/${s.slug}`}
                      >
                        {s.name}
                      </Link>
                    ))
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-20">
        <h2 className="text-m-h3 font-display md:text-d-h3">After Party</h2>
        <small>7:00pm - 10:00pm</small>
        <p>More details to be provided soon! But it'll be super fun!</p>
      </div>
    </div>
  );
}

function listify(list: Array<React.ReactElement>) {
  if (list.length < 2) return list;
  if (list.length === 2) {
    const [first, second] = list;
    return [
      first,
      <React.Fragment key="and">{" and "}</React.Fragment>,
      second,
    ];
  }

  const els: Array<React.ReactElement> = [];
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    const isFirst = index === 0;
    if (isFirst) {
      els.push(element);
      continue;
    }
    const isLast = index === list.length - 1;
    if (isLast) {
      els.push(<React.Fragment key={index}>{", and "}</React.Fragment>);
    } else {
      els.push(<React.Fragment key={index}>, </React.Fragment>);
    }
    els.push(element);
  }
  return els;
}
