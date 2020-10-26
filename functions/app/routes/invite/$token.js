import React from "react";
import { useRouteData } from "@remix-run/react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../components/Logo";

export default function Invite() {
  let data = useRouteData();

  return (
    <main className="bg-gray-900 min-h-screen">
      {data.code === "invalid_token" ? (
        <Invalid />
      ) : data.code === "token_full" ? (
        <Full />
      ) : (
        <Join />
      )}
    </main>
  );
}

function Join() {
  let location = useLocation();
  return (
    <div className="mx-auto max-w-4xl pt-16 pb-20 text-center py-24 lg:py-48">
      <div className="px-4 sm:px-8 xl:pr-16">
        <div className="px-8 m-auto max-w-lg md:max-w-xl">
          <Logo />
        </div>
        <h2 className="text-3xl tracking-tight leading-10 font-extrabold text-gray-100 sm:text-4xl sm:leading-none md:text-5xl">
          Join a Remix Team License
        </h2>
        <p className="mt-3 mx-auto max-w-md text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
          You've been invited to join a Remix Team license, giving you access to
          Remix code, documentation, and support.
        </p>
        <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center">
          <div className="flex-1 mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <Link
              to={`/login?from=${location.pathname}/accept`}
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 active:bg-green-400 transition duration-150 ease-in-out md:py-4 md:text-lg md:px-10"
            >
              Sign in to Accept
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Full() {
  return (
    <div className="mx-auto max-w-4xl pt-16 pb-20 text-center py-24 lg:py-48">
      <div className="px-4 sm:px-8 xl:pr-16">
        <div className="px-8 m-auto max-w-lg md:max-w-xl">
          <Logo />
        </div>
        <h2 className="text-3xl tracking-tight leading-10 font-extrabold text-gray-100 sm:text-4xl sm:leading-none md:text-5xl">
          Remix Team License is Full
        </h2>
        <p className="mt-3 mx-auto max-w-md text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
          You've been invited to join a Remix Team license. Unfortunately, all
          seats have been used on it. Please tell the person who gave you this
          link to purchase more seats at{" "}
          <a className="text-aqua-500" href="https://remix.run/dashboard">
            https://remix.run/dashboard
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function Invalid() {
  return (
    <div className="mx-auto max-w-4xl pt-16 pb-20 text-center py-24 lg:py-48">
      <div className="px-4 sm:px-8 xl:pr-16">
        <div className="px-8 m-auto max-w-lg md:max-w-xl">
          <Logo />
        </div>
        <h2 className="text-3xl tracking-tight leading-10 font-extrabold text-gray-100 sm:text-4xl sm:leading-none md:text-5xl">
          Invalid License
        </h2>
        <p className="mt-3 mx-auto max-w-md text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
          The link you were given doesn't point to a valid license. Please
          contact the person who gave it to you and try again.
        </p>
      </div>
    </div>
  );
}
