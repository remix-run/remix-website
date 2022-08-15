import * as React from "react";
import { Outlet, useLocation, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type {
  LinksFunction,
  LoaderFunction,
  HeadersFunction,
} from "@remix-run/node";
import { Link, NavLink } from "~/components/link";
import { Wordmark } from "~/components/logo";
import { Discord, GitHub, Twitter, YouTube } from "~/components/icons";
import {
  Menu,
  MenuButton,
  MenuPopover,
  MenuItems,
  MenuLink,
} from "@reach/menu-button";
import cx from "clsx";
import styles from "~/styles/conf/2023/conf.css";
import {
  SubscribeEmailInput,
  SubscribeForm,
  SubscribeProvider,
  SubscribeStatus,
  SubscribeSubmit,
} from "~/components/subscribe";
import { CACHE_CONTROL } from "~/utils/http.server";

export let handle = { forceDark: true };

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

type LoaderData = { earlyBird: boolean };

// March 1 at 12:00am
const EARLY_BIRD_ENDING_TIME = 1646121600000;

export const loader: LoaderFunction = async () => {
  return json<LoaderData>(
    { earlyBird: Date.now() < EARLY_BIRD_ENDING_TIME },
    { headers: { "Cache-Control": CACHE_CONTROL } }
  );
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL,
  };
};

const navItems: Array<HeaderLinkProps> = [
  {
    to: "sponsor",
    children: "Become a Sponsor",
  },
];

export default function ConfTwentyTwentyThree() {
  return (
    <>
      <TopBanner />
      <div className="flex flex-col flex-1 h-full text-white bg-black __layout">
        <Header />
        <main className="flex flex-col flex-1" tabIndex={-1}>
          <Outlet />
        </main>
        <aside>
          <SignUp />
        </aside>
        <Footer />
      </div>
    </>
  );
}

function SignUp() {
  return (
    <section className="my-6" id="conf-newsletter-signup">
      <div className="container">
        <section className="section-signup relative">
          <div className="md:max-w-xl mx-auto md:py-40 relative">
            <h2 className="h2 mb-3 text-d-h3 text-yellow-brand font-bold">
              Stay Updated
            </h2>
            <div className="flex items-center gap-4 mb-6">
              <a
                href="https://discord.gg/remix"
                aria-label="Discord"
                title="Join Discord"
              >
                <Discord aria-hidden />
              </a>
              <p className="text-lg md:text-xl opacity-80">
                <a className="underline" href="https://discord.gg/remix">
                  Join the Remix community on Discord
                </a>{" "}
                to keep up with what's going on with the conference and the
                Remix Community as a whole.
              </p>
            </div>
            <p
              className="text-lg md:text-xl mb-6 opacity-80"
              id="newsletter-text"
            >
              To get exclusive updates announcements about Remix Conf, subscribe
              to our newsletter!
            </p>
            <SubscribeProvider>
              <SubscribeForm aria-describedby="newsletter-text">
                <SubscribeEmailInput />
                <SubscribeSubmit className="w-full mt-2 sm:w-auto sm:mt-0 uppercase" />
              </SubscribeForm>
              <p className="text-white opacity-60 text-sm mt-3">
                We respect your privacy; unsubscribe at any time.
              </p>
              <SubscribeStatus />
            </SubscribeProvider>
          </div>
        </section>
      </div>
    </section>
  );
}

function Header() {
  let location = useLocation();
  let isConfHome =
    location.pathname === "/conf" || location.pathname === "/conf/2023";
  return (
    <header
      className={cx("text-white absolute top-0 left-0 right-0 z-10", {
        ["absolute top-0 left-0 right-0 z-10"]: isConfHome,
      })}
    >
      <div className="px-6 lg:px-12 py-9 pt-20 md:pt-14 flex justify-between items-start gap-8">
        <NavLink
          to={isConfHome ? "/" : "."}
          prefetch="intent"
          aria-label="Remix"
          className="opacity-80 hover:opacity-100 transition-opacity duration-200"
        >
          <Wordmark />
        </NavLink>

        <nav className="flex" aria-label="Main">
          <ul className="hidden md:flex gap-4 md:gap-5 lg:gap-8 list-none items-center">
            {navItems.map((item) => (
              <li key={item.to + item.children}>
                <HeaderLink
                  {...item}
                  className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                />
              </li>
            ))}
            <li>
              <HeaderLink
                to="https://rmx.as/tickets"
                className="text-pink-brand hover:text-white transition-colors duration-200"
              >
                Buy Tickets
              </HeaderLink>
            </li>
          </ul>
          <MobileNav />
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer
      x-comp="Footer"
      className="px-6 lg:px-12 py-9 text-d-p-sm flex justify-between items-center text-white __footer"
    >
      <div className="flex items-start md:items-center flex-col md:flex-row gap-2 md:gap-16">
        <Link to="/" aria-label="Remix home" prefetch="intent">
          <Wordmark height={16} aria-hidden />
        </Link>
        <Link
          prefetch="intent"
          to="coc"
          className="leading-none block font-semibold"
        >
          Code of Conduct
        </Link>
        <Link
          prefetch="intent"
          to="../2022"
          className="leading-none block font-semibold"
        >
          2022
        </Link>
      </div>
      <nav className="flex gap-6 text-white" aria-label="Find us on the web">
        <a href="https://github.com/remix-run" aria-label="GitHub">
          <GitHub aria-hidden />
        </a>
        <a href="https://twitter.com/remix_run" aria-label="Twitter">
          <Twitter aria-hidden />
        </a>
        <a href="https://youtube.com/remix_run" aria-label="YouTube">
          <YouTube aria-hidden />
        </a>
        <a href="https://discord.gg/remix" aria-label="Discord">
          <Discord aria-hidden />
        </a>
      </nav>
    </footer>
  );
}

interface HeaderLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: "none" | "intent";
}

const HeaderLink = React.forwardRef<HTMLAnchorElement, HeaderLinkProps>(
  ({ to, children, className, prefetch = "none", ...props }, ref) => {
    let external = to.startsWith("https://");
    if (external) {
      return (
        <a
          ref={ref}
          x-comp="HeaderLink"
          className={cx("text-d-p-sm font-semibold", className)}
          href={to}
          children={children}
          {...props}
        />
      );
    }

    return (
      <NavLink
        ref={ref}
        prefetch={prefetch}
        x-comp="HeaderLink"
        className={cx("text-d-p-sm font-semibold", className)}
        to={to}
        children={children}
        {...props}
      />
    );
  }
);

function MobileNavButton() {
  return (
    <MenuButton
      id="nav-button"
      aria-label="Toggle menu"
      className="border-2 border-white border-opacity-60 expanded:border-opacity-100 rounded-md h-9 w-9 flex items-center justify-center expanded:bg-black"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    </MenuButton>
  );
}

function MobileMenuItem({ className, ...props }: HeaderLinkProps) {
  return (
    <MenuLink
      as={HeaderLink}
      className={cx(
        className,
        "select-none cursor-pointer py-2 px-4 outline-none selected:bg-pink-500 selected:text-white hover:bg-gray-700 selected:hover:bg-pink-600 hover:text-white"
      )}
      {...props}
    />
  );
}

function MobileNavList() {
  return (
    <MenuPopover className="absolute block">
      <MenuItems className="relative block whitespace-nowrap outline-none py-2 border-2 border-white rounded-md mt-2 bg-black">
        {navItems.map((item) => (
          <MobileMenuItem
            key={item.to + item.children}
            {...item}
            className="block text-white text-opacity-90 hover:text-opacity-100"
          />
        ))}
      </MenuItems>
    </MenuPopover>
  );
}

function MobileNav() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="flex items-center gap-4 md:hidden">
      <HeaderLink
        className="block text-yellow-brand hover:text-white"
        to="https://rmx.as/tickets"
      >
        Buy Tickets{" "}
        {data.earlyBird ? (
          <small title="Early Bird discount!"> 🐣</small>
        ) : null}
      </HeaderLink>
      <div>
        <Menu>
          <MobileNavButton />
          <MobileNavList />
        </Menu>
      </div>
    </div>
  );
}

function TopBanner() {
  return (
    <div className="py-2 bg-black sticky top-0 z-20">
      <p className="container mx-auto flex flex-col md:flex-row md:gap-1 justify-center items-center sm:text-[16px] text-[3.2vw]">
        <span className="text-pink-brand font-bold">
          Announcing: Remix Conf 2023.
        </span>{" "}
        <a href="https://rmx.as/tickets" className="text-white underline">
          30% discount available now.
          <span aria-hidden> ↗</span>
        </a>
      </p>
    </div>
  );
}
