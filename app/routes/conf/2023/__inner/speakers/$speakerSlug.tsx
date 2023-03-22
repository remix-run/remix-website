import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  HeadersFunction,
} from "@remix-run/node";
import { Link, useCatch, useParams, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import speakersStylesUrl from "~/styles/conf-speaker.css";
import { sluggify } from "~/lib/conf";
import { CACHE_CONTROL } from "~/lib/http.server";
import { getSpeakers, getSpeakerSessions } from "~/lib/conf2023.server";
import type { Speaker, SpeakerSession } from "~/lib/conf2023.server";
import invariant from "tiny-invariant";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: speakersStylesUrl }];
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (data) {
    let { speaker /*, talks */ } = data;
    return {
      title: `${speaker.nameFull} at Remix Conf`,
      //   description: `${speaker.name} (${
      //     speaker.title
      //   }) is speaking at Remix Conf: ${talks
      //     .map((t) => `"${t.title}"`)
      //     .join(", ")}`,
    };
  }
  return {
    title: "Missing Speaker",
    description: "There is no speaker info at this URL.",
  };
};

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.speakerSlug, "Missing speaker slug");
  let speakerSlug = params.speakerSlug;
  let speakers: Speaker[] = [];
  let allSessions: SpeakerSession[] = [];

  try {
    // Unfortunately, Sessionize doesn't have an API for fetching a single
    // speaker, so we have to fetch all of them and then filter down to the one
    // we want.
    [speakers, allSessions] = await Promise.all([
      getSpeakers(),
      getSpeakerSessions(),
    ]);
  } catch (err) {
    throw json(
      {
        error:
          err && typeof err === "object" && "message" in err
            ? err.message
            : "Something went wrong",
      },
      { status: 400 }
    );
  }

  let speaker = speakers.find((s) => sluggify(s.nameFull) === speakerSlug);
  let speakerSessions = allSessions.filter((s) =>
    s.speakers.some((sp) => sp.id === speaker?.id)
  );
  if (!speaker) {
    throw json(null, 404);
  }
  return json(
    {
      speaker: {
        ...speaker,
        sessions: speakerSessions.map((session) => {
          let startsAt = session.startsAt ? new Date(session.startsAt) : null;
          let endsAt = session.endsAt ? new Date(session.endsAt) : null;
          return {
            ...session,
            startsAtISO: startsAt?.toISOString() || null,
            startsAtFormatted:
              startsAt?.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                timeZone: "America/Denver",
              }) || null,
            endsAtISO: endsAt?.toISOString() || null,
            endsAtFormatted:
              endsAt?.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                timeZone: "America/Denver",
              }) || null,
          };
        }),
      },
    },
    { headers: { "Cache-Control": CACHE_CONTROL.conf } }
  );
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  };
};

export default function SpeakerRoute() {
  let { speaker } = useLoaderData<typeof loader>();

  let tagLine = speaker.tagLine;
  let twitterHandle = speaker.twitterHandle
    ? cleanTwitterHandle(speaker.twitterHandle)
    : null;
  let linkText = speaker.link || (twitterHandle ? `@${twitterHandle}` : null);
  let linkHref = speaker.link
    ? toUrl(speaker.link)
    : twitterHandle
    ? `https://twitter.com/${twitterHandle}`
    : null;

  return (
    <div>
      <div className="mb-10 flex flex-col gap-10 text-white md:flex-row">
        {speaker.imgUrl ? (
          <img
            src={speaker.imgUrl}
            alt={speaker.nameFull}
            className="h-36 w-36 rounded-md object-cover md:h-64 md:w-64"
            style={{ aspectRatio: "1/1" }}
          />
        ) : null}
        <div className="text-lg lg:text-xl">
          <h1 className="mb-2 font-display text-3xl font-extrabold sm:text-5xl xl:text-7xl">
            {speaker.nameFull}
          </h1>
          {tagLine || linkHref ? (
            <div className="mt-4">
              {tagLine ? <p>{tagLine}</p> : null}
              {linkHref ? (
                <a className="underline" href={linkHref}>
                  <span className="mt-2 text-sm font-semibold uppercase">
                    {linkText}
                  </span>
                </a>
              ) : null}
            </div>
          ) : null}

          {speaker.bio ? (
            <div className="speaker-prose mt-4 md:mt-8">
              {speaker.bio.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {speaker.sessions.length ? (
        <div className="mt-10">
          {speaker.sessions.map((session) => {
            let startsAtISO = session.startsAtISO;
            let startsAtFormatted = session.startsAtFormatted;
            // let endsAt = session.endsAt ? new Date(session.endsAt) : null;
            return (
              <div key={session.title} className="flex flex-col gap-4">
                <div>
                  <h2 className="inline font-display text-xl font-extrabold md:text-3xl">
                    {session.title}
                  </h2>
                  {startsAtISO ? (
                    <span
                      className="pl-2 underline"
                      //   to={`../schedule/may-25${
                      //     startsAt ? `#time-${sluggify(session.id)}` : ""
                      //   }`}
                    >
                      <time dateTime={startsAtISO}>{startsAtFormatted}</time>{" "}
                      {/* {session.type === "lightning" ? (
                        <span title="Lightning talk">⚡</span>
                      ) : (
                        ""
                      )} */}
                    </span>
                  ) : null}
                </div>
                {session.description ? (
                  <div
                    className="speaker-prose"
                    dangerouslySetInnerHTML={{ __html: session.description }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
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

function toUrl(url: string) {
  try {
    url = /^https?:\/\//.test(url) ? url : `https://${url}`;
    let u = new URL(url);
    u.protocol = u.protocol.replace(/^https?/, "https");
    return u.toString();
  } catch (err) {
    return null;
  }
}

function cleanTwitterHandle(handle: string) {
  return handle.replace(/^@/, "");
}
