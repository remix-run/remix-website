import React from "react";
import Logo, { useLogoAnimation } from "../components/Logo";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "@remix-run/react";

export function headers() {
  return {
    "Cache-Control": "public, max-age=0, must-revalidate",
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
      className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base leading-6 font-semibold rounded-md shadow-sm focus:outline-none xl:text-lg xl:py-4 text-white transition ease-in-out duration-150 ${
        primary
          ? "bg-blue-500 hover:bg-blue-400 active:bg-blue-600"
          : "bg-gray-700 hover:bg-gray-600 active:bg-gray-700"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Index() {
  let [colors, changeColors] = useLogoAnimation();

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="text-gray-100 mx-auto max-w-7xl w-full pt-16 pb-20 lg:py-32">
        <div className="px-4 sm:px-8 xl:pr-16 lg:max-w-3xl lg:m-auto">
          <div className="max-w-md" onMouseMove={changeColors}>
            <Logo colors={colors} className="w-full" />
          </div>
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
              Built for the serverless era, and on top of our open source that
              runs in millions of projects already, Remix gives you a sturdy
              foundation to build better websites. You'll love the performance
              and productivity our novel (and traditional) approach gives you.
            </p>
          </div>
          <div className="my-8" />
          <div className="sm:flex sm:mt-8 xl:mt-12">
            <ButtonLink to="/features">Explore Features</ButtonLink>
            <div className="my-2 sm:mx-1 sm:my-0" />
            <ButtonLink to="/buy" primary>
              Buy a License &nbsp;
              <FaArrowRight />
            </ButtonLink>
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
                    src="/img/ryan.jpg"
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
                    src="/img/michael.jpg"
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
