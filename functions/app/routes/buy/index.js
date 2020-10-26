import React from "react";
import { Link } from "react-router-dom";
import Logo, { useLogoAnimation } from "../../components/Logo";
import * as CacheControl from "../../utils/CacheControl";

export function meta() {
  return {
    title: "Buy Your Remix Supporter Preview License",
    description: "We need your support to Remix over the finish line.",
  };
}

export function headers() {
  return CacheControl.pub;
}

export default function BuyIndex() {
  return (
    <div className="bg-gray-200">
      <div className="bg-gray-900">
        <Hero />
        <div className="mt-8 pb-12 bg-gray-200 sm:mt-12 sm:pb-16 lg:mt-16 lg:pb-24">
          <PricingCards />
          <FAQSection />
        </div>
      </div>
    </div>
  );
}

function Hero() {
  let [colors, changeColors] = useLogoAnimation();
  return (
    <div className="pt-12 sm:pt-16">
      <div className="max-w-screen-xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-2 lg:max-w-none">
          <div className="max-w-md mx-auto" onMouseMove={changeColors}>
            <Logo colors={colors} className="w-full" />
          </div>
          <p className="text-3xl leading-9 font-extrabold text-white sm:text-4xl sm:leading-10 lg:text-5xl lg:leading-none">
            Supporter Preview Now Available
          </p>
          <p className="text-xl max-w-4xl m-auto leading-7 text-gray-300">
            Remix is not production ready but it's close! We need your support
            to get it over the finish line. You are buying a Supporter Preview
            license, think of it like a kickstarter but you get to use the
            product right away. Supporter Licenses are non-refundable and
            limited.
          </p>
        </div>
      </div>
    </div>
  );
}

function FAQSection() {
  return (
    <div className="max-w-screen-xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <h2 className="text-3xl leading-9 font-extrabold text-gray-900 text-center">
        Frequently asked questions
      </h2>
      <div className="mt-12">
        <FAQ>
          <Question title="Is this production ready?">
            Nope. We've been focusing on APIs and production results, but there
            are rough edges on the dev UX and likely some bugs. We need your
            help to get it production ready.{" "}
            <span className="text-red-500">
              Please do not purchase a license if you are not comfortable with
              bugs and missing features
            </span>
            .
          </Question>
          <Question title="Is there a refundable trial period?">
            Not yet. During the support preivew all sales are final. We need
            your support right now to get it over the finish line! Wait for the
            1.0 release if you'd like a refundable trial period.
          </Question>
          <Question title="When is the 1.0 release?">
            We're hoping to have a production ready release first quarter of
            2021. Buying a support license helps us get there.
          </Question>
          <Question title="What kind of support do I get?">
            You'll get access to our issue tracker where you can report issues
            and get help with usage questions. You'll also get access to a
            private discord with other Remix users and the Remix developers.
            After the 1.0 release we will have more defined and expansive
            support packages.
          </Question>
          <Question title="What can I do with an indie License?">
            An indie license is just for you and your own solo projects at the
            time of purchase. You can use it on as as many projects as you like.
            You'll get access to support and all updates to Remix.
          </Question>
          <Question title="What can I do with a team License?">
            A team license is good for as many projects as you like. Each
            license has a set number of seats developers on your team occupy.
            You can assign members of your team to a license, and buy more seats
            on your license, on the dashboard after you purchase.
          </Question>
          <Question title="Why is the team license more expensive?">
            We know that Remix is incredibly valuable for commercial
            applications, so we've priced it to reflect that. But we also
            recognize the commercial price is prohibitive for a solo developer
            working on a side-project. So, we've drawn the line at one license
            to make Remix accessible to individuals while still reflecting the
            value it brings to a business.
          </Question>
          <Question title="What happens if I cancel my subscription?">
            You will be able to continue using the latest version of Remix at
            the time your subscription expires for as long as you like, but you
            won't receive any updates (besides security patches). You will also
            lose access to support.
          </Question>
          <Question title="Can I just buy a few indie licenses for my team?">
            No, that's against the software license. We're a bootstrapped
            company, why you gotta do us like that?
          </Question>
          <Question title="Is Remix Open Source?">
            No. It is commercially licensed only for the use of your projects.
            However, React Router, the primary dependency of Remix, is OSS and
            used by millions of developers across the world.
          </Question>
          <Question title="Can I use Remix for client projects?">
            Yes of course! You just can't use it to create derivative competing
            products.
          </Question>
          <Question title="Do you have geographical discounts?">
            Not at this time, but we are aware of purchasing power parity and
            hope to make Remix accessible to everybody in the future.
          </Question>
        </FAQ>
      </div>
      <div className="mt-12 lg:mt-24" />
      <NotReady />
    </div>
  );
}

function PricingCards() {
  return (
    <div className="relative">
      {" "}
      <div className="absolute inset-0 h-3/4 bg-gray-900" />
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto space-y-4 lg:max-w-5xl lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6">
              <div>
                <h3
                  className="inline-flex px-4 py-1 rounded-full text-sm leading-5 font-semibold tracking-wide uppercase bg-blue-100 text-blue-600"
                  id="tier-standard"
                >
                  Indie License (Beta)
                </h3>
              </div>
              <div className="mt-4 flex items-baseline text-6xl leading-none font-extrabold">
                $250
                <span className="ml-1 text-2xl leading-8 font-medium text-gray-500">
                  /yr
                </span>
              </div>
              <p className="mt-5 text-lg leading-7 text-gray-700">
                Got a side project but you've spent the last few weekends just
                screwing around with webpack? Knock it off! For a couple
                hundered bucks you've got us behind you.
              </p>
            </div>
            <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-gray-100 space-y-6 sm:p-10 sm:pt-6">
              <Checklist />
              <BuyLink to="checkout?type=indie">Buy My Indie License</BuyLink>
            </div>
          </div>
          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6">
              <div>
                <h3
                  className="inline-flex px-4 py-1 rounded-full text-sm leading-5 font-semibold tracking-wide uppercase bg-blue-100 text-blue-600"
                  id="tier-standard"
                >
                  Team License (Beta)
                </h3>
              </div>
              <div className="mt-4 flex items-baseline text-6xl leading-none font-extrabold">
                $1000
                <span className="ml-1 text-2xl leading-8 font-medium text-gray-500">
                  /dev /yr
                </span>
              </div>
              <p className="mt-5 text-lg leading-7 text-gray-700">
                Your projects need a solid foundation. You could hire a team for
                about $1M/yr to build it, or pay a fraction of that for Remix.
                Great tools increase the productivity of everybody—this is a
                steal.
              </p>
            </div>
            <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-gray-100 space-y-6 sm:p-10 sm:pt-6">
              <Checklist />
              <form action="/buy/checkout">
                <div>
                  <select
                    className="mt-1 mb-2 form-select block w-full pl-3 pr-10 py-2 text-base leading-6 border-gray-300 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5"
                    id="qty"
                    name="qty"
                    aria-label="Number of Licenses"
                  >
                    {Array.from({ length: 10 }).map((_, index, arr) =>
                      index === arr.length - 1 ? (
                        <option key={index} value="contact">
                          Contact us for 11+
                        </option>
                      ) : (
                        <option
                          key={index}
                          selected={index === 0}
                          value={index + 2}
                        >
                          {index + 2} Seat License
                        </option>
                      )
                    )}
                  </select>
                  <script
                    dangerouslySetInnerHTML={{
                      __html: `
                      document.addEventListener('DOMContentLoaded', () => {
                        document.getElementById('qty').onchange = (event) => {
                          if (event.target.value === "contact") {
                            window.location.assign("/contact")
                          }
                        }
                      });
                    `,
                    }}
                  />
                </div>
                <input type="hidden" name="type" value="team" />
                <BuyButton to="team">Buy a Team License</BuyButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Checklist({ children }) {
  return (
    <ul className="space-y-4">
      <Check>Unlimited projects</Check>
      <Check>Access to Support</Check>
      <Check>Free upgrades</Check>
      <Check>Cancel any time, use the last version forever</Check>
    </ul>
  );
}

function Check({ children }) {
  return (
    <li className="flex items-start">
      <div className="flex-shrink-0">
        {/* Heroicon name: check */}
        <svg
          className="h-6 w-6 text-green-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <p className="ml-3 text-base leading-6 text-gray-700">{children}</p>
    </li>
  );
}

function FAQ({ children }) {
  return (
    <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:grid-rows-2 md:col-gap-8 md:row-gap-12 lg:grid-cols-3">
      {children}
    </dl>
  );
}

function Question({ title, children }) {
  return (
    <div className="space-y-2">
      <dt className="text-lg leading-6 font-medium text-black">{title}</dt>
      <dd className="text-base leading-6 text-gray-700">{children}</dd>
    </div>
  );
}

function BuyButton({ children }) {
  return (
    <button
      type="submit"
      className="flex w-full items-center justify-center px-5 py-3 border border-transparent text-base leading-6 font-medium rounded-md shadow text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
    >
      {children}
    </button>
  );
}

function BuyLink({ children, to }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-center px-5 py-3 border border-transparent text-base leading-6 font-medium rounded-md shadow text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
    >
      {children}
    </Link>
  );
}

function NotReady() {
  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="px-6 py-6 bg-gray-100 rounded-lg md:py-12 md:px-12 lg:py-16 lg:px-16">
        <h2 className="text-center text-2xl leading-8 font-extrabold tracking-tight text-black sm:text-3xl sm:leading-9">
          Not ready to buy?
        </h2>
        <p className="text-center mt-3 text-lg leading-6 text-gray-800">
          <Link to="/newsletter" className="text-black underline">
            Sign up for our newsletter
          </Link>{" "}
          to stay up to date with our latest features, tutorials, and the 1.0
          release.
        </p>
      </div>
    </div>
  );
}
