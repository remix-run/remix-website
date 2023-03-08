import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  HeadersFunction,
} from "@remix-run/node";
import { Link, useCatch, useParams, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getSpeakers, getTalks } from "~/lib/conf.server";
import speakersStylesUrl from "~/styles/conf-speaker.css";
import { sluggify } from "~/lib/conf";
import { CACHE_CONTROL } from "~/lib/http.server";
import { InnerLayout } from "../_ui";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: speakersStylesUrl }];
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (data) {
    const { speaker, talks } = data;
    return {
      title: `${speaker.name} at Remix Conf`,
      description: `${speaker.name} (${
        speaker.title
      }) is speaking at Remix Conf: ${talks
        .map((t) => `"${t.title}"`)
        .join(", ")}`,
    };
  }
  return {
    title: "Missing Speaker",
    description: "There is no speaker info at this URL.",
  };
};

export const loader = async ({ params }: LoaderArgs) => {
  const [allTalks, allSpeakers] = await Promise.all([
    getTalks(2022),
    getSpeakers(2022),
  ]);
  const speaker = allSpeakers.find((s) => s.slug === params.speakerSlug);
  if (!speaker) throw new Response("Speaker not found", { status: 404 });
  const talks = allTalks
    .filter((t) => t.speakers.includes(speaker.name))
    // get rid of the description, we only use the HTML
    .map(({ description, ...rest }) => rest);
  return json(
    { speaker, talks },
    { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } }
  );
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  };
};

export default function SpeakerRoute() {
  const { speaker, talks } = useLoaderData<typeof loader>();
  return (
    <InnerLayout>
      <div>
        <div className="mb-10 flex flex-col gap-10 text-white md:flex-row">
          <img
            src={speaker.imgSrc}
            alt={speaker.name}
            className="h-36 w-36 rounded-md object-cover md:h-64 md:w-64"
            style={{ aspectRatio: "1/1" }}
          />
          <div className="text-lg lg:text-xl">
            <h1 className="mb-2 font-display text-3xl font-extrabold sm:text-5xl xl:text-7xl">
              {speaker.name}
            </h1>
            <div className="mt-4">
              <p>{speaker.title}</p>
              <a
                href={speaker.link}
                className="mt-2 text-sm font-semibold uppercase underline"
              >
                {speaker.linkText}
              </a>
            </div>
            <div
              className="speaker-prose mt-4 md:mt-8"
              dangerouslySetInnerHTML={{ __html: speaker.bioHTML }}
            />
          </div>
        </div>
        {talks.length ? (
          <div className="mt-10">
            {talks.map((talk) => (
              <div key={talk.title} className="flex flex-col gap-4">
                <div>
                  <h2 className="inline font-display text-xl font-extrabold md:text-3xl">
                    {talk.title}
                  </h2>
                  {talk.type === "backup" ? (
                    <Link className="pl-2 underline" to="../schedule/may-24">
                      <span className="pl-2">backup talk</span>
                    </Link>
                  ) : (
                    <Link
                      className="pl-2 underline"
                      to={`../schedule/may-25${
                        talk.time ? `#time-${sluggify(talk.time)}` : ""
                      }`}
                    >
                      <time>{talk.time}</time>{" "}
                      {talk.type === "lightning" ? (
                        <span title="Lightning talk">⚡</span>
                      ) : (
                        ""
                      )}
                    </Link>
                  )}
                </div>
                <div
                  className="speaker-prose"
                  dangerouslySetInnerHTML={{ __html: talk.descriptionHTML }}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </InnerLayout>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();

  if (caught.status === 404) {
    return (
      <div>
        <h1 className="mb-10 font-mono text-3xl text-white sm:text-5xl xl:text-7xl">
          Speaker not found
        </h1>
        <div className="container text-lg text-white lg:text-xl">
          <p>
            No speaker found with the slug "{params.speakerSlug}".{" "}
            <Link to="../speakers/you" className="underline">
              Would you like to speak?
            </Link>
          </p>
        </div>
      </div>
    );
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
