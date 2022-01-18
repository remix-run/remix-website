import { json, useLoaderData, Form, useActionData, useTransition } from "remix";
import type { ActionFunction, LinksFunction, LoaderFunction } from "remix";
import cx from "clsx";
import {
  Button,
  OutlineButtonLink,
  PrimaryButtonLink,
} from "~/components/buttons";
import indexStyles from "../../styles/index.css";
import { Fragment } from "react";
import type { Sponsor, Speaker } from "~/utils/conf.server";
import { getSpeakers, getSponsors } from "~/utils/conf.server";
import { Subscribe } from "~/components/subscribe";
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
  const speakersShuffled = [...speakersOrdered].sort((a, b) =>
    a.nameLast < b.nameLast ? -1 : a.nameLast > b.nameLast ? 1 : 0
  );
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
      <Sponsors />
      <Speakers />
      <SignUp />
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
                className="w-full md:w-auto"
                children="Call for Speakers"
              />
              <OutlineButtonLink
                prefetch="intent"
                to="sponsor"
                className="w-full md:w-auto"
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
    <div className="my-20">
      <h2 className="mb-6 md:mb-8 uppercase font-semibold text-center ">
        Featured Speakers
      </h2>
      <div className="px-6 lg:px-10 max-w-5xl mx-auto">
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 2xl:gap-10 sm:justify-center items-center">
          {speakers.map((speaker, i) => (
            <Link
              key={i}
              to={`speakers/${speaker.link}`}
              className="h-full w-full flex items-center justify-center"
              aria-label={`${speaker.nameFirst} ${speaker.nameLast}, ${speaker.title}`}
            >
              <div
                className={cx(
                  "w-full max-w-xs sm:max-w-none bg-gray-700 p-4 mt-10 rounded-tl-2xl rounded-br-2xl hover:shadow-speaker",
                  // annoying hack that ensures speaker blocks are equal height since they
                  // aren't direct children of the grid
                  "sm:h-[calc(100%-2.5rem)] "
                )}
              >
                <div className="aspect-w-1 aspect-h-1 border-2 border-gray-200 bg-black -mt-10 rounded-tl-2xl rounded-br-2xl"></div>
                <div className="mt-4">
                  <h3>
                    {speaker.nameFirst} {speaker.nameLast}
                  </h3>
                  <p>{speaker.linkText}</p>
                  <p>{speaker.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sponsors() {
  const { sponsors } = useLoaderData<LoaderData>();
  return (
    <div>
      <div className="md:container max-w-full overflow-hidden md:max-w-5xl">
        <div className="text-center my-20 md:mb-32">
          {sponsors.premier ? (
            <>
              <h2 className="mb-6 md:mb-8 uppercase font-semibold">
                Premium Sponsor
              </h2>
              <a href={sponsors.premier.link}>
                <img
                  src={sponsors.premier.imgSrc}
                  alt={sponsors.premier.name}
                  className="h-full w-full"
                />
              </a>
            </>
          ) : null}
          <h2 className="mb-6 md:mb-8 uppercase font-semibold">
            Gold Sponsors
          </h2>
          <SponsorsList sponsors={sponsors.gold} />
        </div>
        <div className="text-center my-20 md:mb-32">
          <h2 className="mb-6 md:mb-8 uppercase font-semibold">
            Silver Sponsors
          </h2>
          <SponsorsList sponsors={sponsors.silver} />
        </div>
        <div className="text-center my-20 md:mb-32">
          <h2 className="mb-6 md:mb-8 uppercase font-semibold">
            Community Partners
          </h2>
          <SponsorsList sponsors={sponsors.community} />
        </div>
      </div>
    </div>
  );
}

function SponsorsList({ sponsors }: { sponsors: Array<Sponsor> }) {
  return (
    <div className="flex-gap-wrapper">
      <div>
        <ul className="list-none flex flex-shrink-0 flex-grow-0 flex-wrap gap-8 md:gap-12 lg:gap-14 items-center justify-center">
          {sponsors.map((sponsor) => (
            <li
              key={sponsor.name}
              className="flex flex-shrink-0 flex-grow-0 items-center justify-center max-w-xs max-h-[80px]"
            >
              <div className="border-2 border-200 h-11 w-24">
                <a href={sponsor.link}>
                  <img
                    src={sponsor.imgSrc}
                    alt={sponsor.name}
                    className="h-full w-full"
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

function SignUp() {
  return (
    <div className="my-6">
      <div className="container">
        <section className="section-signup relative">
          <div className="md:max-w-xl mx-auto md:py-40 relative">
            <h2 className="h2 mb-3 text-d-p-lg lg:text-d-h3 font-bold">
              Stay Updated
            </h2>
            <p
              className="text-lg md:text-xl mb-6 opacity-80"
              id="newsletter-text"
            >
              To get exclusive updates announcements about Remix Conf, subscribe
              to our newsletter and{" "}
              <a href="https://discord.gg/VBePs6d">
                join the conversation on Discord
              </a>
              !
            </p>
            <Subscribe descriptionId="newsletter-text" />
            <p className="text-gray-400 text-sm mt-1">
              We respect your privacy; unsubscribe at any time.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
