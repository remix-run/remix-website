import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ActionFunction, LoaderFunction } from "remix";
import { redirect, json } from "remix";
import { Form, usePendingFormSubmit, useRouteData } from "remix";

import BeatSpinner from "../../components/BeatSpinner";
import Hero from "../../components/Hero";
import LoadingButton, {
  LoadingButtonProps,
  styles as lbStyles,
} from "../../components/LoadingButton";
import * as CacheControl from "../../utils/CacheControl";
import { buyStorage } from "../../utils/sessions";
import { redirectToStripeCheckout } from "../../utils/stripe.client";
import { createCheckout } from "../../utils/checkout.server";
import { IconCheck, IconError, IconCard } from "../../components/icons";

type RouteData = null | { stripeSessionId: string };

export let loader: LoaderFunction = async ({ request }) => {
  let session = await buyStorage.getSession(request.headers.get("Cookie"));
  if (session.has("stripeSessionId")) {
    let stripeSessionId = session.get("stripeSessionId");
    let cookie = await buyStorage.destroySession(session);
    return json({ stripeSessionId }, { headers: { "Set-Cookie": cookie } });
  }
  return json(null, { headers: CacheControl.pub });
};

export let action: ActionFunction = async ({ request }) => {
  // firebase in dev redirects to 5001 😩
  let url = new URL(request.url);
  let origin = url.protocol + "//" + url.host;

  let text = await request.text();
  let params = new URLSearchParams(text);

  let types = new Set(["indie", "team"]);
  let type = params.get("type");
  let qty = params.has("qty") ? parseInt(params.get("qty")) : 1;

  if (!types.has(type)) {
    return redirect(origin + "/buy");
  } else {
    let session = await buyStorage.getSession(request.headers.get("Cookie"));
    let stripeSessionId = await createCheckout(type, qty);
    session.flash("stripeSessionId", stripeSessionId);
    return redirect(origin + "/buy", {
      headers: {
        "Set-Cookie": await buyStorage.commitSession(session),
      },
    });
  }
};

export function meta() {
  return {
    title: "Buy Your Remix Beta License",
    description:
      "Build better websites. Remix is almost over the finish line, you can start building with it today.",
  };
}

export function headers({ loaderHeaders }) {
  let cacheControl = loaderHeaders.get("Cache-Control") || "none";
  return { "Cache-Control": cacheControl };
}

export function links() {
  return [{ rel: "stylesheet", href: lbStyles }];
}

enum CheckoutState {
  Idle,
  CreatingSession,
  AttemptingStripeRedirect,
  Error,
}

export default function BuyIndex() {
  let data = useRouteData<RouteData>();
  let pendingSubmit = usePendingFormSubmit();
  let [state, setState] = useState<CheckoutState>(CheckoutState.Idle);
  let [pendingType, setPendingType] = useState<null | "indie" | "team">(null);

  // important not to add "state" to these effects, their only purpose is to
  // change state when remix's hooks change the data or pendingSubmit, since
  // apps don't have access into those as "events". Have to derive the state a
  // bit. Gotta think of a better answer than a bunch of wild effects firing off
  // who-knows-when.

  // when a pending submit comes in, move to the create session state
  useEffect(() => {
    if (!!pendingSubmit && state === CheckoutState.Idle) {
      setState(CheckoutState.CreatingSession);
      setPendingType(pendingSubmit.data.get("type") as "indie" | "team");
    }
  }, [pendingSubmit]);

  // when remix calls the loader after a submit, move to redirecting
  useEffect(() => {
    if (!!data && state === CheckoutState.CreatingSession) {
      setState(CheckoutState.AttemptingStripeRedirect);
    }
  }, [data]);

  // actually try to redirect with stripe when
  useEffect(() => {
    if (state !== CheckoutState.AttemptingStripeRedirect) return;
    (async () => {
      // do some fun fade-out because stripe fades in, it'll be sweet!
      setTimeout(() => {
        document.body.classList.add("fade-out");
        // Safari seems to keep the website in memory, so if the user clicks
        // "back" from stripe, the page is still faded out to white, this fades
        // it back in.
        window.onpageshow = (event) => {
          if (event.persisted) {
            document.body.classList.remove("fade-out");
          }
        };
        setTimeout(async () => {
          try {
            // await redirectToStripeCheckout(data.stripeSessionId);
            await redirectToStripeCheckout(data.stripeSessionId);
          } catch (error) {
            console.error(error);
            document.body.classList.remove("fade-out");
            setState(CheckoutState.Error);
          }
        }, 300);
      }, 500);
    })();
  }, [state]);

  // stripe redirect failed, tell the user
  useEffect(() => {
    if (state === CheckoutState.Error) {
      setTimeout(() => {
        alert("There was an error checking out, please try again.");
        setTimeout(() => {
          setState(CheckoutState.Idle);
          setPendingType(null);
        });
      }, 500);
    }
  }, [state]);

  return (
    <div className="bg-gray-200">
      <div className="bg-gray-900">
        <Hero title="1.0 Beta is Here!">
          Thanks to over 400+ preview customers, the Remix API is stable. Now
          we're just tightening the screws and fixing bugs for a final 1.0
          release soon. Please note beta licenses are non-refundable.
        </Hero>
        <div className="mt-8 pb-12 bg-gray-200 sm:mt-12 sm:pb-16 lg:mt-16 lg:pb-24">
          <PricingCards state={state} pendingType={pendingType} />
          <FAQSection />
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
            Mostly. Since Remix hasn't had widespread use yet there are bound to
            be bugs. Fixing them is a primary focus during beta. You can start
            building with Remix now, knowing we'll have a solid 1.0 final
            release in the coming weeks.
          </Question>
          <Question title="What does Beta mean?">
            We consider the API stable and don't anticipate any breaking API
            changes before the final release. Documentation and bug fixing are
            what we're now focused on.
          </Question>
          <Question title="Is there a refundable trial period?">
            Not yet. There will be a 2-month refundable trial period after the
            1.0 final release.
          </Question>
          <Question title="Is my beta license still valid after the 1.0 release?">
            Yes. You're buying a full license.
          </Question>
          <Question title="What kind of support do I get?">
            You'll get access to our issue tracker where you can report issues
            and get help with usage questions. You'll also get access to a
            private discord with other Remix users and the Remix developers.
            After the 1.0 release we will have more defined and expansive
            support packages.
          </Question>
          <Question title="What can I do with an Indie License?">
            An indie license is just for you and your own solo projects. You can
            use it on as as many projects as you like. You'll get access to
            support and all updates to Remix.
          </Question>
          <Question title="What can I do with a Team License?">
            Team licensing is per developer, not per project. So if you have 8
            people working on Remix projects you will need 8 seats on your
            license but you can use it on as many projects as you want. After
            purchasing, you assign members of your team to a license and can add
            or remove them as your team changes.
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
            No, that's against the software license. We're a self-funded
            company, why you gotta do us like that?
          </Question>
          <Question title="Is Remix Open Source?">
            No. It is commercially licensed only for the use of your projects.
            However, React Router, the primary dependency of Remix, is OSS and
            used by millions of developers across the world.
          </Question>
          <Question title="Can I use Remix for client projects?">
            Yes of course! You just can't use it to create derivative competing
            products. When you hand off the project to the client they will need
            a license to continue developing with Remix.
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
function PricingCards({
  state,
  pendingType,
}: {
  state: CheckoutState;
  pendingType: "indie" | "team";
}) {
  let buttonState = {
    [CheckoutState.Idle]: "idle",
    [CheckoutState.CreatingSession]: "loading",
    [CheckoutState.AttemptingStripeRedirect]: "success",
    [CheckoutState.Error]: "error",
  }[state] as LoadingButtonProps["state"]; // TODO: why do I need this as?

  return (
    <div className="relative">
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
              <div className="my-2">&nbsp;</div>
              <p className="mt-5 text-lg leading-7 text-gray-700">
                Got a side project but you've spent the last few weekends just
                screwing around with bundlers and data loading? Knock it off!
                You've got us behind you and can focus immediately on your idea.
              </p>
            </div>
            <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-gray-100 space-y-6 sm:p-10 sm:pt-6">
              <Checklist />
              <Form action="/buy" method="post">
                <input type="hidden" name="type" value="indie" />
                <input type="hidden" name="qty" value="1" />
                <LoadingButton
                  disabled={pendingType === "team"}
                  state={pendingType === "indie" ? buttonState : "idle"}
                  text="Buy my indie license"
                  textLoading="Loading..."
                  ariaText="Buy my indie license"
                  ariaLoadingAlert="Creating checkout session, please wait."
                  ariaSuccessAlert="Redirecting to checkout, please wait."
                  ariaErrorAlert="There was an error creating your checkout session, please try again."
                  icon={<IconCard className="h-5" />}
                  iconError={<IconError className="h-5" />}
                  iconLoading={<BeatSpinner />}
                  iconSuccess={<IconCheck className="h-5" />}
                  className="w-full px-5 py-2 border border-transparent text-base leading-6 font-medium rounded-md shadow text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                />
              </Form>
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
              <div className="my-2 text-gray-500">
                <span className="text-red-600 line-through">$1200</span> /dev
                /yr after 1.0 final
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
              <Form action="/buy" method="post">
                <div>
                  <select
                    className="mt-1 mb-2 form-select block w-full pl-3 pr-10 py-2 text-base leading-6 border-gray-300 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5"
                    id="qty"
                    name="qty"
                    aria-label="Number of Licenses"
                    defaultValue="2"
                  >
                    {Array.from({ length: 10 }).map((_, index, arr) =>
                      index === arr.length - 1 ? (
                        <option disabled key={index} value="contact">
                          Email hello@remix.run for 11+
                        </option>
                      ) : (
                        <option key={index} value={index + 2}>
                          {index + 2} Seat License
                        </option>
                      )
                    )}
                  </select>
                </div>
                <input type="hidden" name="type" value="team" />
                <LoadingButton
                  disabled={pendingType === "indie"}
                  state={pendingType === "team" ? buttonState : "idle"}
                  text="Buy team licenses"
                  textLoading="Loading..."
                  ariaText="Buy team licenses"
                  ariaLoadingAlert="Creating checkout session, please wait."
                  ariaSuccessAlert="Redirecting to checkout, please wait."
                  ariaErrorAlert="There was an error creating your checkout session, please try again."
                  icon={<IconCard className="h-5" />}
                  iconError={<IconError className="h-5" />}
                  iconLoading={<BeatSpinner />}
                  iconSuccess={<IconCheck className="h-5" />}
                  className="w-full px-5 py-2 border border-transparent text-base leading-6 font-medium rounded-md shadow text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                />
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Checklist() {
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

function BuyButton({ children, ...props }) {
  return (
    <button
      {...props}
      type="submit"
      className="flex w-full items-center justify-center px-5 py-3 border border-transparent text-base leading-6 font-medium rounded-md shadow text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
    >
      {children}
    </button>
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
          release. You can also{" "}
          <a className="text-black underline" href="https://docs.remix.run">
            browse our documentation
          </a>{" "}
          to get an idea about what developing with Remix is like.
        </p>
      </div>
    </div>
  );
}
