import {
  Link,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  useCatch,
  useParams,
} from "remix";
import { json, useLoaderData } from "remix";
import { getSpeakers, getTalks } from "~/utils/conf.server";
import speakersStylesUrl from "~/styles/conf-speaker.css";
import { isSpeaker, Speaker, Talk, isTalkArray } from "~/utils/conf";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: speakersStylesUrl }];
};

export const meta: MetaFunction = ({ data }) => {
  if (data) {
    const { speaker, talks } = data;
    if (isSpeaker(speaker) && isTalkArray(talks)) {
      return {
        title: `${speaker.name} at Remix Conf`,
        description: `${speaker.name} (${
          speaker.title
        }) is speaking about ${talks
          .map((t) => `"${t.title}"`)
          .join(", ")} at Remix Conf.`,
      };
    }
  }
  return {
    title: "Missing Speaker",
    description: "Wanna speak at Remix Conf?",
  };
};

type LoaderData = { speaker: Speaker; talks: Array<Talk> };

export const loader: LoaderFunction = async ({ params }) => {
  const [allTalks, allSpeakers] = await Promise.all([
    getTalks(),
    getSpeakers(),
  ]);
  const speaker = allSpeakers.find((s) => s.slug === params.speakerSlug);
  if (!speaker) throw new Response("Speaker not found", { status: 404 });
  const talks = allTalks.filter((t) => t.speakers.includes(speaker.name));
  return json<LoaderData>({
    speaker,
    talks,
  });
};

export default function Speaker() {
  const { speaker, talks } = useLoaderData<LoaderData>();
  return (
    <div>
      <div className="mb-10 flex flex-col md:flex-row gap-10 text-white">
        <img
          src={speaker.imgSrc}
          alt={speaker.name}
          className="object-cover rounded-md w-36 h-36 md:w-64 md:h-64"
          style={{ aspectRatio: "1/1" }}
        />
        <div className="text-m-p-lg lg:text-d-p-lg">
          <h1 className="font-display text-m-h1 sm:text-d-h2 xl:text-d-j mb-2">
            {speaker.name}
          </h1>
          <div className="mt-4">
            <p>{speaker.title}</p>
            <a
              href={speaker.link}
              className="underline text-m-p-sm font-semibold uppercase mt-2"
            >
              {speaker.linkText}
            </a>
          </div>
          <div
            className="mt-4 md:mt-8 speaker-prose"
            dangerouslySetInnerHTML={{ __html: speaker.bio }}
          />
        </div>
      </div>
      {talks.length ? (
        <div className="mt-10">
          {talks.map((talk) => (
            <div key={talk.title} className="flex flex-col gap-4">
              <div>
                <h2 className="text-m-h3 font-display md:text-d-h3 inline">
                  {talk.title}
                </h2>
                <Link className="underline pl-2" to="../schedule/may-25">
                  <time>{talk.time}</time>
                </Link>
              </div>
              <div
                className="speaker-prose"
                dangerouslySetInnerHTML={{ __html: talk.description }}
              />
            </div>
          ))}
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
        <h1 className="font-jet-mono text-m-h1 sm:text-d-h2 text-white xl:text-d-j mb-10">
          Speaker not found
        </h1>
        <div className="container text-m-p-lg lg:text-d-p-lg text-white">
          <p>
            No speaker found with the slug "{params.speakerSlug}".{" "}
            <Link to="../speak" className="underline">
              Would you like to speak?
            </Link>
          </p>
        </div>
      </div>
    );
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
