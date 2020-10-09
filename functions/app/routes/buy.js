import React from "react";
import Logo, { useLogoAnimation } from "../components/Logo";

export default function Buy() {
  let [colors, changeColors] = useLogoAnimation();
  return (
    <div className="bg-gray-900">
      <div className="pt-12 sm:pt-16 lg:pt-24">
        <div className="max-w-screen-xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-2 lg:max-w-none">
            <div className="max-w-md mx-auto" onMouseMove={changeColors}>
              <Logo colors={colors} className="w-full" />
            </div>
            <p className="text-3xl leading-9 font-extrabold text-white sm:text-4xl sm:leading-10 lg:text-5xl lg:leading-none">
              Beta Preview Now Available
            </p>
            <p className="text-xl leading-7 text-gray-300">
              Beta licenses are limited
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8 pb-12 bg-gray-200 sm:mt-12 sm:pb-16 lg:mt-16 lg:pb-24">
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
                  <p className="mt-5 text-lg leading-7 text-gray-700">
                    Got a side project but you've spent the last few weekends
                    just screwing around with webpack? Knock it off! For a
                    couple hundered bucks you've got us behind you.
                  </p>
                </div>
                <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-gray-100 space-y-6 sm:p-10 sm:pt-6">
                  <Checklist>
                    <Check>Unlimited projects</Check>
                    <Check>Access to community chat</Check>
                    <Check>Lower beta price</Check>
                    <Check>Cancel any time, use the last version forever</Check>
                  </Checklist>
                  <div className="rounded-md shadow">
                    <a
                      href="#"
                      className="flex items-center justify-center px-5 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                      aria-describedby="tier-standard"
                    >
                      Buy My Indie License
                    </a>
                  </div>
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
                    Your projects need a solid foundation. You could hire a team
                    for about $1M/yr to build it, or pay a fraction of that for
                    Remix. Great tools increase the productivity of
                    everybody—this is a steal.
                  </p>
                </div>
                <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-gray-100 space-y-6 sm:p-10 sm:pt-6">
                  <Checklist>
                    <Check>Unlimited projects</Check>
                    <Check>Access to community chat</Check>
                    <Check>Basic Support</Check>
                    <Check>Team size can change (annual review)</Check>
                  </Checklist>
                  <div className="rounded-md shadow">
                    <a
                      href="#"
                      className="flex items-center justify-center px-5 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                      aria-describedby="tier-standard"
                    >
                      Buy a Team License
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white">
        <div className="max-w-screen-xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h2 className="text-3xl leading-9 font-extrabold text-gray-900 text-center">
            Frequently asked questions
          </h2>
          <div className="mt-12">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:grid-rows-2 md:col-gap-8 md:row-gap-12 lg:grid-cols-3">
              <div className="space-y-2">
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  Is there a trial period?
                </dt>
                <dd className="text-base leading-6 text-gray-500">
                  Not at this time. We are currently in beta and can make no
                  guarantees to the production-readiness of Remix (that's the
                  point of the beta!). Wait for the 1.0 release if you'd like a
                  a refundable evaluation period.
                </dd>
              </div>
              <div className="space-y-2">
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  How do you make holy water?
                </dt>
                <dd className="text-base leading-6 text-gray-500">
                  You boil the hell out of it. Lorem ipsum dolor sit amet
                  consectetur adipisicing elit. Quas cupiditate laboriosam
                  fugiat.
                </dd>
              </div>
              <div className="space-y-2">
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  Why do you never see elephants hiding in trees?
                </dt>
                <dd className="text-base leading-6 text-gray-500">
                  Because they're so good at it. Lorem ipsum dolor sit amet
                  consectetur adipisicing elit. Quas cupiditate laboriosam
                  fugiat.
                </dd>
              </div>
              <div className="space-y-2">
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  What do you call someone with no body and no nose?
                </dt>
                <dd className="text-base leading-6 text-gray-500">
                  Nobody knows. Lorem ipsum dolor sit amet consectetur
                  adipisicing elit. Quas cupiditate laboriosam fugiat.
                </dd>
              </div>
              <div className="space-y-2">
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  Why can't you hear a pterodactyl go to the bathroom?
                </dt>
                <dd className="text-base leading-6 text-gray-500">
                  Because the pee is silent. Lorem ipsum dolor sit amet
                  consectetur adipisicing elit. Quas cupiditate laboriosam
                  fugiat.
                </dd>
              </div>
              <div className="space-y-2">
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  Why did the invisible man turn down the job offer?
                </dt>
                <dd className="text-base leading-6 text-gray-500">
                  He couldn't see himself doing it. Lorem ipsum dolor sit amet
                  consectetur adipisicing elit. Quas cupiditate laboriosam
                  fugiat.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="py-16 xl:py-36 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="max-w-max-content lg:max-w-7xl mx-auto">
          <div className="relative z-10 mb-8 md:mb-2 md:px-6">
            <div className="text-base max-w-prose lg:max-w-none">
              <p className="leading-6 text-green-600 font-semibold tracking-wide uppercase">
                Annual License Renewal
              </p>
              <h1 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
                Why is it per year?
              </h1>
            </div>
          </div>
          <div className="relative">
            <svg
              className="hidden md:block absolute top-0 right-0 -mt-20 -mr-20"
              width={404}
              height={384}
              fill="none"
              viewBox="0 0 404 384"
            >
              <defs>
                <pattern
                  id="95e8f2de-6d30-4b7e-8159-f791729db21b"
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
                height={384}
                fill="url(#95e8f2de-6d30-4b7e-8159-f791729db21b)"
              />
            </svg>
            <svg
              className="hidden md:block absolute bottom-0 left-0 -mb-20 -ml-20"
              width={404}
              height={384}
              fill="none"
              viewBox="0 0 404 384"
            >
              <defs>
                <pattern
                  id="7a00fe67-0343-4a3c-8e81-c145097a3ce0"
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
                height={384}
                fill="url(#7a00fe67-0343-4a3c-8e81-c145097a3ce0)"
              />
            </svg>
            <div className="relative md:bg-white md:p-6">
              <div className="lg:grid lg:grid-cols-2 lg:gap-6 mb-8">
                <div className="prose prose-lg text-gray-700 mb-6 lg:max-w-none lg:mb-0">
                  <p>
                    Ultrices ultricies a in odio consequat egestas rutrum. Ut
                    vitae aliquam in ipsum. Duis nullam placerat cursus risus
                    ultrices nisi, vitae tellus in. Qui non fugiat aut minus aut
                    rerum. Perspiciatis iusto mollitia iste minima soluta id.
                  </p>
                  <p>
                    Erat pellentesque dictumst ligula porttitor risus eget et
                    eget. Ultricies tellus felis id dignissim eget. Est augue{" "}
                    <a href="#">maecenas</a> risus nulla ultrices congue nunc
                    tortor. Eu leo risus porta integer suspendisse sed sit
                    ligula elit.
                  </p>
                  <ol>
                    <li>
                      Integer varius imperdiet sed interdum felis cras in nec
                      nunc.
                    </li>
                    <li>
                      Quam malesuada odio ut sit egestas. Elementum at porta
                      vitae.
                    </li>
                  </ol>
                  <p>
                    Amet, eu nulla id molestie quis tortor. Auctor erat justo,
                    sed pellentesque scelerisque interdum blandit lectus. Nec
                    viverra amet ac facilisis vestibulum. Vestibulum purus nibh
                    ac ultricies congue.
                  </p>
                </div>
                <div className="prose prose-lg text-gray-700">
                  <p>
                    Erat pellentesque dictumst ligula porttitor risus eget et
                    eget. Ultricies tellus felis id dignissim eget. Est augue
                    maecenas risus nulla ultrices congue nunc tortor.
                  </p>
                  <p>
                    Eu leo risus porta integer suspendisse sed sit ligula elit.
                    Elit egestas lacinia sagittis pellentesque neque dignissim
                    vulputate sodales. Diam sed mauris felis risus, ultricies
                    mauris netus tincidunt. Mauris sit eu ac tellus nibh non
                    eget sed accumsan. Viverra ac sed venenatis pulvinar elit.
                    Cras diam quis tincidunt lectus. Non mi vitae, scelerisque
                    felis nisi, netus amet nisl.
                  </p>
                  <p>
                    Eu eu mauris bibendum scelerisque adipiscing et. Justo,
                    elementum consectetur morbi eros, posuere ipsum tortor. Eget
                    cursus massa sed velit feugiat sed ut. Faucibus eros mauris
                    morbi aliquam nullam. Scelerisque elementum sit magna
                    ullamcorper dignissim pretium.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Checklist({ children }) {
  return <ul className="space-y-4">{children}</ul>;
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
