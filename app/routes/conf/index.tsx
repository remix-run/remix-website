import { Link, json, Form } from "remix";
import type { LoaderFunction, LinksFunction } from "remix";
import cx from "clsx";
import { OutlineButtonLink, PrimaryButtonLink } from "~/components/buttons";
import { getMarkdown } from "~/utils/md.server";
import indexStyles from "../../styles/index.css";
import { Prose, Sequence } from "@ryanflorence/mdtut";
import invariant from "ts-invariant";
import { Fragment } from "react";

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
  sample: Prose;
  sampleSm: Prose;
  mutations: Sequence;
  errors: Sequence;
};

export let loader: LoaderFunction = async () => {
  let [[sample], [sampleSm], [, mutations], [, errors]] = await Promise.all([
    getMarkdown("marketing/sample/sample.md"),
    getMarkdown("marketing/sample-sm/sample.md"),
    getMarkdown("marketing/mutations/mutations.md"),
    getMarkdown("marketing/mutations/errors.md"),
  ]);

  invariant(sample.type === "prose", "sample.md should be prose");
  invariant(sampleSm.type === "prose", "sample.md should be prose");
  invariant(mutations.type === "sequence", "mutations.md should be a sequence");
  invariant(errors.type === "sequence", "errors.md should be a sequence");

  let data: LoaderData = { sample, sampleSm, mutations, errors };
  return json(data, { headers: { "Cache-Control": "max-age=300" } });
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
        className="__hero py-10 sm:py-16 md:py-24 lg:py-32"
      >
        <div className="container">
          <div className="max-w-xl mx-auto md:mx-0">
            <h1 className="font-display text-m-h1 sm:text-d-h2 lg:text-[length:64px] lg:leading-[56px] xl:text-d-j">
              <div className="text-white">May 24-26, 2022 </div>
              <div className="text-yellow-brand">Salt Lake City</div>
            </h1>
            <div className="h-6" />
            <div className="space-y-4 text-m-p-lg lg:text-d-p-lg">
              <p>
                Remix is a full stack web framework that lets you focus on the
                user interface and work back through web fundamentals to deliver
                a fast, slick, and resilient user experience.
              </p>
              <p className="font-bold text-white">
                We can't wait to tell you all about it.
              </p>
            </div>
            <div className="h-9" />
            <div className="flex flex-col gap-4 md:flex-row">
              <PrimaryButtonLink
                prefetch="intent"
                to="/docs/en/v1/tutorials/blog"
                className="w-full md:w-auto"
                children="Call for Speakers"
              />
              <OutlineButtonLink
                prefetch="intent"
                to="/docs/en/v1"
                className="w-full md:w-auto"
                children="Call for Sponsors"
              />
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

function Speakers() {
  return (
    <div className="my-20">
      <h2 className="mb-6 md:mb-8 uppercase font-semibold text-center ">
        Featured Speakers
      </h2>
      <div className="px-6 lg:px-10 max-w-5xl mx-auto">
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 2xl:gap-10 sm:justify-center items-center">
          {Array<Speaker>(9)
            .fill({
              id: 0,
              name: "Joe Shmoe",
              twitterHandle: "@joetheguy123",
              title: "Developer Relations, FakeCo.",
              imgSrc: "/whatever.jpg",
            })
            .map((speaker, i) => (
              <Link
                key={i}
                to={`speakers/${speaker.id}`}
                className="h-full w-full flex items-center justify-center"
              >
                <FakeSpeaker {...speaker} />
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

function Sponsors() {
  return (
    <div>
      <div className="md:container max-w-full overflow-hidden md:max-w-5xl">
        <div className="text-center my-20 md:mb-32">
          <h2 className="mb-6 md:mb-8 uppercase font-semibold">
            Gold Sponsors
          </h2>
          <div className="flex-gap-wrapper">
            <div>
              <ul className="list-none flex flex-shrink-0 flex-grow-0 flex-wrap gap-8 md:gap-12 lg:gap-14 items-center justify-center">
                {Array(9)
                  .fill(null)
                  .map((_, i) => (
                    <li
                      key={i}
                      className="flex flex-shrink-0 flex-grow-0 items-center justify-center max-w-xs max-h-[80px]"
                    >
                      <FakeCoLogo />
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
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
            <p className="text-lg md:text-xl mb-6 opacity-80">
              To get exclusive updates announcements about Remix Conf, subscribe
              to our newsletter or{" "}
              <a href="https://discord.gg/VBePs6d">
                join the conversation on Discord
              </a>
              !
            </p>
            <Form
              method="post"
              action="/newsletter" // TODO:
              aria-label="Subscribe to the newsletter"
              className="flex flex-col xs:flex-row"
            >
              <label>
                <span className="sr-only">Email address</span>
                <input
                  type="email"
                  name="email"
                  placeholder="excited.attendee@remix.run"
                  className="mb-4 xs:mb-0 xs:mr-4 flex-1 appearance-none w-full rounded py-2 px-3 bg-gray-700 hover:bg-gray-600 border border-transparent focus:border-blue-500 placeholder-gray-300 hover:placeholder-gray-200 text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </label>
              <button className="inline-flex items-center justify-center font-bold no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent transition-colors duration-200 px-5 py-3 lg:px-6 bg-blue-500 hover:bg-blue-600 border-2 border-blue-500 hover:border-blue-700 focus:ring-blue-500 focus:ring-opacity-60 text-white hover:text-white text-base rounded">
                Subscribe
              </button>
            </Form>
            <p className="text-gray-400 text-sm mt-1">
              We respect your privacy; unsubscribe at any time.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function FakeSpeaker(props: Speaker) {
  return (
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
        <h3>{props.name}</h3>
        {props.twitterHandle ? <p>{props.twitterHandle}</p> : null}
        <p>{props.title}</p>
      </div>
    </div>
  );
}

function FakeCoLogo() {
  return <div className="border-2 border-200 h-11 w-24" />;
}

interface Speaker {
  id: number;
  name: string;
  twitterHandle?: string;
  title: string;
  imgSrc: string;
}
