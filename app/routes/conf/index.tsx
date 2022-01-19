import { json, useLoaderData } from "remix";
import type { LinksFunction, LoaderFunction } from "remix";
import { OutlineButtonLink, PrimaryButtonLink } from "~/components/buttons";
import indexStyles from "../../styles/index.css";
import { Fragment } from "react";
import type { Sponsor, Speaker } from "~/utils/conf.server";
import { getSpeakers, getSponsors } from "~/utils/conf.server";
import { Link } from "~/components/link";

export function meta() {
  let url = "https://remix.run/conf";
  let title = "Remix Conf - May 24-26";
  let image = "https://remix.run/img/og.1.jpg"; // TODO:
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
}

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: indexStyles }];
};

type LoaderData = {
  speakers: Array<Speaker>;
  sponsors: {
    premier: Sponsor | undefined;
    gold: Array<Sponsor>;
    silver: Array<Sponsor>;
    community: Array<Sponsor>;
  };
};

export const loader: LoaderFunction = async () => {
  const speakersOrdered = await getSpeakers();
  const speakersShuffled = [...speakersOrdered].sort(() => Math.random() - 0.5);

  const allSponsors = await getSponsors();
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
  return json<LoaderData>({ speakers: speakersShuffled, sponsors });
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
            <h1 className="font-jet-mono text-[length:32px] sm:text-[length:45px] lg:text-[length:64px] leading-tight __hero-text-shadow">
              <div className="text-white">May 24-26, 2022 </div>
              <div className="text-yellow-brand">Salt Lake City</div>
            </h1>
            <div className="h-6" />
            <div className="space-y-4 text-m-p-lg lg:text-d-p-lg text-white __hero-text-shadow">
              <p>
                Remix is a full stack web framework that lets you focus on the
                user interface and work back through web fundamentals to deliver
                a fast, slick, and resilient user experience.
              </p>
              <p className="font-bold">
                We can't wait to tell you all about it.
              </p>
            </div>
            <div className="h-9" />
            <div className="flex flex-col gap-4 md:flex-row">
              <PrimaryButtonLink
                prefetch="intent"
                to="speak"
                className="w-full md:w-auto font-jet-mono uppercase"
                children="Call for Speakers"
              />
              <OutlineButtonLink
                prefetch="intent"
                to="sponsor"
                className="w-full md:w-auto font-jet-mono uppercase"
                children="Become a Sponsor"
              />
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

function Speakers() {
  const { speakers } = useLoaderData<LoaderData>();
  return (
    <section className="py-20 __section-speakers">
      <div className="relative">
        <h2 className="mb-6 md:mb-8 uppercase font-semibold text-center font-jet-mono">
          Featured Speakers
        </h2>
        <div className="px-6 lg:px-10 max-w-xs sm:max-w-2xl lg:max-w-5xl mx-auto">
          <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-y-12 sm:gap-x-8 sm:gap-y-14 md:gap-x-8 2xl:gap-x-10 sm:justify-center items-center">
            {speakers.map((speaker) => (
              <SpeakerDisplay speaker={speaker} key={speaker.name} />
            ))}
          </div>
        </div>
        <h2 className="mt-24 mb-6 md:mb-8 uppercase font-semibold text-center font-jet-mono">
          Master of Ceremonies
        </h2>
        <div className="w-[300px] flex items-center m-auto">
          <SpeakerDisplay
            speaker={{
              name: "Ceora Ford",
              linkText: "@ceeoreo_",
              link: "https://twitter.com/ceeoreo_",
              title: "Developer Advocate, Apollo",
              imgSrc: "/conf-images/speakers/ceora.jpg",
            }}
          />
        </div>
        <div className="flex justify-center mt-20">
          <OutlineButtonLink
            prefetch="intent"
            to="speak"
            className="w-full md:w-auto font-jet-mono uppercase"
            children="Become a Speaker"
          />
        </div>
      </div>
    </section>
  );
}

function SpeakerDisplay({ speaker }: { speaker: Speaker }) {
  return (
    <Link
      to={`speakers/${speaker.link}`}
      className="__speaker-link h-full w-full flex items-center justify-center"
      aria-label={`${speaker.name}, ${speaker.title}`}
    >
      <div className="w-full max-w-xs sm:max-w-none">
        <div className="__speaker-img rounded-md overflow-hidden aspect-w-1 aspect-h-1 bg-black">
          <img src={speaker.imgSrc} alt={`${speaker.name}`} />
        </div>
        <div className="mt-4">
          <h3>{speaker.name}</h3>
          <p>{speaker.title}</p>
          <p className="text-m-p-sm font-semibold uppercase mt-2">
            {speaker.linkText}
          </p>
        </div>
      </div>
    </Link>
  );
}

function Sponsors() {
  const { sponsors } = useLoaderData<LoaderData>();
  return (
    <section>
      <div className="md:container max-w-full overflow-hidden md:max-w-5xl">
        <h2 className="sr-only">Sponsors</h2>
        <div className="text-center py-20 md:mb-32">
          {sponsors.premier ? (
            <>
              <h3 className="mb-6 md:mb-8 uppercase font-semibold font-jet-mono">
                Premium Sponsor
              </h3>
              <a href={sponsors.premier.link}>
                <img
                  src={sponsors.premier.imgSrc}
                  alt={sponsors.premier.name}
                  className="h-full w-full"
                />
              </a>
            </>
          ) : null}
          <h3 className="mb-6 md:mb-8 uppercase font-semibold font-jet-mono">
            Gold Sponsors
          </h3>
          <SponsorsList sponsors={sponsors.gold} level="gold" />
        </div>
        <div className="text-center my-20 md:mb-32">
          <h3 className="mb-6 md:mb-8 uppercase font-semibold">
            Silver Sponsors
          </h3>
          <SponsorsList sponsors={sponsors.silver} level="silver" />
        </div>
        <div className="text-center my-20 md:mb-32">
          <h3 className="mb-6 md:mb-8 uppercase font-semibold font-jet-mono">
            Community Partners
          </h3>
          <SponsorsList sponsors={sponsors.community} level="community" />
        </div>
        <div className="flex justify-center mt-20">
          <OutlineButtonLink
            prefetch="intent"
            to="sponsor"
            className="w-full md:w-auto font-jet-mono uppercase"
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

  return (
    <div className="flex-gap-wrapper">
      <div>
        <ul className="list-none flex flex-shrink-0 flex-grow-0 flex-wrap gap-8 md:gap-12 lg:gap-14 items-center justify-center">
          {sponsors.map((sponsor) => (
            <li
              key={sponsor.name}
              className={`flex flex-shrink-0 flex-grow-0 items-center justify-center ${size}`}
            >
              <div className="border-2 border-200 w-full h-full bg-white">
                <a
                  href={sponsor.link}
                  className="h-full w-full flex items-center"
                >
                  <img
                    src={sponsor.imgSrc}
                    alt={sponsor.name}
                    className="max-w-full max-h-full p-3"
                  />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
