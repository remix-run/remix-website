import React from "react";
import { Link } from "react-router-dom";
import Logo, { useLogoAnimation } from "../../components/Logo";

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
            Beta Preview Now Available
          </p>
          <p className="text-xl leading-7 text-gray-300">
            Beta licenses are limited, so act quickly!
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
          <Question title="What kind of support do I get?">
            You'll get access to our issue tracker where you can report issues
            and get help with usage questions within 48 hours on business days.
            During the beta, you'll get access to weekly "office hours" with
            Ryan and Micheal for real time help. Finally, you'll get access to a
            private discord with other Remix users.
          </Question>
          <Question title="Is there a refundable trial period?">
            Not at this time. We are currently in beta and can make no
            guarantees to the production-readiness of Remix (it's pretty good
            already, but that's the point of the beta!). Wait for the 1.0
            release if you'd like a refundable trial period. All beta sales are
            final.
          </Question>
          <Question title="What can I do with an indie License?">
            An indie license is just for you and your own solo projects at the
            time of purchase. You can use it on as as many projects as you like.
            You'll get access to support and all updates to Remix.
          </Question>
          <Question title="What can I do with a team License?">
            A team license is good for your entire team, on as many projects as
            you like. It's priced by the number of developers expected to be
            working in the Remix projects at the time of purchase. If you hire
            more developers, you do not need to update the number of developers
            on your license until it's due for renewal.
          </Question>
          <Question title="Why is the team license more expensive?">
            We know that Remix is incredibly valuable for commercial
            applications, so we've priced it to reflect that. But we also
            recognize the commercial price is prohibitive for a solo developer
            working on a side-project. So, we've drawn the line at one license
            to make Remix accessible to individuals while still reflecting the
            value it brings to a business.
          </Question>
          <Question title="What do I get with the license subscription?">
            Subscribers can continue to use the latest version of Remix,
            including bug fixes, optimizations, and new features. You also get
            access to support (opening tickets, community chat, office hours
            etc).
          </Question>
          <Question title="What happens if I cancel my subscription?">
            You will be able to continue using the latest version of Remix at
            the time your subscription expires forever, but you won't receive
            any updates (besides security patches). You will also lose access to
            support.
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
              <BuyButton to="indie">Buy My Indie License</BuyButton>
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
              <BuyButton to="team">Buy a Team License</BuyButton>
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
      <Check>48 HR Support, office hours, private chat community</Check>
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
function BuyButton({ children, to }) {
  return (
    <div className="rounded-md shadow">
      <Link
        to={to}
        className="flex items-center justify-center px-5 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
      >
        {children}
      </Link>
    </div>
  );
}

function NotReady() {
  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="px-6 py-6 bg-gray-100 rounded-lg md:py-12 md:px-12 lg:py-16 lg:px-16">
        <div className="xl:w-0">
          <h2 className="text-center text-2xl leading-8 font-extrabold tracking-tight text-black sm:text-3xl sm:leading-9">
            Not ready to buy?
          </h2>
          <p className="text-center mt-3 text-lg leading-6 text-gray-800">
            <Link to="/newsletter" className="text-black underline">
              Sign up for our newsletter
            </Link>{" "}
            to stay up to date with our latest features, tutorials, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
