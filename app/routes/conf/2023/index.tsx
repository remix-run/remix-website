import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type {
  HeadersFunction,
  LinksFunction,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/node";
import cx from "clsx";
import {
  secondaryButtonLinkClass,
  outlineSecondaryButtonLinkClass,
} from "~/components/buttons";
import indexStyles from "~/styles/index.css";
import { Fragment } from "react";
import { getSponsors } from "~/utils/conf.server";
import type { Sponsor, SponsorLevel } from "~/utils/conf";
import { Link } from "~/components/link";
import { CACHE_CONTROL } from "~/utils/http.server";

export const meta: MetaFunction<typeof loader> = ({ data: { siteUrl } }) => {
  let url = `${siteUrl}/conf`;
  let title = "Remix Conf — May 2023";
  let image = `${siteUrl}/conf-images/2023/og_image.jpg`;
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
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: indexStyles }];
};

interface Speaker {
  id: string;
  nameFirst: string;
  nameLast: string;
  nameFull: string;
  tagLine: string | null;
  link: string | null;
  imgUrl: string | null;
  twitterHandle: string | null;
}

export const loader = async ({ request }: LoaderArgs) => {
  let speakers: Speaker[] = [];

  try {
    let fetched = await fetch(
      "https://sessionize.com/api/v2/s8ds2hnu/view/Speakers",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!fetched.ok) {
      throw new Error(
        "Error fetching speakers, responded with status: " + fetched.status
      );
    }
    let json: unknown = await fetched.json();
    if (!json || !Array.isArray(json)) {
      throw new Error(
        "Error fetching speakers. Expected an array, received:\n\n" + json
      );
    }

    speakers = json
      .map((speaker: unknown) => {
        try {
          validateSessionizeSpeakerData(speaker);
        } catch (error) {
          console.warn(
            "Invalid speaker object; skipping.\n\nSee API settings to ensure expected data is included: https://sessionize.com/app/organizer/schedule/api/endpoint/9617/7818\n\n",
            "Received:\n",
            speaker
          );
          return null;
        }
        return getSpeaker(speaker);
      })
      .filter(isNotEmpty);
  } catch (err) {
    // Don't blow up the whole page if we can't fetch speakers
    console.error(err);
  }

  let allSponsors = await getSponsors(2023);
  let sponsors: Partial<Record<SponsorLevel, Sponsor[]>> = {};
  for (let sponsor of allSponsors.sort(randomSort)) {
    let level = sponsor.level;
    sponsors[level] ??= [];
    sponsors[level]!.push(sponsor);
  }

  let requestUrl = new URL(request.url);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;
  return json(
    {
      siteUrl,
      sponsors,
      speakers: speakers.sort(randomSort),
    },
    { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } }
  );
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  };
};

export default function ConfIndex() {
  return (
    <div className="w-full overflow-x-hidden">
      <Hero />
      <EarlySponsors />
    </div>
  );
}

function Hero() {
  return (
    <Fragment>
      <section className="__hero bg-black relative pb-10 pt-40 sm:pb-16 sm:pt-48 md:pb-24 md:pt-52 lg:pb-32 lg:pt-64 w-full">
        <div className="__fx-wrapper">
          <div className="__fx-lights"></div>
          <div className="__fx-twinkle"></div>
          <div className="__fx-colors"></div>
        </div>
        <div className="container relative">
          <div className="flex flex-col xl:flex-row-reverse items-center xl:justify-between">
            <LogoRemixHero
              role="img"
              aria-label="Remix Conf 2023"
              focusable="false"
              className="flex-auto w-full h-auto max-w-md md:max-w-lg xl:max-w-xl mx-auto xl:mx-0"
            />
            <div className="max-w-xl mx-auto md:mx-0">
              <h1 className="font-display font-extrabold text-4xl md:text-7xl">
                <div className="text-white">May 9th-11th</div>
                <div className="text-yellow-brand">Salt Lake City</div>
              </h1>
              <div className="h-6" />
              <p className="space-y-4 text-lg lg:text-xl text-white">
                Remix is a full stack web framework that lets you focus on the
                user interface and work back through web standards to deliver a
                fast, slick, and resilient user experience.
              </p>
              <div className="h-9" />
              <div className="flex flex-col gap-4 md:flex-row items-center">
                <a
                  href="https://rmx.as/tickets"
                  className={`${outlineSecondaryButtonLinkClass} w-full md:w-auto`}
                >
                  Buy Tickets
                </a>
                <Link
                  to="sponsor"
                  className={`${secondaryButtonLinkClass} w-full md:w-auto`}
                >
                  Become a Sponsor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

function EarlySponsors() {
  let { sponsors, speakers } = useLoaderData<typeof loader>();
  let premierSponsor = sponsors.premier?.[0];
  return (
    <section className="relative my-10 sm:my-14 lg:my-24 xl:my-28">
      <div className="container">
        <div className="max-w-xl md:max-w-2xl xl:max-w-none mx-auto xl:mx-0 flex flex-col w-full gap-20 sm:gap-28 xl:gap-36">
          {speakers.length > 0 ? (
            <section>
              <h2 className="font-display font-extrabold text-4xl md:text-7xl mb-4 md:mb-8 text-blue-brand">
                Speakers
              </h2>
              <div className="max-w-sm sm:max-w-none mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8">
                {speakers.map((speaker) => {
                  let child = (
                    <div className="flex flex-col gap-4 w-full rounded-[inherit] overflow-hidden p-4">
                      {speaker.imgUrl ? (
                        <img
                          src={speaker.imgUrl}
                          alt=""
                          className="block w-full aspect-1 object-center object-contain saturate-50 group-hover/link:saturate-100 transition-all duration-1000"
                        />
                      ) : (
                        <div
                          aria-hidden
                          className="flex w-full aspect-1 font-extrabold text-center items-center justify-center border-[1px] border-gray-600 bg-gray-800 text-gray-400 select-none leading-1 text-6xl md:text-4xl xl:text-5xl"
                        >
                          {getInitials(speaker.nameFull)}
                        </div>
                      )}
                      <div>
                        <h3
                          className="font-semibold"
                          id={`speaker-${speaker.id}-name`}
                        >
                          {speaker.nameFull}
                        </h3>
                        {speaker.twitterHandle ? (
                          <p
                            className="text-sm text-gray-300"
                            id={`speaker-${speaker.id}-twitter`}
                          >
                            {speaker.twitterHandle}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                  return (
                    <GridCell key={speaker.id} type="speaker">
                      {speaker.link ? (
                        <GridCellLink
                          to={speaker.link}
                          labelledBy={`speaker-${speaker.id}-name`}
                          describedBy={
                            speaker.twitterHandle
                              ? `speaker-${speaker.id}-twitter`
                              : undefined
                          }
                        >
                          {child}
                        </GridCellLink>
                      ) : (
                        child
                      )}
                    </GridCell>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="flex flex-col gap-20 lg:gap-36">
            <h2 className="sr-only">Sponsors</h2>
            {premierSponsor ? (
              <div>
                <h3 className="font-display font-extrabold text-4xl md:text-7xl mb-4 md:mb-8 text-blue-brand">
                  Premier Sponsor
                </h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <GridCell type="sponsor">
                    <GridCellLink to={premierSponsor.link}>
                      <div className="flex w-full p-12 md:p-14 lg:p-16 2xl:p-20">
                        <span className="sr-only">{premierSponsor.name}</span>
                        <img
                          src={premierSponsor.imgSrc}
                          alt=""
                          className="block w-full h-auto object-center object-contain"
                        />
                      </div>
                    </GridCellLink>
                  </GridCell>
                </div>
              </div>
            ) : null}

            <div>
              <h3 className="font-display font-extrabold text-4xl md:text-7xl mb-4 md:mb-8 text-yellow-brand">
                Gold Sponsors
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {sponsors.gold?.map((sponsor) => {
                  return (
                    <GridCell key={sponsor.name} type="sponsor">
                      <GridCellLink to={sponsor.link}>
                        <div className="flex w-full p-12 md:p-14 lg:p-16 2xl:p-20">
                          <span className="sr-only">{sponsor.name}</span>
                          <img
                            src={sponsor.imgSrc}
                            alt=""
                            className="block w-full h-auto object-center object-contain"
                          />
                        </div>
                      </GridCellLink>
                    </GridCell>
                  );
                })}
                <GridCell bgColor="blue" type="sponsor">
                  <GridCellLink to="sponsor" hoverColor="blue">
                    <div className="h-full w-full flex items-center justify-center p-8 2xl:p-10 font-bold text-xl xl:text-3xl text-left">
                      <div>
                        Your Company Here?{" "}
                        <span className="underline whitespace-nowrap">
                          Let's Talk.
                        </span>
                      </div>
                    </div>
                  </GridCellLink>
                </GridCell>
              </div>
            </div>

            {(sponsors.silver?.length || 0) > 0 ? (
              <div>
                <h3 className="font-display font-extrabold text-3xl md:text-5xl mb-4 md:mb-8 text-pink-brand">
                  Silver Sponsors
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {sponsors.silver!.map((sponsor) => {
                    return (
                      <GridCell key={sponsor.name} type="sponsor">
                        <GridCellLink to={sponsor.link}>
                          <div className="flex w-full p-12 md:p-14 lg:p-8 xl:p-12 2xl:p-20">
                            <span className="sr-only">{sponsor.name}</span>
                            <img
                              src={sponsor.imgSrc}
                              alt=""
                              className="block w-full h-auto object-center object-contain"
                            />
                          </div>
                        </GridCellLink>
                      </GridCell>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {(sponsors.community?.length || 0) > 0 ? (
              <div>
                <h3 className="font-display font-extrabold text-2xl md:text-4xl mb-4 md:mb-8">
                  Community Sponsors
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-8">
                  {sponsors.community!.map((sponsor) => {
                    return (
                      <GridCell key={sponsor.name} type="sponsor">
                        <GridCellLink to={sponsor.link}>
                          <div className="flex w-full p-12 sm:p-8 xl:p-12">
                            <span className="sr-only">{sponsor.name}</span>
                            <img
                              src={sponsor.imgSrc}
                              alt=""
                              className="block w-full h-auto object-center object-contain"
                            />
                          </div>
                        </GridCellLink>
                      </GridCell>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </section>
  );
}

function GridCell({
  children,
  bgColor = "default",
  type,
}: React.PropsWithChildren<{
  bgColor?: "default" | "blue";
  type: "sponsor" | "speaker";
}>) {
  return (
    <div
      className={cx("rounded-lg text-white outline-2", {
        "bg-gray-900": bgColor === "default",
        "bg-blue-brand": bgColor === "blue",
        "sm:aspect-1": type === "sponsor",
      })}
    >
      {children}
    </div>
  );
}

function GridCellLink({
  to,
  children,
  hoverColor = "default",
  labelledBy,
  describedBy,
}: {
  to: string;
  children: React.ReactNode;
  hoverColor?: "default" | "blue";
  labelledBy?: string;
  describedBy?: string;
}) {
  return (
    <Link
      to={to}
      className={cx(
        "group/link w-full h-full flex justify-center rounded-[inherit] outline-offset-2 outline-blue-brand focus-visible:outline focus-visible:outline-2 border-[1px] border-transparent transition-colors",
        {
          "hover:border-blue-300": hoverColor === "blue",
          "hover:border-gray-400": hoverColor === "default",
        }
      )}
      aria-labelledby={labelledBy || undefined}
      aria-describedby={describedBy || undefined}
    >
      {children}
    </Link>
  );
}

function LogoRemixHero(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      width="496"
      height="320"
      viewBox="0 0 496 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g filter="url(#filter_remix_i)">
        <path
          d="M346.978 73.5177V147.172H372.533V73.5177H346.978ZM346.82 66.5816H372.691V43.1311H346.82V66.5816Z"
          fill="#FFF7FF"
        />
      </g>
      <g filter="url(#filter_remix_r)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M127.341 122.262C128.265 134.287 128.265 139.924 128.265 146.077H100.803C100.803 144.737 100.827 143.511 100.851 142.268C100.925 138.403 101.003 134.373 100.384 126.234C99.5676 114.319 94.5032 111.671 85.191 111.671H76.9408H42V89.992H86.498C98.2607 89.992 104.142 86.3667 104.142 76.7683C104.142 68.3284 98.2607 63.2137 86.498 63.2137H42V42H91.3991C118.028 42 131.261 54.7427 131.261 75.0979C131.261 90.323 121.949 100.252 109.37 101.907C119.989 104.059 126.197 110.182 127.341 122.262Z"
          fill="#E8F2FF"
        />
        <path
          d="M42 146.078V129.917H71.0365C75.8866 129.917 76.9397 133.561 76.9397 135.735V146.078H42Z"
          fill="#E8F2FF"
        />
      </g>
      <g filter="url(#filter_remix_x)">
        <path
          d="M459.266 73.6646H432.022L419.623 91.1349L407.551 73.6646H378.349L404.614 109.759L376.065 147.172H403.309L417.829 127.229L432.348 147.172H461.55L432.837 108.605L459.266 73.6646Z"
          fill="#FFF0F1"
        />
      </g>
      <g filter="url(#filter_remix_m)">
        <path
          d="M287.05 85.9615C283.949 77.359 277.255 71.4033 264.358 71.4033C253.42 71.4033 245.584 76.3664 241.666 84.4726V73.3885H215.219V147.172H241.666V110.942C241.666 99.858 244.768 92.5789 253.42 92.5789C261.42 92.5789 263.379 97.8728 263.379 107.964V147.172H289.826V110.942C289.826 99.858 292.764 92.5789 301.58 92.5789C309.579 92.5789 311.375 97.8728 311.375 107.964V147.172H337.822V100.851C337.822 85.4652 331.945 71.4033 311.865 71.4033C299.621 71.4033 290.968 77.6898 287.05 85.9615Z"
          fill="#FFFAEA"
        />
      </g>
      <g filter="url(#filter_remix_e)">
        <path
          d="M187.997 118.062C185.561 123.789 181.014 126.243 173.869 126.243C165.912 126.243 159.416 121.989 158.766 112.99H209.595V105.627C209.595 85.8298 196.766 69.1409 172.57 69.1409C149.997 69.1409 133.109 85.6661 133.109 108.736C133.109 131.97 149.673 146.041 172.894 146.041C192.057 146.041 205.373 136.715 209.108 120.026L187.997 118.062ZM159.091 100.228C160.066 93.3561 163.801 88.1204 172.245 88.1204C180.04 88.1204 184.262 93.6834 184.587 100.228H159.091Z"
          fill="#F1FFF0"
        />
      </g>
      <mask
        id="mask0_245_1109"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="289"
        y="130"
        width="156"
        height="157"
      >
        <rect
          x="287.175"
          y="146.997"
          width="155"
          height="102"
          fill="url(#paint0_linear_245_1109)"
        />
      </mask>
      <g mask="url(#mask0_245_1109)">
        <path
          className="remix-logo-num-2"
          d="M401.084 156.53V151.329L415 129.362C416.035 127.72 416.981 126.191 417.837 124.777C418.737 123.363 419.458 121.88 419.998 120.329C420.584 118.732 420.877 116.907 420.877 114.854C420.877 112.299 420.471 110.292 419.661 108.832C418.85 107.372 417.432 106.642 415.405 106.642C413.694 106.642 412.365 107.121 411.42 108.079C410.474 109.037 409.821 110.292 409.461 111.843C409.1 113.394 408.92 115.06 408.92 116.839V118.687H401.692V116.77C401.692 113.44 402.12 110.589 402.976 108.216C403.876 105.798 405.295 103.928 407.231 102.605C409.213 101.282 411.825 100.62 415.067 100.62C419.481 100.62 422.768 101.898 424.93 104.452C427.091 106.962 428.172 110.452 428.172 114.923C428.172 117.295 427.879 119.371 427.294 121.15C426.753 122.929 426.033 124.595 425.132 126.146C424.232 127.697 423.241 129.294 422.16 130.936L409.596 150.371H426.889V156.53H401.084Z"
          fill="white"
        />
        <path
          d="M368.826 219.442V214.241L382.742 192.273C383.778 190.631 384.723 189.103 385.579 187.688C386.48 186.274 387.2 184.791 387.74 183.24C388.326 181.643 388.619 179.818 388.619 177.765C388.619 175.211 388.213 173.203 387.403 171.743C386.592 170.283 385.174 169.553 383.147 169.553C381.436 169.553 380.107 170.032 379.162 170.991C378.216 171.949 377.563 173.203 377.203 174.754C376.842 176.306 376.662 177.971 376.662 179.75V181.598H369.434V179.682C369.434 176.351 369.862 173.5 370.718 171.127C371.618 168.709 373.037 166.839 374.973 165.516C376.955 164.193 379.567 163.531 382.809 163.531C387.223 163.531 390.51 164.809 392.672 167.364C394.833 169.873 395.914 173.363 395.914 177.834C395.914 180.206 395.621 182.282 395.036 184.061C394.496 185.841 393.775 187.506 392.874 189.057C391.974 190.608 390.983 192.205 389.902 193.847L377.338 213.282H394.631V219.442H368.826Z"
          fill="white"
        />
        <path
          d="M348.656 220.057C345.549 220.057 342.982 219.35 340.955 217.936C338.974 216.522 337.488 214.583 336.497 212.119C335.551 209.655 335.078 206.85 335.078 203.702V179.818C335.078 176.579 335.551 173.751 336.497 171.333C337.443 168.869 338.906 166.953 340.888 165.584C342.914 164.216 345.504 163.531 348.656 163.531C351.808 163.531 354.375 164.216 356.357 165.584C358.338 166.953 359.802 168.869 360.747 171.333C361.693 173.751 362.166 176.579 362.166 179.818V203.702C362.166 206.895 361.671 209.724 360.68 212.188C359.734 214.651 358.27 216.59 356.289 218.004C354.308 219.373 351.763 220.057 348.656 220.057ZM348.656 214.035C350.367 214.035 351.651 213.533 352.506 212.53C353.407 211.526 354.015 210.249 354.33 208.697C354.69 207.101 354.87 205.458 354.87 203.77V179.75C354.87 177.971 354.713 176.306 354.398 174.754C354.082 173.158 353.474 171.88 352.574 170.922C351.718 169.964 350.412 169.485 348.656 169.485C346.9 169.485 345.571 169.964 344.67 170.922C343.77 171.88 343.162 173.158 342.847 174.754C342.531 176.306 342.374 177.971 342.374 179.75V203.77C342.374 205.458 342.531 207.101 342.847 208.697C343.207 210.249 343.837 211.526 344.738 212.53C345.684 213.533 346.99 214.035 348.656 214.035Z"
          fill="white"
        />
        <path
          d="M301.672 219.442V214.241L315.587 192.273C316.623 190.631 317.569 189.103 318.424 187.688C319.325 186.274 320.046 184.791 320.586 183.24C321.171 181.643 321.464 179.818 321.464 177.765C321.464 175.211 321.059 173.203 320.248 171.743C319.438 170.283 318.019 169.553 315.993 169.553C314.281 169.553 312.953 170.032 312.007 170.991C311.061 171.949 310.408 173.203 310.048 174.754C309.688 176.306 309.508 177.971 309.508 179.75V181.598H302.28V179.682C302.28 176.351 302.708 173.5 303.563 171.127C304.464 168.709 305.883 166.839 307.819 165.516C309.801 164.193 312.412 163.531 315.655 163.531C320.068 163.531 323.356 164.809 325.517 167.364C327.679 169.873 328.76 173.363 328.76 177.834C328.76 180.206 328.467 182.282 327.881 184.061C327.341 185.841 326.621 187.506 325.72 189.057C324.819 190.608 323.828 192.205 322.748 193.847L310.183 213.282H327.476V219.442H301.672Z"
          fill="white"
        />
        <path
          className="remix-logo-num-3"
          d="M413.907 220.114C410.856 220.114 408.313 219.543 406.278 218.401C404.244 217.26 402.718 215.616 401.701 213.469C400.684 211.323 400.175 208.788 400.175 205.865V204.016H407.527C407.527 204.198 407.527 204.404 407.527 204.632C407.527 204.815 407.527 205.02 407.527 205.249C407.573 206.893 407.758 208.377 408.082 209.701C408.451 211.026 409.076 212.076 409.954 212.853C410.879 213.629 412.196 214.017 413.907 214.017C415.71 214.017 417.074 213.606 417.999 212.784C418.923 211.916 419.548 210.706 419.871 209.153C420.195 207.601 420.357 205.82 420.357 203.81C420.357 200.887 419.802 198.513 418.692 196.686C417.629 194.813 415.733 193.786 413.005 193.603C412.867 193.557 412.682 193.535 412.451 193.535C412.266 193.535 412.104 193.535 411.965 193.535V186.205C412.104 186.205 412.266 186.205 412.451 186.205C412.636 186.205 412.797 186.205 412.936 186.205C415.571 186.113 417.467 185.428 418.623 184.15C419.779 182.871 420.357 180.747 420.357 177.779C420.357 175.267 419.918 173.258 419.039 171.75C418.207 170.243 416.519 169.49 413.976 169.49C411.433 169.49 409.746 170.335 408.914 172.024C408.082 173.669 407.619 175.792 407.527 178.395C407.527 178.578 407.527 178.784 407.527 179.012C407.527 179.195 407.527 179.377 407.527 179.56H400.175V177.71C400.175 174.742 400.684 172.207 401.701 170.106C402.718 168.006 404.244 166.384 406.278 165.243C408.359 164.101 410.925 163.53 413.976 163.53C417.074 163.53 419.64 164.101 421.674 165.243C423.709 166.384 425.234 168.028 426.252 170.175C427.269 172.276 427.777 174.81 427.777 177.779C427.777 181.113 427.038 183.784 425.558 185.794C424.125 187.803 422.183 189.173 419.733 189.904C421.443 190.406 422.877 191.274 424.032 192.507C425.234 193.74 426.159 195.316 426.806 197.234C427.454 199.106 427.777 201.298 427.777 203.81C427.777 207.098 427.315 209.976 426.39 212.442C425.466 214.862 423.986 216.757 421.952 218.127C419.918 219.452 417.236 220.114 413.907 220.114Z"
          fill="#D83BD2"
        />
      </g>
      <g filter="url(#filter_conf)">
        <path
          d="M75.1244 222.101C74.9668 224.303 75.0456 226.661 75.3607 229.177C75.6758 231.692 75.991 234.287 76.3061 236.96C76.4636 238.217 76.7788 239.868 77.2515 241.912C77.7242 243.799 78.2756 245.764 78.9059 247.808C79.6937 249.852 80.4815 251.739 81.2694 253.469C82.2147 255.198 83.1601 256.535 84.1055 257.478C85.2085 258.579 86.3114 259.129 87.4143 259.129C87.887 259.129 88.281 259.129 88.5961 259.129C89.0688 258.972 89.5415 258.815 90.0142 258.657C93.323 256.771 96.6318 253.94 99.9407 250.167C103.25 246.393 106.007 243.013 108.213 240.026C114.2 232.479 119.873 224.853 125.23 217.149C130.587 209.444 135.944 201.583 141.301 193.564C142.404 191.992 143.507 190.419 144.61 188.847C145.713 187.275 146.816 185.703 147.919 184.13C148.392 183.659 148.864 183.423 149.337 183.423C149.652 183.423 149.888 183.501 150.046 183.659C150.676 183.973 150.991 184.602 150.991 185.545C150.991 186.174 150.676 186.96 150.046 187.904C143.271 197.967 136.496 207.951 129.72 217.856C123.103 227.762 115.933 237.353 108.213 246.629C107.267 247.887 106.086 249.381 104.668 251.11C103.25 252.84 101.595 254.569 99.7043 256.299C97.9711 257.871 96.1592 259.208 94.2684 260.308C92.3776 261.409 90.5656 261.959 88.8324 261.959C85.8387 261.959 83.3177 260.937 81.2694 258.893C79.221 256.849 77.5666 254.412 76.3061 251.582C75.0456 248.752 74.1002 245.764 73.4699 242.62C72.8397 239.475 72.367 236.724 72.0519 234.365C70.9489 225.56 70.8701 216.362 71.8155 206.771C72.7609 198.438 74.2578 189.869 76.3061 181.064C78.3544 172.102 81.033 163.454 84.3418 155.121C87.8083 146.631 91.9837 138.612 96.8682 131.065C101.91 123.518 107.819 117.072 114.594 111.726C119.164 108.109 124.284 105.594 129.957 104.179H130.666C133.029 104.179 134.841 105.043 136.102 106.773C137.52 108.503 137.756 110.468 136.811 112.669C135.865 115.028 134.605 117.072 133.029 118.801C131.454 120.531 129.563 122.024 127.357 123.282C127.199 123.439 126.963 123.518 126.648 123.518C126.018 123.518 125.545 123.439 125.23 123.282C124.915 123.125 124.678 122.889 124.521 122.575C124.363 122.103 124.442 121.71 124.757 121.395C125.387 120.766 126.018 120.216 126.648 119.745C127.278 119.273 127.908 118.723 128.539 118.094C129.799 116.993 130.902 115.814 131.847 114.556C132.95 113.298 133.738 111.804 134.211 110.075C134.526 108.817 134.053 108.188 132.793 108.188C129.326 108.188 125.781 109.367 122.157 111.726C118.533 113.927 115.067 116.679 111.758 119.98C108.607 123.282 105.692 126.741 103.013 130.358C100.335 133.817 98.2863 136.883 96.8682 139.556C89.7778 151.348 84.3418 164.634 80.5603 179.413C76.9363 194.036 75.1244 208.265 75.1244 222.101Z"
          fill="white"
        />
        <path
          d="M206.162 197.102C205.374 197.731 204.744 198.36 204.271 198.989C203.798 199.617 203.404 200.325 203.089 201.111C201.356 205.042 199.623 208.973 197.89 212.903C196.156 216.677 194.423 220.529 192.69 224.46C191.902 226.661 191.035 228.784 190.09 230.828C189.145 232.872 188.042 234.916 186.781 236.96C185.836 238.217 184.575 238.846 183 238.846C181.424 238.846 180.085 238.06 178.982 236.488C178.194 235.073 177.8 233.422 177.8 231.535C177.485 228.862 177.485 226.347 177.8 223.988C178.273 221.472 178.824 218.878 179.455 216.205C183.709 197.023 191.351 179.178 202.38 162.668C202.853 161.882 203.325 161.096 203.798 160.31C204.271 159.367 204.665 158.502 204.98 157.716C205.768 156.143 205.374 155.357 203.798 155.357H203.325C201.12 155.514 198.52 156.222 195.526 157.48C192.532 158.738 189.539 160.231 186.545 161.961C183.709 163.533 180.873 165.184 178.036 166.914C175.358 168.643 173.152 170.137 171.419 171.395C171.104 171.709 170.867 171.945 170.71 172.102C170.71 172.259 170.631 172.417 170.473 172.574C170.631 173.36 170.946 173.91 171.419 174.225C171.891 174.539 172.285 174.854 172.6 175.168C176.067 178.156 177.17 182.008 175.909 186.725C175.437 188.611 174.412 191.284 172.837 194.743C171.261 198.045 169.37 201.347 167.165 204.649C164.959 207.793 162.595 210.545 160.074 212.903C157.553 215.262 155.19 216.441 152.984 216.441C151.566 216.441 150.226 216.048 148.966 215.262C147.863 214.318 147.154 213.061 146.839 211.488C146.524 209.602 146.524 207.793 146.839 206.064C147.154 204.806 147.627 203.155 148.257 201.111C148.887 198.91 149.754 196.787 150.857 194.743C151.96 192.542 153.22 190.734 154.638 189.319C156.056 187.747 157.553 186.96 159.129 186.96C160.232 186.96 161.02 187.668 161.492 189.083C161.65 189.397 161.65 189.791 161.492 190.262C161.335 190.734 161.098 190.97 160.783 190.97H159.838C158.577 190.97 157.632 191.363 157.002 192.149C156.371 192.935 155.741 193.721 155.111 194.507C152.747 198.595 151.172 202.919 150.384 207.479C150.226 208.737 150.148 209.602 150.148 210.073C150.305 210.545 150.778 211.646 151.566 213.375C153.614 212.746 155.662 211.41 157.711 209.366C159.917 207.164 161.886 204.727 163.619 202.055C165.51 199.382 167.165 196.709 168.583 194.036C170.001 191.206 171.025 188.926 171.655 187.196C172.443 184.838 172.837 182.715 172.837 180.828C172.522 177.369 170.946 175.64 168.11 175.64C166.849 175.64 165.589 176.033 164.328 176.819C163.068 177.605 162.044 178.391 161.256 179.178C157.789 181.693 154.323 184.445 150.857 187.432C150.069 188.061 149.36 188.375 148.73 188.375C148.257 188.375 147.627 188.14 146.839 187.668C145.421 186.882 145.106 185.938 145.893 184.838C146.366 184.209 146.76 183.659 147.075 183.187C147.548 182.558 148.099 182.008 148.73 181.536C152.038 178.234 155.82 175.64 160.074 173.753C161.335 173.439 162.438 172.967 163.383 172.338C164.328 171.709 165.353 171.002 166.455 170.215C168.504 168.8 171.025 167.071 174.019 165.027C177.17 162.826 180.479 160.782 183.945 158.895C187.412 156.851 190.799 155.2 194.108 153.942C197.574 152.527 200.568 151.819 203.089 151.819C204.822 151.662 206.24 152.213 207.343 153.47C208.446 154.571 208.84 155.986 208.525 157.716C208.368 158.816 208.052 159.838 207.58 160.782C207.265 161.725 206.871 162.59 206.398 163.376C205.295 165.263 204.192 167.149 203.089 169.036C202.144 170.766 201.12 172.574 200.017 174.461C195.447 182.008 191.745 189.869 188.908 198.045C186.072 206.064 183.866 214.397 182.291 223.045C181.503 226.818 181.345 230.356 181.818 233.658L182.527 234.365C183.157 234.365 183.472 234.208 183.472 233.894C184.103 233.107 184.654 232.243 185.127 231.299C185.6 230.356 185.993 229.491 186.309 228.705C188.199 224.617 190.011 220.608 191.745 216.677C193.635 212.589 195.447 208.501 197.18 204.413C198.126 202.369 199.071 200.404 200.017 198.517C201.12 196.473 202.223 194.507 203.325 192.621C203.798 191.835 204.271 191.127 204.744 190.498C205.216 189.869 205.768 189.24 206.398 188.611C207.028 187.825 207.737 187.432 208.525 187.432C209.313 187.432 210.022 187.982 210.652 189.083C211.282 190.026 211.44 191.284 211.125 192.857C210.967 194.429 210.81 196.001 210.652 197.573C210.495 199.146 210.337 200.718 210.18 202.29C210.022 203.705 210.022 205.199 210.18 206.771C210.18 207.558 210.495 208.029 211.125 208.186C211.755 208.344 212.385 208.422 213.016 208.422C214.276 208.108 215.537 207.558 216.797 206.771C218.215 205.828 219.633 204.806 221.051 203.705C222.47 202.448 223.73 201.268 224.833 200.168C226.093 198.91 227.118 197.888 227.905 197.102C229.639 195.372 231.293 193.564 232.869 191.677C234.444 189.791 236.099 187.904 237.832 186.017C238.462 185.074 239.25 184.287 240.195 183.659C240.353 183.501 240.589 183.501 240.905 183.659C241.22 183.659 241.456 183.737 241.614 183.894C241.929 184.209 242.165 184.523 242.323 184.838C242.638 185.152 242.716 185.467 242.559 185.781L241.85 187.196C240.432 188.926 238.699 190.97 236.65 193.328C234.76 195.687 232.711 198.045 230.505 200.404C228.299 202.605 226.015 204.727 223.651 206.771C221.445 208.658 219.239 210.073 217.034 211.017C215.931 211.488 214.906 211.724 213.961 211.724C211.44 211.724 209.628 210.938 208.525 209.366C207.422 207.793 206.713 205.907 206.398 203.705C206.398 202.605 206.398 201.583 206.398 200.639C206.556 199.539 206.477 198.36 206.162 197.102Z"
          fill="white"
        />
        <path
          d="M286.211 113.377C286.053 116.207 285.502 118.723 284.557 120.924C282.823 125.641 280.617 130.515 277.939 135.546C275.26 140.578 272.345 145.609 269.194 150.64C266.2 155.514 263.049 160.31 259.74 165.027C256.431 169.586 253.28 173.832 250.286 177.762C248.553 179.964 247.135 182.244 246.032 184.602C244.929 186.96 244.22 189.476 243.905 192.149C243.59 195.294 243.196 198.438 242.723 201.583C242.251 204.57 241.778 207.636 241.305 210.781C241.148 211.41 241.069 212.039 241.069 212.668C241.226 213.296 241.305 213.925 241.305 214.554C241.305 214.869 241.463 215.105 241.778 215.262C242.093 215.419 242.329 215.419 242.487 215.262C243.117 214.79 243.669 214.318 244.141 213.847C244.772 213.375 245.323 212.903 245.796 212.432C250.208 208.186 254.619 204.02 259.031 199.932C263.443 195.844 268.012 191.913 272.739 188.14C273.369 187.668 274 187.196 274.63 186.725C275.26 186.253 275.969 185.781 276.757 185.309C277.072 184.995 277.702 184.681 278.648 184.366H279.357C279.987 184.366 280.539 184.681 281.011 185.309C281.326 186.096 281.09 186.882 280.302 187.668C273.685 192.699 267.382 197.967 261.395 203.47C255.407 208.815 249.42 214.397 243.432 220.215C241.226 222.416 240.202 224.853 240.36 227.526C240.517 229.727 240.517 231.85 240.36 233.894C240.36 235.78 240.439 237.746 240.596 239.79C240.596 243.721 241.305 247.494 242.723 251.11C243.984 254.727 244.85 258.422 245.323 262.195C245.796 265.969 246.19 269.742 246.505 273.516C246.505 274.773 246.426 275.717 246.268 276.346C246.268 277.446 245.481 277.997 243.905 277.997C243.117 277.997 242.487 277.761 242.014 277.289C240.439 272.729 239.336 268.17 238.705 263.61C238.075 258.893 237.524 254.176 237.051 249.459C237.051 246.315 236.027 243.642 233.978 241.441C231.93 239.239 229.33 238.139 226.179 238.139C225.549 237.982 224.919 237.903 224.288 237.903C223.658 237.746 223.185 237.353 222.87 236.724C222.555 235.938 222.634 235.309 223.107 234.837C223.422 234.365 223.816 233.894 224.288 233.422C225.864 231.85 227.361 230.356 228.779 228.941C230.197 227.369 231.773 225.875 233.506 224.46C235.397 222.73 236.499 220.529 236.815 217.856C236.972 214.083 237.209 210.309 237.524 206.536C237.996 202.762 238.627 198.989 239.414 195.215C239.73 193.171 239.178 191.756 237.76 190.97C236.972 190.341 236.893 189.712 237.524 189.083C239.414 187.353 240.675 185.388 241.305 183.187C242.093 180.828 242.802 178.47 243.432 176.112C244.693 171.08 246.426 165.498 248.632 159.367C250.838 153.077 253.359 146.867 256.195 140.735C259.189 134.603 262.419 128.785 265.885 123.282C269.509 117.779 273.369 113.298 277.466 109.839C277.781 109.525 278.412 109.131 279.357 108.66C280.46 108.031 281.326 107.716 281.957 107.716C283.375 107.716 284.478 108.503 285.266 110.075C285.581 110.704 285.738 111.333 285.738 111.962C285.896 112.591 286.053 113.062 286.211 113.377ZM282.902 114.084C282.745 113.77 282.666 113.534 282.666 113.377C282.666 113.062 282.587 112.748 282.429 112.433C282.272 112.276 282.035 112.197 281.72 112.197C281.405 112.197 280.933 112.355 280.302 112.669C279.672 113.298 279.042 113.927 278.412 114.556C277.781 115.028 277.072 115.657 276.284 116.443C270.139 123.361 264.94 131.38 260.686 140.499C256.589 149.461 253.122 158.187 250.286 166.678C249.971 167.621 249.656 168.879 249.341 170.451L250.05 171.159C250.208 171.002 250.365 170.923 250.523 170.923C250.838 170.608 251.074 170.294 251.232 169.98C251.547 169.508 251.862 169.115 252.177 168.8C257.534 161.096 262.813 153.235 268.012 145.216C273.212 137.04 277.545 128.549 281.011 119.745C281.326 118.801 281.642 117.858 281.957 116.914C282.272 115.971 282.587 115.028 282.902 114.084ZM228.542 235.545C229.645 236.016 230.67 236.567 231.615 237.195C232.56 237.667 233.506 238.139 234.451 238.611C234.766 238.768 234.924 238.846 234.924 238.846C235.712 238.846 236.106 238.296 236.106 237.195V230.12C236.106 229.334 235.79 228.941 235.16 228.941C234.687 228.941 234.372 229.019 234.215 229.177C233.112 230.12 232.088 231.063 231.142 232.007C230.039 232.95 229.173 234.129 228.542 235.545Z"
          fill="white"
        />
      </g>
      <defs>
        <animate
          xlinkHref="#filter_remix_r_blur"
          attributeType="XML"
          attributeName="stdDeviation"
          from="0"
          to="14"
          dur="3s"
          repeatCount="1"
          fill="freeze"
        />
        <animate
          xlinkHref="#filter_remix_e_blur"
          attributeType="XML"
          attributeName="stdDeviation"
          from="0"
          to="14"
          dur="3s"
          repeatCount="1"
          fill="freeze"
        />
        <animate
          xlinkHref="#filter_remix_m_blur"
          attributeType="XML"
          attributeName="stdDeviation"
          from="0"
          to="14"
          dur="3s"
          repeatCount="1"
          fill="freeze"
        />
        <animate
          xlinkHref="#filter_remix_i_blur"
          attributeType="XML"
          attributeName="stdDeviation"
          from="0"
          to="14"
          dur="3s"
          repeatCount="1"
          fill="freeze"
        />
        <animate
          xlinkHref="#filter_remix_x_blur"
          attributeType="XML"
          attributeName="stdDeviation"
          from="0"
          to="14"
          dur="3s"
          repeatCount="1"
          fill="freeze"
        />
        <filter
          id="filter_remix_i"
          x="318.82"
          y="15.1311"
          width="81.8704"
          height="160.041"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
          opacity="1"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur id="filter_remix_i_blur" stdDeviation="0" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.847059 0 0 0 0 0.231373 0 0 0 0 0.823529 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_245_1109"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="14" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.847059 0 0 0 0 0.231373 0 0 0 0 0.823529 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_245_1109"
            result="effect2_dropShadow_245_1109"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_245_1109"
            result="shape"
          />
        </filter>
        <filter
          id="filter_remix_r"
          x="0"
          y="0"
          width="173.261"
          height="188.078"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
          opacity="0"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="21" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.223529 0 0 0 0 0.572549 0 0 0 0 1 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_245_1109"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur id="filter_remix_r_blur" stdDeviation="0" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.223529 0 0 0 0 0.572549 0 0 0 0 1 0 0 0 0.9 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_245_1109"
            result="effect2_dropShadow_245_1109"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_245_1109"
            result="shape"
          />
        </filter>
        <filter
          id="filter_remix_x"
          x="344.065"
          y="41.6646"
          width="149.485"
          height="137.507"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur id="filter_remix_x_blur" stdDeviation="0" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.960784 0 0 0 0 0.2 0 0 0 0 0.258824 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_245_1109"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="16" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.960784 0 0 0 0 0.2 0 0 0 0 0.258824 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_245_1109"
            result="effect2_dropShadow_245_1109"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_245_1109"
            result="shape"
          />
        </filter>
        <filter
          id="filter_remix_m"
          x="187.219"
          y="43.4033"
          width="178.603"
          height="131.769"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur id="filter_remix_m_blur" stdDeviation="0" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.996078 0 0 0 0 0.8 0 0 0 0 0.105882 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_245_1109"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="14" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.996078 0 0 0 0 0.8 0 0 0 0 0.105882 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_245_1109"
            result="effect2_dropShadow_245_1109"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_245_1109"
            result="shape"
          />
        </filter>
        <filter
          id="filter_remix_e"
          x="105.109"
          y="41.1409"
          width="132.486"
          height="132.9"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur id="filter_remix_e_blur" stdDeviation="0" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.419608 0 0 0 0 0.85098 0 0 0 0 0.407843 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_245_1109"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="14" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.419608 0 0 0 0 0.85098 0 0 0 0 0.407843 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_245_1109"
            result="effect2_dropShadow_245_1109"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_245_1109"
            result="shape"
          />
        </filter>
        <filter
          id="filter_conf"
          x="29.161"
          y="62.1787"
          width="299.05"
          height="257.818"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="21" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.223529 0 0 0 0 0.572549 0 0 0 0 1 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_245_1109"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="14" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.223529 0 0 0 0 0.572549 0 0 0 0 1 0 0 0 0.9 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_245_1109"
            result="effect2_dropShadow_245_1109"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_245_1109"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_245_1109"
          x1="364.675"
          y1="146.997"
          x2="364.675"
          y2="248.997"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopOpacity="0" />
          <stop offset="0.166667" />
          <stop offset="0.776042" />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function getSpeaker(speaker: SessionizeSpeakerData): Speaker {
  let id = String(speaker.id);
  let { nameFirst, nameLast, nameFull } = getSpeakerNames(speaker);
  let link = getSpeakerLink(speaker);
  let tagLine = getSpeakerTagLine(speaker);
  let imgUrl = speaker.profilePicture ? String(speaker.profilePicture) : null;
  let twitterHandle = link?.includes("twitter.com")
    ? "@" + getTwitterHandle(link)
    : null;
  let validatedSpeaker: Speaker = {
    id,
    tagLine,
    link,
    nameFirst,
    nameLast,
    nameFull,
    imgUrl,
    twitterHandle,
  };
  return validatedSpeaker;
}

function randomSort() {
  return Math.random() - 0.5;
}

interface SessionizeSpeakerData {
  id: number | string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  tagLine: string | null;
  links: Array<{
    title: string;
    linkType: "Twitter" | "LinkedIn" | "Blog" | "Company_Website";
    url: string;
  }> | null;
  questionAnswers: Array<{
    question: string;
    answer: string | null;
  }> | null;
  profilePicture: string | null;
}

function validateSessionizeSpeakerData(
  data: unknown
): asserts data is SessionizeSpeakerData {
  if (
    data == null ||
    typeof data !== "object" ||
    !("id" in data) ||
    !("firstName" in data) ||
    !("lastName" in data) ||
    !("fullName" in data) ||
    !("tagLine" in data) ||
    !("links" in data) ||
    !("questionAnswers" in data) ||
    !("profilePicture" in data) ||
    (data.links != null && !Array.isArray(data.links)) ||
    (data.questionAnswers != null && !Array.isArray(data.questionAnswers))
  ) {
    throw new Error("Invalid speaker data");
  }
}

function getSpeakerNames(speaker: SessionizeSpeakerData) {
  let preferredName = speaker.questionAnswers?.find(
    (qa) => qa.question === "Preferred Name"
  )?.answer;
  let nameFirst: string;
  let nameLast = speaker.lastName ? String(speaker.lastName).trim() : "";
  if (preferredName) {
    nameFirst = preferredName.includes(nameLast)
      ? preferredName.slice(0, preferredName.indexOf(nameLast)).trim()
      : preferredName.trim();
  } else {
    nameFirst = speaker.firstName ? String(speaker.firstName).trim() : "";
  }
  let nameFull = [nameFirst, nameLast].filter(Boolean).join(" ");

  return {
    nameFirst,
    nameLast,
    nameFull,
    preferredName,
  };
}

function getSpeakerLink(speaker: SessionizeSpeakerData) {
  type LinkType = "Twitter" | "LinkedIn" | "Blog" | "Company_Website";
  let links: Partial<Record<LinkType, string>> = {};
  for (let link of speaker.links || []) {
    links[link.linkType] = link.url;
  }
  return (
    links["Twitter"] ||
    links["Blog"] ||
    links["LinkedIn"] ||
    links["Company_Website"] ||
    null
  );
}

function getSpeakerTagLine(speaker: SessionizeSpeakerData) {
  if (speaker.tagLine) {
    return speaker.tagLine.trim();
  }
  let jobTitle: string | undefined | null;
  if (
    (jobTitle = speaker.questionAnswers?.find(
      (qa) => qa.question === "Current Job Title"
    )?.answer)
  ) {
    return jobTitle.trim();
  }
  return null;
}

function isNotEmpty<T>(value: T | null | undefined): value is T {
  return value != null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function getTwitterHandle(url: string) {
  let match = url.match(/twitter\.com\/([^/]+)/);
  return match?.[1] || null;
}
