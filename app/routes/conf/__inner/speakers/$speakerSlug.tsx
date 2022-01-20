import {
  Link,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  useCatch,
  useParams,
} from "remix";
import { json, useLoaderData } from "remix";
import { getSpeakers, isSpeaker, Speaker } from "~/utils/conf.server";
import speakersStylesUrl from "~/styles/conf-speaker.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: speakersStylesUrl }];
};

export const meta: MetaFunction = ({ data }) => {
  if (data) {
    const { speaker } = data;
    if (isSpeaker(speaker)) {
      return {
        title: `${speaker.name} at Remix Conf`,
        description: `${speaker.name} (${speaker.title}) is speaking at Remix Conf.`,
      };
    }
  }
  return {
    title: "Missing Speaker",
    description: "Wanna speak at Remix Conf?",
  };
};

type LoaderData = { speaker: Speaker };

export const loader: LoaderFunction = async ({ params }) => {
  const speakers = await getSpeakers();
  const speaker = speakers.find((s) => s.slug === params.speakerSlug);
  if (!speaker) throw new Response("Speaker not found", { status: 404 });
  return json<LoaderData>({
    speaker,
  });
};

export default function Speaker() {
  const { speaker } = useLoaderData<LoaderData>();
  return (
    <div>
      <div className="mb-10 flex flex-col md:flex-row gap-10 text-white">
        <img
          src={speaker.imgSrc}
          alt={speaker.name}
          className="rounded-md w-36 h-36 md:w-64 md:h-64"
        />
        <div className="text-m-p-lg lg:text-d-p-lg">
          <h1 className="font-jet-mono text-m-h1 sm:text-d-h2 xl:text-d-j mb-2">
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
            className="mt-4 md:mt-8 speaker-bio"
            dangerouslySetInnerHTML={{ __html: speaker.bio }}
          />
        </div>
      </div>
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
