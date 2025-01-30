import { Link } from "react-router";

import logoHref from "./images/remix-jam-logo.svg";
import locationHref from "./images/location.svg";
import seatsHref from "./images/seats.svg";

export default function RemixJam2025() {
  return (
    <div className="bg-gradient-to-b from-[#ebebe6] to-white">
      <Nav />

      <LetterOfIntent />

      <div className="flex flex-col items-center">
        <div className="aspect-[8/3] w-[1824px] lg:w-[2016px] xl:w-[2344px] 2xl:w-[2784px]">
          <img src={seatsHref} className="w-full" alt="" aria-hidden="true" />
        </div>
      </div>

      <NewsletterSignup />
    </div>
  );
}

function Nav() {
  return (
    <nav className="fixed left-1/2 top-12 z-10 flex w-3/4 max-w-[1600px] -translate-x-1/2 flex-col items-center gap-4 rounded-3xl bg-white/80 px-6 py-12 backdrop-blur-[10px] md:w-[93%] md:flex-row md:justify-between md:rounded-[100px] md:px-9 md:py-9 xl:py-10 xl:pr-10 2xl:px-16 2xl:py-12">
      <h1 className="sr-only">Remix Jam 2025</h1>

      <img src={logoHref} alt="" className="h-9 md:h-6 lg:h-9 2xl:h-12" />

      <img
        src={locationHref}
        alt="Toronto 2025"
        className="h-9 md:h-6 lg:h-9 2xl:h-12"
      />

      <Link
        to="#newsletter"
        className="rounded-full bg-black px-5 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-brand xl:px-6 xl:py-5 xl:text-xl 2xl:px-9 2xl:py-6 2xl:text-2xl"
      >
        Tickets
      </Link>
    </nav>
  );
}

function LetterOfIntent() {
  return (
    <main
      className="mx-auto w-[95%] max-w-[1400px] pt-[310px] md:w-3/4 md:pt-[200px] lg:w-[65%] lg:pt-[280px] 2xl:w-[60%]"
      // TODO: figure out parallax effect
      // style={{
      //   willChange: "transform",
      //   transform: "translateY(275px)",
      // }}
    >
      <div className="px-12 pb-[400px] pt-12 2xl:py-24">
        <h2 className="text-center text-4xl font-bold leading-tight tracking-tight md:text-[2.5rem] md:leading-tight lg:text-5xl lg:leading-tight xl:text-6xl xl:leading-tight 2xl:text-7xl 2xl:leading-tight">
          We figure it's time to get the band back together.
        </h2>

        <div className="mt-12 flex flex-col gap-12 text-justify text-base md:mt-24 lg:mt-32 lg:text-xl 2xl:text-2xl">
          <p>
            A lot has changed since the last Remix Conf in 2023. The React team
            has introduced so many great features and new paradigms with React
            19. Because of this, we on the Remix team felt it our responsibility
            to build a bridge to React 19 for the million of applications using
            React Router, by bringing everything that made Remix great into it.
          </p>
          <p>
            But we haven't stopped there; we've still been jamming in our
            garage, and we're ready to start jamming with all of you again.
            That's why we're letting you know to mark your calendars for Remix
            Jam, Fall 2025.
          </p>
          <p>
            Remix Jam is a gathering of the web's biggest fans, hosted by
            Shopify in the beautiful city of Toronto. Remix Jam will be the best
            opportunity to hang out IRL with the Remix community and core team,
            as well as hear from leading experts who are successfully using
            Remix technologies to solve real problems.
          </p>
          <p>
            Our tagline, "
            <span className="font-medium italic">Build Better Websites</span>"
            is still at the heart of everything we do. We want to enable users
            to build better websites, which is why we made Remix.
          </p>
          <blockquote className="italic text-blue-400">
            "...a full stack web framework that lets you focus on the user
            interface and work back through web standards to deliver a fast,
            slick, and resilient user experience."
          </blockquote>
          <p>
            We're pushing further, not just with projects like React Router but
            in our broader mission and philosophy to useThePlatform to build a
            better web.
          </p>
          <p>
            We can't wait to tell you more. If you want to be notified as soon
            as tickets go on sale,{" "}
            <Link
              to="#newsletter"
              className="font-bold text-blue-brand hover:underline"
            >
              sign up for our newsletter below!
            </Link>
          </p>
          <p className="mt-12 italic">— The Remix Team</p>
        </div>
      </div>
    </main>
  );
}

function NewsletterSignup() {
  return (
    <aside
      id="newsletter"
      // className="bg-gradient-to-b from-red-600 via-yellow-400 to-yellow-200 px-6 py-24"
      className="w-full px-10 pb-[200px]"
      style={{
        background:
          "linear-gradient(180deg, #ff3300 0%, rgb(235, 210, 110) 100%)",
      }}
    >
      <div className="mx-auto flex w-[1000px] max-w-full flex-col items-center">
        <h2 className="text-center text-[1.75rem] font-bold leading-tight tracking-tight text-white md:text-4xl md:leading-tight lg:text-[2.5rem] lg:leading-tight xl:text-5xl xl:leading-tight">
          <span>Sign up to get notified</span>
          <br />
          <span>when Remix Jam tickets are available</span>
        </h2>

        <form className="mt-7 flex w-[280px] flex-col gap-5 p-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-left text-xs font-medium text-white"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Jane Smith"
              className="rounded-xl bg-black/20 p-5 text-sm leading-none text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-left text-xs font-medium text-white"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="jane@email.com"
              className="rounded-xl bg-black/20 p-5 text-sm leading-none text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <button
            type="submit"
            className="rounded-2xl bg-black px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-brand"
          >
            Sign Up
          </button>
        </form>
      </div>
    </aside>
  );
}
