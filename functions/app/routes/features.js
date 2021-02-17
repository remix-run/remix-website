import React from "react";
import * as CacheControl from "../utils/CacheControl";
import { ExampleApp } from "../components/Invoices";
import TheRestHolyCrap from "../md/features.mdx";
import PublicTopNav from "../components/PublicTopNav";
import YouTube from "../components/YouTube";

export function headers() {
  return {
    ...CacheControl.pub,
    Link: "</buy>;rel=prefetch;as=document",
  };
}

export function meta() {
  return {
    title: "Features | Remix",
    description:
      "Web fundamentals on modern architecture. Check out the features of Remix.",
  };
}

function B(props) {
  return <span className="text-black" {...props} />;
}

function P(props) {
  return <p className="mt-3 text-lg leading-7 text-gray-600" {...props} />;
}

export default function Features() {
  return (
    <div>
      <PublicTopNav />
      <div className="py-8 bg-gray-50 overflow-hidden lg:py-24">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-screen-xl">
          <svg
            className="hidden lg:block absolute left-full transform -translate-x-1/2 -translate-y-1/4"
            width={404}
            height={784}
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="b1e6e422-73f8-40a6-b5d9-c8586e37e0e7"
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className="text-gray-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect
              width={404}
              height={784}
              fill="url(#b1e6e422-73f8-40a6-b5d9-c8586e37e0e7)"
            />
          </svg>
          <div className="relative">
            <div className="lg:max-w-7xl lg:m-auto lg:grid lg:grid-cols-2 lg:gap-6">
              <div className="mt-4 mx-auto">
                <h1 className="mb-4 text-center lg:text-right text-3xl leading-8 font-extrabold tracking-tight text-aqua-600 sm:text-5xl sm:leading-tight">
                  Web Fundamentals
                </h1>
                <p className="lg:text-right font-sm sm:font-normal text-gray-600">
                  With the rise of JavaScript heavy web sites and client side
                  routing, the React ecosystem has left behind a lot of the
                  fundamental pieces of the web. <B>Remix brings them back</B>.
                  Things like server rendering, http caching, meta tags, proper
                  status codes–and for Pete's sake document titles!
                </p>
              </div>
              <div className="mt-8 lg:mt-4 mx-auto">
                <h1 className="mb-4 text-center lg:text-left text-3xl leading-8 font-extrabold tracking-tight text-pink-500 sm:text-5xl sm:leading-tight">
                  Modern Architecture
                </h1>
                <p className="font-sm sm:font-normal text-gray-600">
                  At the same time, web infrastructure has changed for the
                  better. <B>CDNs</B> are more advanced,{" "}
                  <B>serverless functions</B> give unprecendented scale,
                  browsers have new APIs for <B>preloading resources</B>,
                  bundlers and <B>HTTP/2</B> change the way we approach code
                  splitting. And of course, React's component model is
                  incredible even for plain markup. Remix is built to take
                  advantage of it all.
                </p>
              </div>
            </div>
          </div>
          <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="relative">
              <h4 className="text-2xl leading-8 font-extrabold text-gray-900 tracking-tight sm:text-3xl sm:leading-9">
                (Re)Discover the Web
              </h4>
              <P>
                Remix teaches you the foundational features of the web and then
                provides simple APIs for you to take advantage of them.
              </P>
              <ul className="mt-10">
                <li>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <svg
                          className="h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h5 className="text-lg leading-6 font-medium text-gray-900">
                        HTTP Caching
                      </h5>
                      <p className="mt-2 text-base leading-6 text-gray-600">
                        We run a website called{" "}
                        <a className="text-blue-500" href="https://unpkg.com">
                          UNPKG
                        </a>
                        . It serves over <B>50 billion</B> requests per month
                        without making a dent on our credit card bill. It's
                        possible because of HTTP caching and CDNs. A trend is to
                        turn to SSG to find performance like this, but then you
                        complicate deployment and give up dynamic content, not
                        to mention UNPKG is simply impossible to build with SSG.
                        The result is the same though: a cached document on a
                        CDN. You can skip the build bonanza with Remix and keep
                        the performance with our performance-minded API.
                      </p>
                    </div>
                  </div>
                </li>
                <li className="mt-10">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <svg
                          className="h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h5 className="text-lg leading-6 font-medium text-gray-900">
                        Meta Tags
                      </h5>
                      <p className="mt-2 text-base leading-6 text-gray-600">
                        Without server rendered meta tags, your website is
                        simply incomplete. Meta tags are the reason fancy little
                        website previews show up on social media and text
                        messages. It's also how search engines know how to crawl
                        your site and decide to put you on the first page.
                      </p>
                    </div>
                  </div>
                </li>
                <li className="mt-10">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <svg
                          className="h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h5 className="text-lg leading-6 font-medium text-gray-900">
                        Status Codes and Server Rendering
                      </h5>
                      <p className="mt-2 text-base leading-6 text-gray-600">
                        Server rendering provides solid UX advantages and is
                        still the gold standard for SEO, but you might not give
                        much thought to status codes lately. Well, CDNs and
                        search engines certainly do. For years React apps (even
                        server rendered ones) have been sending 200's for
                        everything. Not found? 200. No record? 200. Server
                        error? 200. Redirect (!) 200. This hurts your SEO and
                        your CDN capabilities. Remix sends the right status
                        code, even on client side transitions.
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="hidden mt-10 -mx-4 relative lg:block lg:mt-0">
              <svg
                className="absolute left-1/2 transform -translate-x-1/2 translate-y-16 lg:hidden"
                width={784}
                height={404}
                fill="none"
                viewBox="0 0 784 404"
              >
                <defs>
                  <pattern
                    id="ca9667ae-9f92-4be7-abcb-9e3d727f2941"
                    x={0}
                    y={0}
                    width={20}
                    height={20}
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      x={0}
                      y={0}
                      width={4}
                      height={4}
                      className="text-gray-200"
                      fill="currentColor"
                    />
                  </pattern>
                </defs>
                <rect
                  width={784}
                  height={404}
                  fill="url(#ca9667ae-9f92-4be7-abcb-9e3d727f2941)"
                />
              </svg>
              <div className="p-8">
                <img
                  className="relative mx-auto rounded-xl shadow-md w-full"
                  src="/img/unpkg.png"
                  alt=""
                />
              </div>
            </div>
          </div>
          <svg
            className="hidden lg:block absolute right-full transform translate-x-1/2 translate-y-12"
            width={404}
            height={784}
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="64e643ad-2176-4f86-b3d7-f2c5da3b6a6d"
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className="text-gray-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect
              width={404}
              height={784}
              fill="url(#64e643ad-2176-4f86-b3d7-f2c5da3b6a6d)"
            />
          </svg>
          <div className="relative mt-12 sm:mt-16 lg:mt-24">
            <div className="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="lg:col-start-2">
                <h4 className="text-2xl leading-8 font-extrabold text-gray-900 tracking-tight sm:text-3xl sm:leading-9">
                  Data Loading, But Easy
                </h4>
                <P>
                  Remix makes loading data for a route as simple as it sounds:
                  fetch some data, render it. Write a server side function to
                  fetch data, Remix does the rest.
                </P>
                <ul className="mt-10">
                  <li>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                          <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h5 className="text-lg leading-6 font-medium text-gray-900">
                          Centralized Data Loading
                        </h5>
                        <p className="mt-2 text-base leading-6 text-gray-600">
                          Remix centralizes data loading on the server. The
                          initial page is server rendered with data in the
                          markup while automatically fetching in the client as
                          the user navigates around. That's right, put{" "}
                          <code>useEffect</code> back on the shelf.
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="mt-10">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                          <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h5 className="text-lg leading-6 font-medium text-gray-900">
                          Talk directly to your Database
                        </h5>
                        <p className="mt-2 text-base leading-6 text-gray-600">
                          Since all data loading is on the server, you can talk
                          directly to your database. No need to write the
                          function once for the server, and again for the
                          browser (and certainly no screwing around with making
                          things "isomorphic", whatever that means!)
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="mt-10">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                          <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h5 className="text-lg leading-6 font-medium text-gray-900">
                          Built on Standards
                        </h5>
                        <p className="mt-2 text-base leading-6 text-gray-600">
                          Remix also brings the{" "}
                          <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API">
                            Fetch API
                          </a>{" "}
                          to your loaders. You can use fetch for network calls
                          and even return real Responses with cache headers and
                          everything.
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="hidden mt-10 -mx-4 relative lg:block lg:mt-0 lg:col-start-1">
                <svg
                  className="absolute left-1/2 transform -translate-x-1/2 translate-y-16 lg:hidden"
                  width={784}
                  height={404}
                  fill="none"
                  viewBox="0 0 784 404"
                >
                  <defs>
                    <pattern
                      id="e80155a9-dfde-425a-b5ea-1f6fadd20131"
                      x={0}
                      y={0}
                      width={20}
                      height={20}
                      patternUnits="userSpaceOnUse"
                    >
                      <rect
                        x={0}
                        y={0}
                        width={4}
                        height={4}
                        className="text-gray-200"
                        fill="currentColor"
                      />
                    </pattern>
                  </defs>
                  <rect
                    width={784}
                    height={404}
                    fill="url(#e80155a9-dfde-425a-b5ea-1f6fadd20131)"
                  />
                </svg>
                <LoaderDemo />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-screen-xl">
        <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div className="relative">
            <h4 className="text-2xl leading-8 font-extrabold text-gray-900 tracking-tight sm:text-3xl sm:leading-9">
              Nested Routes: The Remix Cheat Code
            </h4>
            <P>
              Remix takes advantage of React Router's nested routing paradigm
              (hat tip Ember) which gives us unique insight into route
              transitions and rendering.
            </P>
            <p className="text-sm text-gray-700 mt-4">
              Traditional approaches associate resources and UI one-to-one with
              URLs. This way they can fetch or preload resources for page
              navigation. Unfortunately, when pieces of UI persist you end up
              refetching stuff the user already has because you don't know
              enough about the UI to prevent it. Other approaches try to move
              resource dependencies all the way down to the component level. In
              this case you don't know what resources you need until you render!
              By then it's too late to do any preloading.
            </p>
            <ul className="mt-10">
              <li>
                <h5 className="text-lg leading-6 font-medium text-gray-900">
                  Layouts, where resources live
                </h5>
                <p className="mt-2 text-base leading-6 text-gray-600">
                  Your layouts define the data, modules, and styles that a
                  portion of the page needs to render. Remix routes nested in
                  folders define nested UI and resources. This gives us great
                  insight into what is going to render next when the URL
                  changes.
                </p>
              </li>
              <li className="mt-10">
                <h5 className="text-lg leading-6 font-medium text-gray-900">
                  Persisted UI State
                </h5>
                <p className="mt-2 text-base leading-6 text-gray-600">
                  Remix knows your layouts, so when the page changes you won't
                  lose state in layouts that persist through the URL change.
                  Best example of this is the scroll position of a sidebar nav.
                  Nested routes only update the changing portion of the page.
                </p>
              </li>
              <li className="mt-10">
                <h5 className="text-lg leading-6 font-medium text-gray-900">
                  Smart Resource Fetching
                </h5>
                <p className="mt-2 text-base leading-6 text-gray-600">
                  Because Remix knows which layouts are changing and which are
                  not when the URL changes, it only fetches resources that the
                  user doesn't already have. Less network activity, better UX,
                  simple layout code, everybody's happy.
                </p>
              </li>
            </ul>
          </div>
          <div className="hidden mt-10 -mx-4 relative lg:block lg:mt-0">
            <svg
              className="absolute left-1/2 transform -translate-x-1/2 translate-y-16 lg:hidden"
              width={784}
              height={404}
              fill="none"
              viewBox="0 0 784 404"
            >
              <defs>
                <pattern
                  id="ca9667ae-9f92-4be7-abcb-9e3d727f2941"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x={0}
                    y={0}
                    width={4}
                    height={4}
                    className="text-gray-200"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect
                width={784}
                height={404}
                fill="url(#ca9667ae-9f92-4be7-abcb-9e3d727f2941)"
              />
            </svg>
            <div className="p-12 bg-white max-w-2xl">
              <ExampleApp step={4} />
            </div>
          </div>
        </div>
      </div>
      <DeployAnywhere />
      {/*
      <div className="m-auto max-w-7xl my-16">
        <YouTube id="cmh8mp8TUUE" />
      </div>
      */}
      <CTA />
      <div className="bg-gray-100 py-24">
        <h2 className="text-center text-3xl leading-9 font-extrabold text-black sm:text-4xl sm:leading-10 mb-12">
          Still here? Alright, here's some more...
        </h2>
        <div className="m-auto max-w-4xl">
          <TheRestHolyCrap />
        </div>
      </div>
      <CTA />
    </div>
  );
}

function CTA() {
  return (
    <div className="bg-aqua-600 py-20">
      <div className="max-w-2xl mx-auto text-center px-4 sm:py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl leading-9 font-extrabold text-white sm:text-4xl sm:leading-10">
          <span className="block">Start shipping better websites today!</span>
        </h2>
        <a
          href="/buy"
          className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-aqua-600 bg-white hover:text-aqua-500 hover:bg-aqua-50 transition duration-150 ease-in-out sm:w-auto"
        >
          View Pricing
        </a>
      </div>
    </div>
  );
}

function DeployAnywhere() {
  return (
    <div className="bg-white my-24">
      <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h3 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
          It's your app, deploy it anywhere
        </h3>
        <p className="mt-4 max-w-3xl mx-auto text-center text-xl leading-7 text-gray-500">
          Remix is made for the serverless era. All it needs is a single http
          handler and a place for static assets. We even ship with packages to
          help you deploy to some of the most popular Cloud Services, and will
          continue to add more.
        </p>
        <div className="mt-12 place-items-center grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
          <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
            <VercelLogo />
          </div>
          <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
            <FirebaseLogo />
          </div>
          <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
            <AzureLogo />
          </div>
          <div className="col-span-1 flex justify-center md:col-span-3 lg:col-span-1">
            <AWSLogo />
          </div>
          <div className="col-span-2 flex justify-center md:col-span-3 lg:col-span-1">
            <ExpressLogo />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpressLogo() {
  return (
    <svg
      className="h-12"
      viewBox="0 0 512 149"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.332 115.629V58.648h71.144v-3.333H3.332V3.332h75.642V0H0v118.961h79.64v-3.332H3.333zm140.455-82.307l-29.49 38.821-28.825-38.82H81.14l31.157 41.32L78.14 118.96h3.999l32.156-41.82 32.323 41.82h4.165l-34.322-44.319 31.323-41.32h-3.998zm16.994 114.963V94.97h.333c2 7.775 5.943 14.023 11.83 18.744 5.887 4.72 13.384 7.081 22.492 7.081 5.887 0 11.108-1.194 15.662-3.582s8.358-5.637 11.413-9.747c3.054-4.11 5.387-8.886 6.998-14.329 1.61-5.442 2.416-11.163 2.416-17.16 0-6.443-.834-12.386-2.5-17.828-1.666-5.443-4.082-10.164-7.247-14.162-3.166-3.999-6.998-7.11-11.497-9.33-4.498-2.222-9.58-3.333-15.245-3.333-4.332 0-8.358.639-12.079 1.916-3.721 1.278-7.025 3.082-9.913 5.415a36.674 36.674 0 0 0-7.498 8.247c-2.11 3.166-3.721 6.637-4.832 10.414h-.333V33.322h-3.332v114.963h3.332zm34.655-30.657c-10.44 0-18.827-3.582-25.158-10.746-6.331-7.164-9.497-17.467-9.497-30.907 0-5.554.778-10.83 2.333-15.828 1.555-4.998 3.804-9.386 6.747-13.162 2.944-3.777 6.582-6.776 10.913-8.997 4.332-2.222 9.22-3.333 14.662-3.333 5.554 0 10.414 1.111 14.579 3.333 4.165 2.221 7.609 5.248 10.33 9.08s4.776 8.22 6.165 13.162c1.388 4.943 2.082 10.191 2.082 15.745 0 4.999-.638 9.97-1.916 14.912-1.277 4.943-3.249 9.386-5.915 13.33-2.665 3.942-6.08 7.163-10.246 9.663-4.166 2.499-9.192 3.748-15.079 3.748zm54.816 1.333V70.477c0-4.665.666-9.22 2-13.662 1.332-4.443 3.387-8.359 6.164-11.746 2.777-3.388 6.303-6.054 10.58-7.998 4.276-1.944 9.358-2.749 15.245-2.416v-3.332c-5.11-.11-9.58.444-13.412 1.666-3.833 1.222-7.137 2.888-9.914 4.999-2.777 2.11-4.998 4.581-6.664 7.414a33.15 33.15 0 0 0-3.666 9.08h-.333v-21.16h-3.332v85.64h3.332zm38.154-42.153h71.643c.223-5.887-.36-11.551-1.749-16.994-1.388-5.443-3.61-10.275-6.664-14.495-3.055-4.221-6.998-7.609-11.83-10.164-4.832-2.555-10.58-3.832-17.244-3.832-4.777 0-9.442 1-13.996 3-4.554 1.999-8.553 4.914-11.996 8.746-3.443 3.832-6.22 8.525-8.33 14.08-2.11 5.553-3.166 11.884-3.166 18.993 0 6.331.722 12.246 2.166 17.744 1.444 5.498 3.665 10.275 6.664 14.329 3 4.054 6.86 7.192 11.58 9.413 4.72 2.222 10.413 3.277 17.078 3.166 9.774 0 17.994-2.75 24.658-8.247 6.665-5.499 10.608-13.246 11.83-23.243h-3.332c-1.444 9.442-5.138 16.523-11.08 21.243-5.943 4.721-13.412 7.081-22.41 7.081-6.109 0-11.274-1.055-15.495-3.165-4.22-2.11-7.664-4.999-10.33-8.664-2.665-3.666-4.637-7.97-5.914-12.913-1.278-4.942-1.972-10.302-2.083-16.078zm68.311-3.332h-68.31c.332-5.998 1.443-11.385 3.331-16.161 1.889-4.777 4.36-8.859 7.415-12.246 3.054-3.388 6.609-5.97 10.663-7.748 4.054-1.777 8.414-2.666 13.079-2.666 5.554 0 10.44 1.028 14.662 3.083 4.22 2.055 7.747 4.86 10.58 8.414 2.832 3.554 4.97 7.692 6.414 12.412 1.444 4.721 2.166 9.692 2.166 14.912zm72.477-14.828h3.332c0-9.553-2.777-16.495-8.33-20.827-5.555-4.332-13.108-6.498-22.66-6.498-5.332 0-9.83.667-13.496 2-3.665 1.332-6.664 3.054-8.997 5.164-2.332 2.11-3.998 4.443-4.998 6.998-1 2.555-1.5 4.999-1.5 7.331 0 4.665.833 8.386 2.5 11.163 1.666 2.777 4.276 4.943 7.83 6.498 2.444 1.11 5.22 2.11 8.331 3 3.11.888 6.72 1.832 10.83 2.831 3.665.89 7.275 1.778 10.83 2.666 3.554.889 6.692 2.083 9.413 3.582 2.722 1.5 4.943 3.416 6.665 5.749 1.721 2.332 2.582 5.387 2.582 9.163 0 3.666-.86 6.776-2.582 9.33a20.815 20.815 0 0 1-6.581 6.249c-2.666 1.61-5.638 2.776-8.914 3.498-3.277.722-6.47 1.083-9.58 1.083-10.108 0-17.856-2.249-23.243-6.747-5.387-4.499-8.08-11.58-8.08-21.244h-3.333c0 10.775 2.916 18.661 8.747 23.66 5.832 4.998 14.468 7.497 25.909 7.497 3.665 0 7.358-.417 11.08-1.25 3.72-.833 7.053-2.193 9.996-4.082a22.592 22.592 0 0 0 7.164-7.33c1.833-3 2.75-6.665 2.75-10.997 0-4.11-.806-7.442-2.416-9.997-1.611-2.554-3.721-4.665-6.332-6.331-2.61-1.666-5.553-2.971-8.83-3.915a516.08 516.08 0 0 0-9.914-2.75 1726.675 1726.675 0 0 0-12.246-3.165c-3.498-.889-6.747-1.944-9.746-3.166-2.888-1.222-5.193-2.971-6.915-5.248-1.722-2.277-2.582-5.526-2.582-9.747 0-.777.222-2.166.666-4.165.444-2 1.5-4.027 3.166-6.082 1.666-2.054 4.22-3.887 7.664-5.498 3.443-1.61 8.164-2.416 14.162-2.416 4.11 0 7.858.445 11.246 1.333 3.388.889 6.304 2.305 8.747 4.249 2.444 1.944 4.332 4.415 5.665 7.414 1.333 3 2 6.665 2 10.997zm77.141 0h3.332c0-9.553-2.776-16.495-8.33-20.827-5.554-4.332-13.107-6.498-22.66-6.498-5.331 0-9.83.667-13.495 2-3.666 1.332-6.665 3.054-8.997 5.164-2.333 2.11-3.999 4.443-4.999 6.998-1 2.555-1.499 4.999-1.499 7.331 0 4.665.833 8.386 2.5 11.163 1.665 2.777 4.276 4.943 7.83 6.498 2.444 1.11 5.22 2.11 8.33 3 3.11.888 6.72 1.832 10.83 2.831 3.666.89 7.276 1.778 10.83 2.666 3.555.889 6.692 2.083 9.414 3.582 2.721 1.5 4.943 3.416 6.664 5.749 1.722 2.332 2.583 5.387 2.583 9.163 0 3.666-.861 6.776-2.583 9.33a20.815 20.815 0 0 1-6.58 6.249c-2.667 1.61-5.638 2.776-8.915 3.498-3.276.722-6.47 1.083-9.58 1.083-10.108 0-17.855-2.249-23.242-6.747-5.388-4.499-8.081-11.58-8.081-21.244h-3.332c0 10.775 2.915 18.661 8.747 23.66 5.831 4.998 14.467 7.497 25.908 7.497 3.666 0 7.359-.417 11.08-1.25 3.72-.833 7.053-2.193 9.997-4.082a22.592 22.592 0 0 0 7.164-7.33c1.833-3 2.749-6.665 2.749-10.997 0-4.11-.805-7.442-2.416-9.997-1.61-2.554-3.72-4.665-6.331-6.331-2.61-1.666-5.554-2.971-8.83-3.915a516.071 516.071 0 0 0-9.914-2.75 1726.65 1726.65 0 0 0-12.246-3.165c-3.499-.889-6.748-1.944-9.747-3.166-2.888-1.222-5.193-2.971-6.914-5.248-1.722-2.277-2.583-5.526-2.583-9.747 0-.777.222-2.166.667-4.165.444-2 1.5-4.027 3.165-6.082 1.666-2.054 4.221-3.887 7.664-5.498 3.444-1.61 8.164-2.416 14.163-2.416 4.11 0 7.858.445 11.246 1.333 3.388.889 6.303 2.305 8.747 4.249 2.444 1.944 4.332 4.415 5.665 7.414 1.333 3 2 6.665 2 10.997z"
        fill="#222"
      />
    </svg>
  );
}

function AWSLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-20"
      viewBox="1.578 2.186 1087.411 855.842"
    >
      <path
        fill="#F7A80D"
        d="M318.839 547.785l-99.62 42.792 92.26 39.455 106.98-39.455-99.62-42.792zm-149.773 53.49l-3.338 192.564 145.75 64.188V658.104l-142.412-56.829zm299.545 0l-131.715 50.152V839.97l131.715-53.49V601.275zM625.743 2.186L525.438 44.979l92.944 39.454 106.98-39.454-99.619-42.793zm-139.074 56.85V251.6l124.354 36.116 4.022-175.191-128.376-53.489zm278.149 10.697L647.14 119.886v189.227l117.679-53.49V69.733zM154.688 273.21l-99.62 42.792 92.26 39.455 106.98-39.455-99.62-42.792zM4.916 326.7L1.578 519.265l145.75 64.188V383.528L4.916 326.7zm299.545 0l-131.714 50.152v188.542l131.714-53.49V326.7zm171.168-60.594l-99.62 42.792 92.26 39.455 106.98-39.455-99.62-42.792zm-149.773 53.491l-3.338 192.564 145.75 64.188V376.446l-142.412-56.849zm299.545 0l-131.714 50.152v188.542l131.714-53.49V319.597zM939.217 2.186l-99.619 42.792 92.26 39.454 106.979-39.454-99.62-42.792zm-149.773 53.49l-3.337 192.564 145.75 64.188V112.525L789.444 55.676zm299.545 0l-131.714 50.152V294.37l131.714-53.49V55.676z"
      />
    </svg>
  );
}

function AzureLogo() {
  return (
    <svg
      className="h-20"
      viewBox="0 0 161.67 129"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m88.33 0-47.66 41.33-40.67 73h36.67zm6.34 9.67-20.34 57.33 39 49-75.66 13h124z"
        fill="#0072c6"
      />
    </svg>
  );
}

function VercelLogo() {
  return (
    <svg
      className="h-12"
      viewBox="0 0 283 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M141.04 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM248.72 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM200.24 34c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9V5h9zM36.95 0L73.9 64H0L36.95 0zm92.38 5l-27.71 48L73.91 5H84.3l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10V51h-9V17h9v9.2c0-5.08 5.91-9.2 13.2-9.2z"
        fill="#000"
      />
    </svg>
  );
}

function FirebaseLogo() {
  return (
    <svg
      className="h-20"
      viewBox="0 0 256 351"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      preserveAspectRatio="xMidYMid"
    >
      <defs>
        <path
          d="M1.253 280.732l1.605-3.131 99.353-188.518-44.15-83.475C54.392-1.283 45.074.474 43.87 8.188L1.253 280.732z"
          id="a"
        />
        <filter
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          filterUnits="objectBoundingBox"
          id="b"
        >
          <feGaussianBlur
            stdDeviation="17.5"
            in="SourceAlpha"
            result="shadowBlurInner1"
          />
          <feOffset in="shadowBlurInner1" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            operator="arithmetic"
            k2={-1}
            k3={1}
            result="shadowInnerInner1"
          />
          <feColorMatrix
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"
            in="shadowInnerInner1"
          />
        </filter>
        <path
          d="M134.417 148.974l32.039-32.812-32.039-61.007c-3.042-5.791-10.433-6.398-13.443-.59l-17.705 34.109-.53 1.744 31.678 58.556z"
          id="c"
        />
        <filter
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          filterUnits="objectBoundingBox"
          id="d"
        >
          <feGaussianBlur
            stdDeviation="3.5"
            in="SourceAlpha"
            result="shadowBlurInner1"
          />
          <feOffset
            dx={1}
            dy={-9}
            in="shadowBlurInner1"
            result="shadowOffsetInner1"
          />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            operator="arithmetic"
            k2={-1}
            k3={1}
            result="shadowInnerInner1"
          />
          <feColorMatrix
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0"
            in="shadowInnerInner1"
          />
        </filter>
      </defs>
      <path
        d="M0 282.998l2.123-2.972L102.527 89.512l.212-2.017L58.48 4.358C54.77-2.606 44.33-.845 43.114 6.951L0 282.998z"
        fill="#FFC24A"
      />
      <use fill="#FFA712" fillRule="evenodd" xlinkHref="#a" />
      <use filter="url(#b)" xlinkHref="#a" />
      <path
        d="M135.005 150.38l32.955-33.75-32.965-62.93c-3.129-5.957-11.866-5.975-14.962 0L102.42 87.287v2.86l32.584 60.233z"
        fill="#F4BD62"
      />
      <use fill="#FFA50E" fillRule="evenodd" xlinkHref="#c" />
      <use filter="url(#d)" xlinkHref="#c" />
      <path
        fill="#F6820C"
        d="M0 282.998l.962-.968 3.496-1.42 128.477-128 1.628-4.431-32.05-61.074z"
      />
      <path
        d="M139.121 347.551l116.275-64.847-33.204-204.495c-1.039-6.398-8.888-8.927-13.468-4.34L0 282.998l115.608 64.548a24.126 24.126 0 0 0 23.513.005"
        fill="#FDE068"
      />
      <path
        d="M254.354 282.16L221.402 79.218c-1.03-6.35-7.558-8.977-12.103-4.424L1.29 282.6l114.339 63.908a23.943 23.943 0 0 0 23.334.006l115.392-64.355z"
        fill="#FCCA3F"
      />
      <path
        d="M139.12 345.64a24.126 24.126 0 0 1-23.512-.005L.931 282.015l-.93.983 115.607 64.548a24.126 24.126 0 0 0 23.513.005l116.275-64.847-.285-1.752-115.99 64.689z"
        fill="#EEAB37"
      />
    </svg>
  );
}

function LoaderDemo() {
  return (
    <div className="relative mx-auto text-xs sm:p-12">
      <pre className="language-js sm:rounded-xl sm:shadow-md">
        <code className="language-js">
          <span className="token comment">
            ///////////////////////////////////////////////////////////////////
          </span>
          {"\n"}
          <span className="token comment">
            // Server side loaders fetch data from anywhere
          </span>
          {"\n"}
          <span className="token keyword">const</span> db{" "}
          <span className="token operator">=</span>{" "}
          <span className="token function">require</span>
          <span className="token punctuation">(</span>
          <span className="token string">"../db"</span>
          <span className="token punctuation">)</span>
          <span className="token punctuation">;</span>
          {"\n"}module<span className="token punctuation">.</span>
          <span className="token method-variable function-variable method function property-access">
            exports
          </span>{" "}
          <span className="token operator">=</span>{" "}
          <span className="token keyword">async</span>{" "}
          <span className="token punctuation">(</span>
          <span className="token parameter">
            <span className="token punctuation">{"{"}</span> params{" "}
            <span className="token punctuation">{"}"}</span>
          </span>
          <span className="token punctuation">)</span>{" "}
          <span className="token arrow operator">=&gt;</span>{" "}
          <span className="token punctuation">{"{"}</span>
          {"\n"}
          {"  "}
          <span className="token keyword">let</span> user{" "}
          <span className="token operator">=</span>{" "}
          <span className="token keyword">await</span> db
          <span className="token punctuation">.</span>
          <span className="token method function property-access">query</span>
          <span className="token punctuation">(</span>
          <span className="token template-string">
            <span className="token template-punctuation string">`</span>
            <span className="token string">users/</span>
            <span className="token interpolation">
              <span className="token interpolation-punctuation punctuation">
                ${"{"}
              </span>
              params<span className="token punctuation">.</span>
              <span className="token property-access">userId</span>
              <span className="token interpolation-punctuation punctuation">
                {"}"}
              </span>
            </span>
            <span className="token template-punctuation string">`</span>
          </span>
          <span className="token punctuation">)</span>
          <span className="token punctuation">;</span>
          {"\n"}
          {"  "}
          <span className="token keyword">return</span>{" "}
          <span className="token function">fetch</span>
          <span className="token punctuation">(</span>
          <span className="token template-string">
            <span className="token template-punctuation string">`</span>
            <span className="token string">https://api.github.com/users/</span>
            <span className="token interpolation">
              <span className="token interpolation-punctuation punctuation">
                ${"{"}
              </span>
              user<span className="token punctuation">.</span>
              <span className="token property-access">githubLogin</span>
              <span className="token interpolation-punctuation punctuation">
                {"}"}
              </span>
            </span>
            <span className="token template-punctuation string">`</span>
          </span>
          <span className="token punctuation">)</span>
          <span className="token punctuation">;</span>
          {"\n"}
          <span className="token punctuation">{"}"}</span>
          <span className="token punctuation">;</span>
          {"\n"}
          {"\n"}
          <span className="token comment">
            ///////////////////////////////////////////////////////////////////
          </span>
          {"\n"}
          <span className="token comment">
            // Data gets passed to your route component
          </span>
          {"\n"}
          <span className="token keyword module">export</span>{" "}
          <span className="token keyword module">default</span>{" "}
          <span className="token keyword">function</span>{" "}
          <span className="token function">
            <span className="token maybe-class-name">UserGithubProfile</span>
          </span>
          <span className="token punctuation">(</span>
          <span className="token parameter">
            <span className="token punctuation">{"{"}</span> data{" "}
            <span className="token punctuation">{"}"}</span>
          </span>
          <span className="token punctuation">)</span>{" "}
          <span className="token punctuation">{"{"}</span>
          {"\n"}
          {"  "}
          <span className="token keyword">return</span>{" "}
          <span className="token punctuation">(</span>
          {"\n"}
          {"    "}
          <span className="token operator">
            <span className="token tag">
              <span className="token punctuation">&lt;</span>div
            </span>
            <span className="token punctuation">&gt;</span>
          </span>
          <span className="token operator">
            {"\n"}
            {"      "}
          </span>
          <span className="token operator">
            <span className="token tag">
              <span className="token punctuation">&lt;</span>h1
            </span>
            <span className="token punctuation">&gt;</span>
          </span>
          <span className="token operator">{"{"}</span>data
          <span className="token punctuation">.</span>
          <span className="token property-access">name</span>
          <span className="token punctuation">{"}"}</span>
          <span className="token operator">
            <span className="token tag">
              <span className="token punctuation">&lt;/</span>h1
            </span>
            <span className="token punctuation">&gt;</span>
          </span>
          <span className="token operator">
            {"\n"}
            {"      "}
          </span>
          <span className="token operator">
            <span className="token tag">
              <span className="token punctuation">&lt;</span>
              <span className="token class-name">Avatar</span>
            </span>{" "}
            <span className="token attr-name">src</span>
            <span className="token script language-javascript">
              <span className="token script-punctuation punctuation">=</span>
              <span className="token punctuation">{"{"}</span>data
              <span className="token punctuation">.</span>
              <span className="token property-access">avatar_url</span>
              <span className="token punctuation">{"}"}</span>
            </span>{" "}
            <span className="token punctuation">/&gt;</span>
          </span>
          <span className="token operator">
            {"\n"}
            {"    "}
          </span>
          <span className="token maybe-class-name">
            <span className="token tag">
              <span className="token punctuation">&lt;/</span>div
            </span>
            <span className="token punctuation">&gt;</span>
          </span>
          {"\n"}
          {"  "}
          <span className="token operator">)</span>
          <span className="token punctuation">;</span>
          {"\n"}
          <span className="token punctuation">{"}"}</span>
          {"\n"}
        </code>
      </pre>
    </div>
  );
}
