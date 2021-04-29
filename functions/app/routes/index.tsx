import React from "react";
import Logo, { useLogoAnimation } from "../components/Logo";
import { Link } from "react-router-dom";
import * as CacheControl from "../utils/CacheControl";
import redirect from "../utils/redirect";
import type { LoaderFunction } from "@remix-run/node";
import { getCustomer } from "../utils/session.server";

export let loader: LoaderFunction = async ({ request }) => {
  let customer = await getCustomer(request);
  if (customer) {
    return redirect(request, "/dashboard");
  }
  return null;
};

export function headers() {
  return {
    ...CacheControl.pub,
    Link:
      "</buy>;rel=prefetch;as=document, </features>;rel=prefetch;as=document",
  };
}

export function meta() {
  let title = "Remix Run - Build Better Websites";
  let description =
    "Remix brings you the state of the art in web development without leaving behind the fundamentals that make it great. Built for the serverless era, and on top of our open source that runs on millions of websites already, Remix gives you a sturdy foundation to build better websites.";
  return {
    title,
    description,
    "twitter:card": "summary_large_image",
    "twitter:site": "@remix-run",
    "twitter:creator": "@remix-run",
    "twitter:image": "https://remix.run/twitter-card.jpg",
    "og:url": "https://remix.run",
    "og:title": title,
    "og:description": description,
    "og:image": "https://remix.run/twitter-card.jpg",
  };
}

function ButtonLink({ to, children, primary = false }) {
  return (
    <Link
      to={to}
      className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base leading-6 font-semibold rounded-md shadow-sm xl:text-lg xl:py-4 text-white transition ease-in-out duration-150 ${
        primary
          ? "bg-blue-500 hover:bg-blue-400 active:bg-blue-600"
          : "bg-gray-700 hover:bg-gray-600 active:bg-gray-700"
      }`}
    >
      {children}
    </Link>
  );
}

function LoginLink() {
  return (
    <Link
      to="login"
      className={`
            mt-4 mr-4 inline-flex px-3 py-2 rounded-md text-m font-medium
            text-gray-300 hover:text-white hover:bg-gray-800
            focus:outline-none focus:text-white focus:bg-gray-800
          `}
    >
      <svg
        className="h-6 w-6 mr-1"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
        />
      </svg>{" "}
      Sign in
    </Link>
  );
}

export default function Index() {
  let [colors, changeColors] = useLogoAnimation();

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="text-right md:max-w-3xl md:m-auto">
        <LoginLink />
      </div>
      <div className="text-gray-100 mx-auto max-w-7xl w-full pt-4 pb-20">
        <div className="px-4 sm:px-8 xl:pr-16 md:max-w-3xl md:m-auto">
          <a id="logo" href="/logo" className="block max-w-md">
            <Logo colors={colors} className="w-full" />
          </a>
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
                document.getElementById("logo").addEventListener("contextmenu", (event) => {
                  event.preventDefault();
                  window.location.assign("/logo");
                });
              `,
            }}
          />
          <h2 className="text-4xl tracking-tight leading-10 font-extrabold text-white sm:text-5xl sm:leading-none md:text-6xl">
            Build Better Websites
          </h2>
          <div className="my-4" />
          <div className="font-light text-gray-400 sm:text-2xl sm:leading-7">
            <p>
              Building a product is fun, but screwing around with build tools
              and data loading is not. Remix brings you the state of the art in
              web development (and then some) without leaving behind the
              fundamentals that make it great.
            </p>
            <div className="my-4" />
            <p>
              Remix gives you a sturdy foundation to build better websites.
              You'll love the performance and productivity our novel (and
              traditional) approach gives you.
            </p>
          </div>
          <div className="my-8" />
          <div className="sm:flex sm:mt-8 xl:mt-12">
            <ButtonLink to="/features">Explore Features</ButtonLink>
            <div className="my-2 sm:mx-1 sm:my-0" />
            <ButtonLink to="/buy" primary>
              Buy a License &nbsp;
              <ArrowRightIcon />
            </ButtonLink>
          </div>
          <div className="mt-4 text-gray-400">
            Or follow our development regularly in our{" "}
            <Link className="text-aqua-500" to="/newsletter">
              newsletter
            </Link>
            .
          </div>
          <div className="my-20" />
          <div>
            <p className="text-gray-400 uppercase font-semibold">
              Developed by:
            </p>
            <div className="mt-4 sm:flex">
              <a
                href="https://twitter.com/ryanflorence"
                className="flex items-center no-underline"
              >
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full"
                    src="/img/ryan.webp"
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-white leading-tight">
                    Ryan Florence
                  </p>
                  <p className="text-sm text-gray-500 leading-tight">
                    React Router, Reach UI
                  </p>
                </div>
              </a>
              <div className="my-2 sm:mx-2 sm:my-0" />
              <a
                href="https://twitter.com/mjackson"
                className="flex items-center no-underline"
              >
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full"
                    src="/img/michael.webp"
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-white leading-tight">
                    Michael Jackson
                  </p>
                  <p className="text-sm text-gray-500 leading-tight">
                    React Router, UNPKG
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      className="h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}
