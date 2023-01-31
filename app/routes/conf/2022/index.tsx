import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type {
  HeadersFunction,
  LinksFunction,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  OutlineButtonLink,
  primaryButtonLinkClass,
} from "~/components/buttons";
import indexStyles from "~/styles/index.css";
import { Fragment } from "react";
import type { Sponsor, Speaker } from "~/utils/conf";
import { getSpeakers, getSponsors } from "~/utils/conf.server";
import { Link } from "~/components/link";
import { CACHE_CONTROL } from "~/utils/http.server";

export const meta: MetaFunction<typeof loader> = ({ data: { siteUrl } }) => {
  let url = `${siteUrl}/conf`;
  let title = "Remix Conf - May 24-25, 2022";
  let image = `${siteUrl}/conf-images/og.1.png`;
  let description =
    "Join us in Salt Lake City, UT for our innaugural conference. Featuring distinguished speakers, workshops, and lots of fun in between. See you there!";
  return {
    title,
    description,
    "og:url": url,
    "og:title": title,
    "og:description": description,
    "og:image": image,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": title,
    "twitter:description": description,
    "twitter:image": image,
  };
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: indexStyles }];
};

export const loader = async ({ request }: LoaderArgs) => {
  const speakersOrdered = await getSpeakers(2022);
  const speakersShuffled = speakersOrdered
    // save a bit of data by not sending along the bio to the home page
    .map(
      ({
        // @ts-ignore
        bio,
        ...s
      }) => s
    )
    .sort(() => Math.random() - 0.5);

  const allSponsors = await getSponsors(2022);
  const sponsors = {
    premier: allSponsors.find((s) => s.level === "premier"),
    gold: allSponsors
      .filter((s) => s.level === "gold")
      .sort(() => Math.random() - 0.5),
    silver: allSponsors
      .filter((s) => s.level === "silver")
      .sort(() => Math.random() - 0.5),
    community: allSponsors
      .filter((s) => s.level === "community")
      .sort(() => Math.random() - 0.5),
  };

  let requestUrl = new URL(request.url);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  return json(
    { siteUrl, speakers: speakersShuffled, sponsors },
    { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } }
  );
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  };
};

export default function ConfIndex() {
  return (
    <div x-comp="Index">
      <Hero />
      <Speakers />
      <Sponsors />
    </div>
  );
}

function Hero() {
  return (
    <Fragment>
      <section
        x-comp="Hero"
        className="__hero pb-10 pt-40 sm:pb-16 sm:pt-48 md:pb-24 md:pt-52 lg:pb-32 lg:pt-64"
      >
        <div className="container relative">
          <div className="max-w-xl mx-auto md:mx-0">
            <h1 className="font-mono text-[length:32px] sm:text-[length:45px] lg:text-[length:64px] leading-tight __hero-text-shadow">
              <div className="text-white">May 24-25, 2022 </div>
              <div className="text-yellow-brand">Salt Lake City</div>
            </h1>
            <div className="h-6" />
            <div className="space-y-4 text-lg lg:text-xl text-white __hero-text-shadow">
              <p>
                Remix is a full stack web framework that lets you focus on the
                user interface and work back through web standards to deliver a
                fast, slick, and resilient user experience.
              </p>
              <p className="font-bold">
                We can't wait to tell you all about it.
              </p>
            </div>
            <div className="h-9" />
          </div>
          <div className="flex justify-center w-full">
            <a
              href="https://www.youtube.com/playlist?list=PLXoynULbYuEC36XutMMWEuTu9uuh171wx"
              className={`${primaryButtonLinkClass} w-full md:w-auto font-mono uppercase flex gap-2 sm:gap-4`}
            >
              <span aria-hidden>📺</span>
              <span>Watch the Recordings</span>
              <span aria-hidden>📺</span>
            </a>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

function Speakers() {
  const { speakers } = useLoaderData<typeof loader>();
  const mc = speakers.find((s) => s.type === "emcee");
  const talkSpeakers = speakers.filter((s) => s.type !== "emcee");
  return (
    <section className="py-20 __section-speakers" id="speakers">
      <div className="relative container">
        <h2 className="mb-6 md:mb-8 uppercase font-semibold text-center font-mono">
          Speakers
        </h2>
        <div className="px-6 lg:px-10 max-w-xs sm:max-w-2xl lg:max-w-5xl mx-auto">
          <div className="flex flex-col flex-wrap sm:flex-row gap-y-12 sm:gap-x-8 sm:gap-y-14 md:gap-x-8 2xl:gap-x-10 justify-center items-start">
            {talkSpeakers.map((speaker) => (
              <SpeakerDisplay
                speaker={speaker}
                key={speaker.name}
                className="basis-72"
              />
            ))}
          </div>
        </div>
        {mc ? (
          <div id="mc">
            <h2 className="mt-24 mb-6 md:mb-8 uppercase font-semibold text-center font-mono">
              Master of Ceremonies
            </h2>
            <div className="flex justify-center m-auto">
              <SpeakerDisplay speaker={mc} className="basis-72" />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SpeakerDisplay({
  speaker,
  className = "",
}: {
  speaker: Omit<Speaker, "bio">;
  className?: string;
}) {
  return (
    <Link
      to={`speakers/${speaker.slug}`}
      className={`__speaker-link h-full w-full flex items-center justify-center ${className}`}
      aria-label={`${speaker.name}, ${speaker.title}`}
      prefetch="intent"
    >
      <div className="w-full max-w-xs sm:max-w-none">
        <div className="__speaker-img rounded-md overflow-hidden aspect-w-1 aspect-h-1 bg-black">
          <img src={speaker.imgSrc} alt={speaker.name} title={speaker.name} />
        </div>
        <div className="mt-4">
          <h3>{speaker.name}</h3>
          <p className="text-sm">{speaker.title}</p>
          <p className="text-sm font-semibold uppercase mt-2">
            {speaker.linkText}
          </p>
        </div>
      </div>
    </Link>
  );
}

function Sponsors() {
  const { sponsors } = useLoaderData<typeof loader>();
  return (
    <section id="sponsors" className="py-20 container">
      <div className="md:container max-w-full overflow-hidden md:max-w-5xl">
        <h2 className="sr-only">Sponsors</h2>
        <div className="flex flex-col gap-20 lg:gap-36 text-center">
          {sponsors.premier ? (
            <div className="pb-8 lg:pb-20">
              <h3 className="mb-6 md:mb-8 uppercase font-semibold font-mono">
                Premier Sponsor
              </h3>
              <div className="max-w-[400px] w-full m-auto">
                <div className="border-2 border-200 bg-white inline-block">
                  <a href={sponsors.premier.link}>
                    <img
                      src={sponsors.premier.imgSrc}
                      alt={sponsors.premier.name}
                      className="max-w-full max-h-full p-12"
                    />
                  </a>
                </div>
              </div>
            </div>
          ) : null}
          <div>
            <h3 className="mb-6 md:mb-8 uppercase font-semibold font-mono">
              Gold Sponsors
            </h3>
            <SponsorsList sponsors={sponsors.gold} level="gold" />
          </div>
          <div>
            <h3 className="mb-6 md:mb-8 uppercase font-semibold">
              Silver Sponsors
            </h3>
            <SponsorsList sponsors={sponsors.silver} level="silver" />
          </div>
          <div>
            <h3 className="mb-6 md:mb-8 uppercase font-semibold font-mono">
              Community Partners
            </h3>
            <SponsorsList sponsors={sponsors.community} level="community" />
          </div>
        </div>
        <div className="flex justify-center mt-20">
          <OutlineButtonLink
            prefetch="intent"
            to="sponsor"
            className="w-full md:w-auto font-mono uppercase"
            children="Join the Sponsors"
          />
        </div>
      </div>
    </section>
  );
}

function SponsorsList({
  sponsors,
  level,
}: {
  sponsors: Array<Sponsor>;
  level: Sponsor["level"];
}) {
  const size = {
    premier: "",
    gold: "w-[250px] h-[250px]",
    silver: "w-[200px] h-[200px]",
    community: "w-[150px] h-[150px]",
  }[level];

  const ulClassName = {
    premier: "",
    gold: "max-w-[36rem] gap-8 md:gap-12 lg:gap-14",
    silver: "max-w-[46rem] gap-6 md:gap-10 lg:gap-12",
    community: "max-w-[46rem] gap-4 md:gap-8 lg:gap-10",
  }[level];

  return (
    <div>
      <ul
        className={`${ulClassName} m-auto flex flex-wrap list-none items-center justify-center`}
      >
        {sponsors.map((sponsor) => (
          <li key={sponsor.name} className={`${size}`}>
            <div className="border-2 border-200 w-full h-full bg-white">
              <a
                href={sponsor.link}
                className="h-full w-full flex items-center justify-center"
              >
                <img
                  src={sponsor.imgSrc}
                  alt={sponsor.name}
                  title={sponsor.name}
                  className="max-w-full max-h-full p-3"
                />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
