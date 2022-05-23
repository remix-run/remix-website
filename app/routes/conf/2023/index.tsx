import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type {
  HeadersFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import cx from "clsx";
import {
  OutlineButtonLink,
  secondaryButtonLinkClass,
} from "~/components/buttons";
import indexStyles from "~/styles/index.css";
import { Fragment } from "react";
import type { Sponsor, Speaker } from "~/utils/conf";
import { getSpeakers, getSponsors } from "~/utils/conf.server";
import { Link } from "~/components/link";
import { CACHE_CONTROL } from "~/utils/http.server";

export function meta() {
  let url = "https://remix.run/conf";
  let title = "Remix Conf - May 24-25, 2022";
  let image = "https://remix.run/conf-images/og.1.png";
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
  speakers: Array<Omit<Speaker, "bio">>;
  sponsors: {
    premier: Sponsor | undefined;
    gold: Array<Sponsor>;
    silver: Array<Sponsor>;
    community: Array<Sponsor>;
  };
};

export const loader: LoaderFunction = async () => {
  const speakersOrdered = await getSpeakers(2023);
  const speakersShuffled = speakersOrdered
    // save a bit of data by not sending along the bio to the home page
    .map(
      ({
        // @ts-ignore
        bio,
        ...s
      }) => s
    )
    .sort(() => Math.random() - 0.5);

  const allSponsors = await getSponsors(2023);
  const sponsors = {
    premier: allSponsors.find((s) => s.level === "premier"),
    gold: allSponsors
      .filter((s) => s.level === "gold")
      .sort(() => Math.random() - 0.5),
    silver: allSponsors
      .filter((s) => s.level === "silver")
      .sort(() => Math.random() - 0.5),
    community: allSponsors
      .filter((s) => s.level === "community")
      .sort(() => Math.random() - 0.5),
  };
  return json<LoaderData>(
    { speakers: speakersShuffled, sponsors },
    { headers: { "Cache-Control": CACHE_CONTROL } }
  );
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL,
  };
};

export default function ConfIndex() {
  return (
    <div x-comp="Index">
      <Hero />
      {/* <Speakers /> */}
      {/* <Workshops /> */}
      {/* <Sponsors /> */}
    </div>
  );
}

function Hero() {
  return (
    <Fragment>
      <section
        x-comp="Hero"
        className="__hero bg-black relative pb-10 pt-40 sm:pb-16 sm:pt-48 md:pb-24 md:pt-52 lg:pb-32 lg:pt-64"
      >
        <div className="__fx-wrapper">
          <div className="__fx-lights"></div>
          <div className="__fx-twinkle"></div>
          <div className="__fx-colors"></div>
        </div>
        <div className="container relative">
          <div className="flex flex-col xl:flex-row-reverse items-center xl:justify-between">
            <HeroLogo className="flex-auto w-full h-auto max-w-md md:max-w-lg xl:max-w-xl mx-auto xl:mx-0" />
            <div className="max-w-xl mx-auto md:mx-0">
              <h1 className="font-display text-m-j md:text-d-j">
                <div className="text-white">May, 2023 </div>
                <div className="text-yellow-brand">Salt Lake City</div>
              </h1>
              <div className="h-6" />
              <p className="space-y-4 text-m-p-lg lg:text-d-p-lg text-white">
                Remix is a full stack web framework that lets you focus on the
                user interface and work back through web standards to deliver a
                fast, slick, and resilient user experience.
              </p>
              <div className="h-9" />
              <div className="flex flex-col gap-4 md:flex-row items-center">
                <a
                  href="#"
                  className={`${secondaryButtonLinkClass} w-full md:w-auto`}
                >
                  Become a Sponsor
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

function HeroLogo({ className }: { className?: string }) {
  return (
    <svg
      width={488}
      height={304}
      viewBox="0 0 488 304"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#funkyLogoClip01)">
        <g filter="url(#funkyLogoFilter03)">
          <path
            d="M338.978 65.5177V139.172H364.533V65.5177H338.978ZM338.82 58.5816H364.691V35.1311H338.82V58.5816Z"
            fill="#FFF7FF"
          />
        </g>
        <g filter="url(#funkyLogoFilter01)">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M119.341 114.262C120.265 126.287 120.265 131.924 120.265 138.077H92.8031C92.8031 136.737 92.8267 135.511 92.8506 134.268C92.925 130.403 93.0025 126.373 92.3845 118.234C91.5676 106.319 86.5032 103.671 77.191 103.671H68.9408H34V81.992H78.498C90.2607 81.992 96.142 78.3667 96.142 68.7683C96.142 60.3284 90.2607 55.2137 78.498 55.2137H34V34H83.3991C110.028 34 123.261 46.7427 123.261 67.0979C123.261 82.323 113.949 92.2523 101.37 93.9072C111.989 96.0586 118.197 102.182 119.341 114.262Z"
            fill="#E8F2FF"
          />
          <path
            d="M33.9999 138.078V121.917H63.0365C67.8865 121.917 68.9396 125.561 68.9396 127.735V138.078H33.9999Z"
            fill="#E8F2FF"
          />
        </g>
        <g filter="url(#funkyLogoFilter02)">
          <path
            d="M451.266 65.6646H424.022L411.623 83.1349L399.551 65.6646H370.349L396.614 101.759L368.065 139.172H395.309L409.829 119.229L424.348 139.172H453.55L424.837 100.605L451.266 65.6646Z"
            fill="#FFF0F1"
          />
        </g>
        <g filter="url(#funkyLogoFilter04)">
          <path
            d="M279.05 77.9615C275.949 69.359 269.255 63.4033 256.358 63.4033C245.42 63.4033 237.584 68.3664 233.666 76.4726V65.3885H207.219V139.172H233.666V102.942C233.666 91.858 236.768 84.5789 245.42 84.5789C253.42 84.5789 255.379 89.8728 255.379 99.9643V139.172H281.826V102.942C281.826 91.858 284.764 84.5789 293.58 84.5789C301.579 84.5789 303.375 89.8728 303.375 99.9643V139.172H329.822V92.8506C329.822 77.4652 323.945 63.4033 303.865 63.4033C291.621 63.4033 282.968 69.6898 279.05 77.9615Z"
            fill="#FFFAEA"
          />
        </g>
        <g filter="url(#funkyLogoFilter05)">
          <path
            d="M179.997 110.062C177.561 115.789 173.014 118.243 165.869 118.243C157.912 118.243 151.416 113.989 150.766 104.99H201.595V97.6274C201.595 77.8298 188.766 61.1409 164.57 61.1409C141.997 61.1409 125.109 77.6661 125.109 100.736C125.109 123.97 141.672 138.041 164.894 138.041C184.057 138.041 197.373 128.715 201.108 112.026L179.997 110.062ZM151.091 92.228C152.066 85.3561 155.801 80.1204 164.245 80.1204C172.04 80.1204 176.262 85.6834 176.587 92.228H151.091Z"
            fill="#F1FFF0"
          />
        </g>
        <mask
          id="funkyLogoMask01"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="279"
          y="138"
          width="156"
          height="103"
        >
          <rect
            x="279.175"
            y="138.997"
            width="155"
            height="102"
            fill="url(#funkyLogoPaint01)"
          />
        </mask>
        <g mask="url(#funkyLogoMask01)">
          <path
            d="M293.672 211.441V206.24L307.587 184.273C308.623 182.631 309.569 181.103 310.424 179.688C311.325 178.274 312.046 176.791 312.586 175.24C313.171 173.643 313.464 171.818 313.464 169.765C313.464 167.21 313.059 165.203 312.248 163.743C311.438 162.283 310.019 161.553 307.993 161.553C306.281 161.553 304.953 162.032 304.007 162.99C303.061 163.948 302.408 165.203 302.048 166.754C301.688 168.305 301.508 169.971 301.508 171.75V173.598H294.28V171.681C294.28 168.351 294.708 165.5 295.563 163.127C296.464 160.709 297.883 158.839 299.819 157.516C301.801 156.193 304.412 155.531 307.655 155.531C312.068 155.531 315.356 156.809 317.517 159.363C319.679 161.873 320.76 165.363 320.76 169.834C320.76 172.206 320.467 174.282 319.881 176.061C319.341 177.841 318.621 179.506 317.72 181.057C316.819 182.608 315.828 184.205 314.748 185.847L302.183 205.282H319.476V211.441H293.672Z"
            fill="white"
          />
          <path
            d="M340.656 212.057C337.549 212.057 334.982 211.35 332.955 209.936C330.974 208.522 329.488 206.583 328.497 204.119C327.551 201.655 327.078 198.85 327.078 195.702V171.818C327.078 168.579 327.551 165.751 328.497 163.333C329.442 160.869 330.906 158.953 332.888 157.584C334.914 156.215 337.503 155.531 340.656 155.531C343.808 155.531 346.375 156.215 348.357 157.584C350.338 158.953 351.802 160.869 352.747 163.333C353.693 165.751 354.166 168.579 354.166 171.818V195.702C354.166 198.895 353.67 201.724 352.68 204.187C351.734 206.651 350.27 208.59 348.289 210.004C346.308 211.373 343.763 212.057 340.656 212.057ZM340.656 206.035C342.367 206.035 343.651 205.533 344.506 204.53C345.407 203.526 346.015 202.249 346.33 200.697C346.69 199.101 346.87 197.458 346.87 195.77V171.75C346.87 169.971 346.713 168.305 346.398 166.754C346.082 165.157 345.474 163.88 344.574 162.922C343.718 161.964 342.412 161.485 340.656 161.485C338.9 161.485 337.571 161.964 336.67 162.922C335.77 163.88 335.162 165.157 334.847 166.754C334.531 168.305 334.374 169.971 334.374 171.75V195.77C334.374 197.458 334.531 199.101 334.847 200.697C335.207 202.249 335.837 203.526 336.738 204.53C337.684 205.533 338.99 206.035 340.656 206.035Z"
            fill="white"
          />
          <path
            d="M360.826 211.441V206.24L374.742 184.273C375.778 182.631 376.723 181.103 377.579 179.688C378.48 178.274 379.2 176.791 379.74 175.24C380.326 173.643 380.619 171.818 380.619 169.765C380.619 167.21 380.213 165.203 379.403 163.743C378.592 162.283 377.174 161.553 375.147 161.553C373.436 161.553 372.107 162.032 371.162 162.99C370.216 163.948 369.563 165.203 369.203 166.754C368.842 168.305 368.662 169.971 368.662 171.75V173.598H361.434V171.681C361.434 168.351 361.862 165.5 362.718 163.127C363.619 160.709 365.037 158.839 366.973 157.516C368.955 156.193 371.567 155.531 374.809 155.531C379.223 155.531 382.51 156.809 384.672 159.363C386.833 161.873 387.914 165.363 387.914 169.834C387.914 172.206 387.621 174.282 387.036 176.061C386.496 177.841 385.775 179.506 384.874 181.057C383.974 182.608 382.983 184.205 381.902 185.847L369.338 205.282H386.631V211.441H360.826Z"
            fill="white"
          />
          <path
            d="M393.084 169.997V164.796L407 142.829C408.035 141.186 408.981 139.658 409.837 138.244C410.737 136.829 411.458 135.346 411.998 133.795C412.584 132.199 412.877 130.374 412.877 128.321C412.877 125.766 412.471 123.758 411.661 122.298C410.85 120.839 409.431 120.109 407.405 120.109C405.694 120.109 404.365 120.588 403.419 121.546C402.474 122.504 401.821 123.758 401.461 125.31C401.1 126.861 400.92 128.526 400.92 130.305V132.153H393.692V130.237C393.692 126.906 394.12 124.055 394.976 121.683C395.876 119.265 397.295 117.394 399.231 116.071C401.213 114.748 403.825 114.086 407.067 114.086C411.48 114.086 414.768 115.364 416.93 117.919C419.091 120.428 420.172 123.918 420.172 128.389C420.172 130.761 419.879 132.837 419.294 134.617C418.753 136.396 418.033 138.061 417.132 139.612C416.232 141.163 415.241 142.76 414.16 144.403L401.596 163.838H418.888V169.997H393.084Z"
            fill="white"
          />
          <path
            d="M405.907 233.581C402.856 233.581 400.313 233.01 398.278 231.868C396.244 230.727 394.718 229.082 393.701 226.936C392.684 224.79 392.175 222.255 392.175 219.332V217.482H399.527C399.527 217.665 399.527 217.871 399.527 218.099C399.527 218.282 399.527 218.487 399.527 218.716C399.573 220.36 399.758 221.844 400.082 223.168C400.451 224.493 401.076 225.543 401.954 226.319C402.879 227.096 404.196 227.484 405.907 227.484C407.71 227.484 409.074 227.073 409.999 226.251C410.923 225.383 411.548 224.173 411.871 222.62C412.195 221.068 412.357 219.286 412.357 217.277C412.357 214.354 411.802 211.979 410.692 210.153C409.629 208.28 407.733 207.253 405.005 207.07C404.867 207.024 404.682 207.001 404.451 207.001C404.266 207.001 404.104 207.001 403.965 207.001V199.672C404.104 199.672 404.266 199.672 404.451 199.672C404.636 199.672 404.797 199.672 404.936 199.672C407.571 199.58 409.467 198.895 410.623 197.616C411.779 196.338 412.357 194.214 412.357 191.246C412.357 188.734 411.918 186.724 411.039 185.217C410.207 183.71 408.519 182.957 405.976 182.957C403.433 182.957 401.746 183.802 400.914 185.491C400.082 187.135 399.619 189.259 399.527 191.862C399.527 192.045 399.527 192.25 399.527 192.479C399.527 192.661 399.527 192.844 399.527 193.027H392.175V191.177C392.175 188.209 392.684 185.674 393.701 183.573C394.718 181.472 396.244 179.851 398.278 178.709C400.359 177.568 402.925 176.997 405.976 176.997C409.074 176.997 411.64 177.568 413.674 178.709C415.709 179.851 417.234 181.495 418.252 183.642C419.269 185.742 419.777 188.277 419.777 191.246C419.777 194.579 419.038 197.251 417.558 199.261C416.125 201.27 414.183 202.64 411.733 203.371C413.443 203.873 414.877 204.741 416.032 205.974C417.234 207.207 418.159 208.783 418.806 210.701C419.454 212.573 419.777 214.765 419.777 217.277C419.777 220.565 419.315 223.442 418.39 225.908C417.466 228.329 415.986 230.224 413.952 231.594C411.918 232.919 409.236 233.581 405.907 233.581Z"
            fill="#D83BD2"
          />
        </g>
        <g filter="url(#funkyLogoFilter06)">
          <path
            d="M67.1244 214.101C66.9668 216.303 67.0456 218.661 67.3607 221.177C67.6758 223.692 67.991 226.287 68.3061 228.96C68.4636 230.217 68.7788 231.868 69.2515 233.912C69.7242 235.799 70.2756 237.764 70.9059 239.808C71.6937 241.852 72.4815 243.739 73.2694 245.469C74.2147 247.198 75.1601 248.535 76.1055 249.478C77.2085 250.579 78.3114 251.129 79.4143 251.129C79.887 251.129 80.281 251.129 80.5961 251.129C81.0688 250.972 81.5415 250.815 82.0142 250.657C85.323 248.771 88.6318 245.94 91.9407 242.167C95.2495 238.393 98.0069 235.013 100.213 232.026C106.2 224.479 111.873 216.853 117.23 209.149C122.587 201.444 127.944 193.583 133.301 185.564C134.404 183.992 135.507 182.419 136.61 180.847C137.713 179.275 138.816 177.703 139.919 176.13C140.392 175.659 140.864 175.423 141.337 175.423C141.652 175.423 141.888 175.501 142.046 175.659C142.676 175.973 142.991 176.602 142.991 177.545C142.991 178.174 142.676 178.96 142.046 179.904C135.271 189.967 128.496 199.951 121.72 209.856C115.103 219.762 107.933 229.353 100.213 238.629C99.2674 239.887 98.0857 241.381 96.6676 243.11C95.2495 244.84 93.5951 246.569 91.7043 248.299C89.9711 249.871 88.1592 251.208 86.2684 252.308C84.3776 253.409 82.5656 253.959 80.8324 253.959C77.8387 253.959 75.3177 252.937 73.2694 250.893C71.221 248.849 69.5666 246.412 68.3061 243.582C67.0456 240.752 66.1002 237.764 65.4699 234.62C64.8397 231.475 64.367 228.724 64.0519 226.365C62.9489 217.56 62.8701 208.362 63.8155 198.771C64.7609 190.438 66.2578 181.869 68.3061 173.064C70.3544 164.102 73.033 155.454 76.3418 147.121C79.8083 138.631 83.9837 130.612 88.8682 123.065C93.9102 115.518 99.8189 109.072 106.594 103.726C111.164 100.109 116.284 97.5938 121.957 96.1787H122.666C125.029 96.1787 126.841 97.0435 128.102 98.773C129.52 100.503 129.756 102.468 128.811 104.669C127.865 107.028 126.605 109.072 125.029 110.801C123.454 112.531 121.563 114.024 119.357 115.282C119.199 115.439 118.963 115.518 118.648 115.518C118.018 115.518 117.545 115.439 117.23 115.282C116.915 115.125 116.678 114.889 116.521 114.575C116.363 114.103 116.442 113.71 116.757 113.395C117.387 112.766 118.018 112.216 118.648 111.745C119.278 111.273 119.908 110.723 120.539 110.094C121.799 108.993 122.902 107.814 123.847 106.556C124.95 105.298 125.738 103.804 126.211 102.075C126.526 100.817 126.053 100.188 124.793 100.188C121.326 100.188 117.781 101.367 114.157 103.726C110.533 105.927 107.067 108.679 103.758 111.98C100.607 115.282 97.6918 118.741 95.0132 122.358C92.3346 125.817 90.2863 128.883 88.8682 131.556C81.7778 143.348 76.3418 156.634 72.5603 171.413C68.9363 186.036 67.1244 200.265 67.1244 214.101Z"
            fill="white"
          />
          <path
            d="M198.162 189.102C197.374 189.731 196.744 190.36 196.271 190.989C195.798 191.617 195.404 192.325 195.089 193.111C193.356 197.042 191.623 200.973 189.89 204.903C188.156 208.677 186.423 212.529 184.69 216.46C183.902 218.661 183.035 220.784 182.09 222.828C181.145 224.872 180.042 226.916 178.781 228.96C177.836 230.217 176.575 230.846 175 230.846C173.424 230.846 172.085 230.06 170.982 228.488C170.194 227.073 169.8 225.422 169.8 223.535C169.485 220.862 169.485 218.347 169.8 215.988C170.273 213.472 170.824 210.878 171.455 208.205C175.709 189.023 183.351 171.178 194.38 154.668C194.853 153.882 195.325 153.096 195.798 152.31C196.271 151.367 196.665 150.502 196.98 149.716C197.768 148.143 197.374 147.357 195.798 147.357H195.325C193.12 147.514 190.52 148.222 187.526 149.48C184.532 150.738 181.539 152.231 178.545 153.961C175.709 155.533 172.873 157.184 170.036 158.914C167.358 160.643 165.152 162.137 163.419 163.395C163.104 163.709 162.867 163.945 162.71 164.102C162.71 164.259 162.631 164.417 162.473 164.574C162.631 165.36 162.946 165.91 163.419 166.225C163.891 166.539 164.285 166.854 164.6 167.168C168.067 170.156 169.17 174.008 167.909 178.725C167.437 180.611 166.412 183.284 164.837 186.743C163.261 190.045 161.37 193.347 159.165 196.649C156.959 199.793 154.595 202.545 152.074 204.903C149.553 207.262 147.19 208.441 144.984 208.441C143.566 208.441 142.226 208.048 140.966 207.262C139.863 206.318 139.154 205.061 138.839 203.488C138.524 201.602 138.524 199.793 138.839 198.064C139.154 196.806 139.627 195.155 140.257 193.111C140.887 190.91 141.754 188.787 142.857 186.743C143.96 184.542 145.22 182.734 146.638 181.319C148.056 179.747 149.553 178.96 151.129 178.96C152.232 178.96 153.02 179.668 153.492 181.083C153.65 181.397 153.65 181.791 153.492 182.262C153.335 182.734 153.098 182.97 152.783 182.97H151.838C150.577 182.97 149.632 183.363 149.002 184.149C148.371 184.935 147.741 185.721 147.111 186.507C144.747 190.595 143.172 194.919 142.384 199.479C142.226 200.737 142.148 201.602 142.148 202.073C142.305 202.545 142.778 203.646 143.566 205.375C145.614 204.746 147.662 203.41 149.711 201.366C151.917 199.164 153.886 196.727 155.619 194.055C157.51 191.382 159.165 188.709 160.583 186.036C162.001 183.206 163.025 180.926 163.655 179.196C164.443 176.838 164.837 174.715 164.837 172.828C164.522 169.369 162.946 167.64 160.11 167.64C158.849 167.64 157.589 168.033 156.328 168.819C155.068 169.605 154.044 170.391 153.256 171.178C149.789 173.693 146.323 176.445 142.857 179.432C142.069 180.061 141.36 180.375 140.73 180.375C140.257 180.375 139.627 180.14 138.839 179.668C137.421 178.882 137.106 177.938 137.893 176.838C138.366 176.209 138.76 175.659 139.075 175.187C139.548 174.558 140.099 174.008 140.73 173.536C144.038 170.234 147.82 167.64 152.074 165.753C153.335 165.439 154.438 164.967 155.383 164.338C156.328 163.709 157.353 163.002 158.455 162.215C160.504 160.8 163.025 159.071 166.019 157.027C169.17 154.826 172.479 152.782 175.945 150.895C179.412 148.851 182.799 147.2 186.108 145.942C189.574 144.527 192.568 143.819 195.089 143.819C196.822 143.662 198.24 144.213 199.343 145.47C200.446 146.571 200.84 147.986 200.525 149.716C200.368 150.816 200.052 151.838 199.58 152.782C199.265 153.725 198.871 154.59 198.398 155.376C197.295 157.263 196.192 159.149 195.089 161.036C194.144 162.766 193.12 164.574 192.017 166.461C187.447 174.008 183.745 181.869 180.908 190.045C178.072 198.064 175.866 206.397 174.291 215.045C173.503 218.818 173.345 222.356 173.818 225.658L174.527 226.365C175.157 226.365 175.472 226.208 175.472 225.894C176.103 225.107 176.654 224.243 177.127 223.299C177.6 222.356 177.993 221.491 178.309 220.705C180.199 216.617 182.011 212.608 183.745 208.677C185.635 204.589 187.447 200.501 189.18 196.413C190.126 194.369 191.071 192.404 192.017 190.517C193.12 188.473 194.223 186.507 195.325 184.621C195.798 183.835 196.271 183.127 196.744 182.498C197.216 181.869 197.768 181.24 198.398 180.611C199.028 179.825 199.737 179.432 200.525 179.432C201.313 179.432 202.022 179.982 202.652 181.083C203.282 182.026 203.44 183.284 203.125 184.857C202.967 186.429 202.81 188.001 202.652 189.573C202.495 191.146 202.337 192.718 202.18 194.29C202.022 195.705 202.022 197.199 202.18 198.771C202.18 199.558 202.495 200.029 203.125 200.186C203.755 200.344 204.385 200.422 205.016 200.422C206.276 200.108 207.537 199.558 208.797 198.771C210.215 197.828 211.633 196.806 213.051 195.705C214.47 194.448 215.73 193.268 216.833 192.168C218.093 190.91 219.118 189.888 219.905 189.102C221.639 187.372 223.293 185.564 224.869 183.677C226.444 181.791 228.099 179.904 229.832 178.017C230.462 177.074 231.25 176.287 232.195 175.659C232.353 175.501 232.589 175.501 232.905 175.659C233.22 175.659 233.456 175.737 233.614 175.894C233.929 176.209 234.165 176.523 234.323 176.838C234.638 177.152 234.716 177.467 234.559 177.781L233.85 179.196C232.432 180.926 230.699 182.97 228.65 185.328C226.76 187.687 224.711 190.045 222.505 192.404C220.299 194.605 218.015 196.727 215.651 198.771C213.445 200.658 211.239 202.073 209.034 203.017C207.931 203.488 206.906 203.724 205.961 203.724C203.44 203.724 201.628 202.938 200.525 201.366C199.422 199.793 198.713 197.907 198.398 195.705C198.398 194.605 198.398 193.583 198.398 192.639C198.556 191.539 198.477 190.36 198.162 189.102Z"
            fill="white"
          />
          <path
            d="M278.211 105.377C278.053 108.207 277.502 110.723 276.557 112.924C274.823 117.641 272.617 122.515 269.939 127.546C267.26 132.578 264.345 137.609 261.194 142.64C258.2 147.514 255.049 152.31 251.74 157.027C248.431 161.586 245.28 165.832 242.286 169.762C240.553 171.964 239.135 174.244 238.032 176.602C236.929 178.96 236.22 181.476 235.905 184.149C235.59 187.294 235.196 190.438 234.723 193.583C234.251 196.57 233.778 199.636 233.305 202.781C233.148 203.41 233.069 204.039 233.069 204.668C233.226 205.296 233.305 205.925 233.305 206.554C233.305 206.869 233.463 207.105 233.778 207.262C234.093 207.419 234.329 207.419 234.487 207.262C235.117 206.79 235.669 206.318 236.141 205.847C236.772 205.375 237.323 204.903 237.796 204.432C242.208 200.186 246.619 196.02 251.031 191.932C255.443 187.844 260.012 183.913 264.739 180.14C265.369 179.668 266 179.196 266.63 178.725C267.26 178.253 267.969 177.781 268.757 177.309C269.072 176.995 269.702 176.681 270.648 176.366H271.357C271.987 176.366 272.539 176.681 273.011 177.309C273.326 178.096 273.09 178.882 272.302 179.668C265.685 184.699 259.382 189.967 253.395 195.47C247.407 200.815 241.42 206.397 235.432 212.215C233.226 214.416 232.202 216.853 232.36 219.526C232.517 221.727 232.517 223.85 232.36 225.894C232.36 227.78 232.439 229.746 232.596 231.79C232.596 235.721 233.305 239.494 234.723 243.11C235.984 246.727 236.85 250.422 237.323 254.195C237.796 257.969 238.19 261.742 238.505 265.516C238.505 266.773 238.426 267.717 238.268 268.346C238.268 269.446 237.481 269.997 235.905 269.997C235.117 269.997 234.487 269.761 234.014 269.289C232.439 264.729 231.336 260.17 230.705 255.61C230.075 250.893 229.524 246.176 229.051 241.459C229.051 238.315 228.027 235.642 225.978 233.441C223.93 231.239 221.33 230.139 218.179 230.139C217.549 229.982 216.919 229.903 216.288 229.903C215.658 229.746 215.185 229.353 214.87 228.724C214.555 227.938 214.634 227.309 215.107 226.837C215.422 226.365 215.816 225.894 216.288 225.422C217.864 223.85 219.361 222.356 220.779 220.941C222.197 219.369 223.773 217.875 225.506 216.46C227.397 214.73 228.499 212.529 228.815 209.856C228.972 206.083 229.209 202.309 229.524 198.536C229.996 194.762 230.627 190.989 231.414 187.215C231.73 185.171 231.178 183.756 229.76 182.97C228.972 182.341 228.893 181.712 229.524 181.083C231.414 179.353 232.675 177.388 233.305 175.187C234.093 172.828 234.802 170.47 235.432 168.112C236.693 163.08 238.426 157.498 240.632 151.367C242.838 145.077 245.359 138.867 248.195 132.735C251.189 126.603 254.419 120.785 257.885 115.282C261.509 109.779 265.369 105.298 269.466 101.839C269.781 101.525 270.412 101.131 271.357 100.66C272.46 100.031 273.326 99.7164 273.957 99.7164C275.375 99.7164 276.478 100.503 277.266 102.075C277.581 102.704 277.738 103.333 277.738 103.962C277.896 104.591 278.053 105.062 278.211 105.377ZM274.902 106.084C274.745 105.77 274.666 105.534 274.666 105.377C274.666 105.062 274.587 104.748 274.429 104.433C274.272 104.276 274.035 104.197 273.72 104.197C273.405 104.197 272.933 104.355 272.302 104.669C271.672 105.298 271.042 105.927 270.412 106.556C269.781 107.028 269.072 107.657 268.284 108.443C262.139 115.361 256.94 123.38 252.686 132.499C248.589 141.461 245.122 150.187 242.286 158.678C241.971 159.621 241.656 160.879 241.341 162.451L242.05 163.159C242.208 163.002 242.365 162.923 242.523 162.923C242.838 162.608 243.074 162.294 243.232 161.98C243.547 161.508 243.862 161.115 244.177 160.8C249.534 153.096 254.813 145.235 260.012 137.216C265.212 129.04 269.545 120.549 273.011 111.745C273.326 110.801 273.642 109.858 273.957 108.914C274.272 107.971 274.587 107.028 274.902 106.084ZM220.542 227.545C221.645 228.016 222.67 228.567 223.615 229.195C224.56 229.667 225.506 230.139 226.451 230.611C226.766 230.768 226.924 230.846 226.924 230.846C227.712 230.846 228.106 230.296 228.106 229.195V222.12C228.106 221.334 227.79 220.941 227.16 220.941C226.687 220.941 226.372 221.019 226.215 221.177C225.112 222.12 224.088 223.063 223.142 224.007C222.039 224.95 221.173 226.129 220.542 227.545Z"
            fill="white"
          />
        </g>
      </g>
      <defs>
        <filter
          id="funkyLogoFilter03"
          x="310.82"
          y="7.1311"
          width="81.8704"
          height="160.041"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
            in2="BackgroundImageFix"
            result="effect1_dropShadow_238_922"
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
            in2="effect1_dropShadow_238_922"
            result="effect2_dropShadow_238_922"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_238_922"
            result="shape"
          />
        </filter>
        <filter
          id="funkyLogoFilter01"
          x="-8.00006"
          y="-8"
          width="173.262"
          height="188.078"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
            result="effect1_dropShadow_238_922"
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
            in2="effect1_dropShadow_238_922"
            result="effect2_dropShadow_238_922"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_238_922"
            result="shape"
          />
        </filter>
        <filter
          id="funkyLogoFilter02"
          x="336.065"
          y="33.6646"
          width="149.485"
          height="137.507"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
            values="0 0 0 0 0.960784 0 0 0 0 0.2 0 0 0 0 0.258824 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_238_922"
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
            in2="effect1_dropShadow_238_922"
            result="effect2_dropShadow_238_922"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_238_922"
            result="shape"
          />
        </filter>
        <filter
          id="funkyLogoFilter04"
          x="179.219"
          y="35.4033"
          width="178.603"
          height="131.769"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
            in2="BackgroundImageFix"
            result="effect1_dropShadow_238_922"
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
            in2="effect1_dropShadow_238_922"
            result="effect2_dropShadow_238_922"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_238_922"
            result="shape"
          />
        </filter>
        <filter
          id="funkyLogoFilter05"
          x="97.1086"
          y="33.1409"
          width="132.486"
          height="132.9"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
            in2="BackgroundImageFix"
            result="effect1_dropShadow_238_922"
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
            in2="effect1_dropShadow_238_922"
            result="effect2_dropShadow_238_922"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_238_922"
            result="shape"
          />
        </filter>
        <filter
          id="funkyLogoFilter06"
          x="21.161"
          y="54.1787"
          width="299.05"
          height="257.818"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
            result="effect1_dropShadow_238_922"
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
            in2="effect1_dropShadow_238_922"
            result="effect2_dropShadow_238_922"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_238_922"
            result="shape"
          />
        </filter>
        <linearGradient
          id="funkyLogoPaint01"
          x1="356.675"
          y1="138.997"
          x2="356.675"
          y2="240.997"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-opacity="0" />
          <stop offset="0.166667" />
          <stop offset="0.776042" />
          <stop offset="1" stop-opacity="0" />
        </linearGradient>
        <clipPath id="funkyLogoClip01">
          <rect width="488" height="304" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function Speakers() {
  let { speakers } = useLoaderData<LoaderData>();
  let mc = speakers.find((s) => s.type === "emcee");
  let talkSpeakers = speakers.filter((s) => s.type !== "emcee");
  return (
    <section id="speakers" className="py-20">
      <div className="relative container">
        <h2 className="font-display text-m-h1 md:text-d-h1 mb-6 md:mb-8 font-semibold">
          Speakers
        </h2>
      </div>
      <div className="lg:container">
        <ScrollX className="gap-5 lg:grid lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 lg:auto-rows-fr">
          <div className="w-6 md:w-8 shrink-0 grow-0 snap-start -mr-5 lg:hidden"></div>
          {talkSpeakers.map((speaker) => (
            <SpeakerDisplay
              speaker={speaker}
              key={speaker.name}
              className="w-[36%] min-w-[116px] lg:w-auto lg:min-w-0 snap-start shrink-0 grow-0 origin-center scale-100 transition-transform duration-300 ease-out relative"
            />
          ))}
        </ScrollX>
        {mc ? (
          <div id="mc">
            <h2 className="mt-24 mb-6 md:mb-8 uppercase font-semibold text-center">
              Master of Ceremonies
            </h2>
            <div className="flex justify-center m-auto">
              <SpeakerDisplay speaker={mc} className="basis-72" />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SpeakerDisplay({
  speaker,
  className = "",
}: {
  speaker: Omit<Speaker, "bio">;
  className?: string;
}) {
  return (
    <Link
      to={`speakers/${speaker.slug}`}
      className={`__speaker-link flex items-start h-full w-full ${className}`}
      aria-label={`${speaker.name}, ${speaker.title}`}
      prefetch="intent"
    >
      <div className="w-full max-w-xs sm:max-w-none">
        <div className="__speaker-img rounded-md overflow-hidden aspect-w-1 aspect-h-1 bg-black">
          <img src={speaker.imgSrc} alt={speaker.name} title={speaker.name} />
        </div>
        <div className="mt-4">
          <h3>{speaker.name}</h3>
          <p className="text-m-p-sm">{speaker.title}</p>
          <p className="text-m-p-sm font-semibold uppercase mt-2">
            {speaker.linkText}
          </p>
        </div>
      </div>
    </Link>
  );
}

function Sponsors() {
  const { sponsors } = useLoaderData<LoaderData>();
  return (
    <section id="sponsors" className="py-20 __section-sponsors">
      <div className="relative container">
        <h2 className="font-display text-m-h1 md:text-d-h1 mb-6 md:mb-8 font-semibold">
          Sponsors
        </h2>
      </div>
      <div className="lg:container">
        <div></div>
        <div className="container lg:mx-0 lg:px-0">
          {sponsors.premier ? (
            <a href={sponsors.premier.link}>
              <img
                src={sponsors.premier.imgSrc}
                alt={sponsors.premier.name}
                className="max-w-full max-h-full p-12"
              />
            </a>
          ) : (
            <div className="bg-blue-brand" />
          )}
        </div>

        {sponsors.gold.length > 0 ? (
          <ScrollX className="gap-5 lg:grid lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 lg:auto-rows-fr"></ScrollX>
        ) : null}
      </div>
    </section>
  );
}

function SponsorsList({
  sponsors,
  level,
}: {
  sponsors: Array<Sponsor>;
  level: Sponsor["level"];
}) {
  const size = {
    premier: "",
    gold: "w-[250px] h-[250px]",
    silver: "w-[200px] h-[200px]",
    community: "w-[150px] h-[150px]",
  }[level];

  const ulClassName = {
    premier: "",
    gold: "max-w-[36rem] gap-8 md:gap-12 lg:gap-14",
    silver: "max-w-[46rem] gap-6 md:gap-10 lg:gap-12",
    community: "max-w-[46rem] gap-4 md:gap-8 lg:gap-10",
  }[level];

  return (
    <div>
      <ul
        className={`${ulClassName} m-auto flex flex-wrap list-none items-center justify-center`}
      >
        {sponsors.map((sponsor) => (
          <li key={sponsor.name} className={`${size}`}>
            <div className="border-2 border-200 w-full h-full bg-white">
              <a
                href={sponsor.link}
                className="h-full w-full flex items-center justify-center"
              >
                <img
                  src={sponsor.imgSrc}
                  alt={sponsor.name}
                  title={sponsor.name}
                  className="max-w-full max-h-full p-3"
                />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScrollX({
  className = "",
  children,
}: React.PropsWithChildren<{
  className?: string;
}>) {
  return (
    <div
      className={cx(
        className,
        "flex overflow-x-auto snap-x snap-mandatory scroll-smooth lg:snap-none"
      )}
    >
      {children}
    </div>
  );
}
