import * as React from "react";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useMatches,
  useNavigation,
  useParams,
  useResolvedPath,
} from "@remix-run/react";
import { matchPath } from "react-router-dom";
import { json, redirect } from "@remix-run/node";
import type {
  LoaderArgs,
  MetaFunction,
  LinksFunction,
  HeadersFunction,
} from "@remix-run/node";
import cx from "clsx";
import { DocSearch } from "@docsearch/react";
import docsearchStylesheet from "@docsearch/css/dist/style.css";
import docsearchStylesheetOverrides from "~/styles/docsearch.css";

import markdownStyles from "~/styles/docs.css";
import { Wordmark } from "~/ui/logo";
import { useHydrated } from "~/lib/misc";

import iconsHref from "~/icons.svg";
import {
  getRepoBranches,
  getRepoDocsMenu,
  getRepoTags,
  validateParams,
  getLatestVersion,
} from "~/lib/gh-docs";
import type { Doc } from "~/lib/gh-docs";
import { useColorScheme } from "~/lib/color-scheme";

export let loader = async ({ params }: LoaderArgs) => {
  let { lang = "en", ref = "main", "*": splat } = params;

  let branchesInMenu = ["main", "dev"];
  let [tags, branches] = await Promise.all([getRepoTags(), getRepoBranches()]);
  if (!tags || !branches) {
    throw new Response("Cannot reach GitHub", { status: 503 });
  }

  if (process.env.NODE_ENV === "development") {
    branches.push("local");
    branchesInMenu.push("local");
  }

  let betterUrl = validateParams(tags, branches, { lang, ref, "*": splat });
  if (betterUrl) throw redirect("/docs/" + betterUrl);

  let latestVersion = getLatestVersion(tags);
  let menu = await getRepoDocsMenu(ref, lang);
  let releaseBranch = "main";
  let isLatest = ref === releaseBranch || ref === latestVersion;

  return json({
    menu,
    versions: [getLatestVersion(tags)],
    latestVersion,
    releaseBranch,
    branches: branchesInMenu,
    currentGitHubRef: ref,
    lang,
    isLatest,
  });
};

export let links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: markdownStyles },
    { rel: "stylesheet", href: docsearchStylesheet },
    { rel: "stylesheet", href: docsearchStylesheetOverrides },
  ];
};

export let meta: MetaFunction = ({ params }) => {
  return {
    "docsearch:language": params.lang || "en",
    "docsearch:version": params.ref || "v1",
  };
};

export let headers: HeadersFunction = () => {
  return { "Cache-Control": "max-age=300" };
};

export default function DocsLayout() {
  let params = useParams();
  let navigation = useNavigation();
  let navigating =
    navigation.state === "loading" && navigation.formData == null;
  let changingVersions =
    navigating &&
    params.ref &&
    // TODO: we should have `transition.params`
    !navigation.location!.pathname.match(params.ref);

  let location = useLocation();
  let detailsRef = React.useRef<HTMLDetailsElement>(null);

  React.useEffect(() => {
    let details = detailsRef.current;
    if (details && details.hasAttribute("open")) {
      details.removeAttribute("open");
    }
  }, [location]);

  return (
    <div>
      <div className="sticky top-0 z-20">
        <Header />
        <NavMenuMobile />
      </div>
      <div
        className={
          changingVersions
            ? "opacity-25 transition-opacity delay-300"
            : undefined
        }
      >
        <InnerContainer>
          <NavMenuDesktop />
          <div
            className={cx(
              "min-h-[80vh]",
              "lg:ml-72 lg:pl-6 xl:pl-10 2xl:pl-12",
              !changingVersions && navigating
                ? "opacity-25 transition-opacity delay-300"
                : ""
            )}
          >
            <Outlet />
          </div>
          <div className="min-w-0 pt-8 sm:pt-10 lg:ml-72 lg:pt-12 lg:pl-6 xl:pl-10 2xl:pl-12">
            <Footer />
          </div>
        </InnerContainer>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="flex justify-between border-t border-t-gray-50 py-4 text-sm text-gray-400 dark:border-gray-800">
      <div className="lg:flex lg:items-center">
        <div>
          &copy;{" "}
          <a className="hover:underline" href="https://remix.run">
            Remix Software, Inc.
          </a>
        </div>
        <div className="hidden lg:block">•</div>
        <div className="pr-4 lg:pl-4">
          Docs and examples licensed under{" "}
          <a
            className="hover:underline"
            href="https://opensource.org/licenses/MIT"
          >
            MIT
          </a>
        </div>
      </div>
      <div>
        <EditLink />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div
      className={cx(
        "relative border-b border-gray-50 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100",
        // This hides some of the underlying text when the user scrolls to the
        // bottom which results in the overscroll bounce
        "before:bg-inherit before:absolute before:left-0 before:bottom-0 before:hidden before:h-[500%] before:w-full lg:before:block"
      )}
    >
      <InnerContainer>
        <div className="relative z-20 flex h-16 w-full items-center justify-between py-3">
          <div className="flex w-full items-center justify-between gap-8 md:w-auto">
            <Link
              className="flex"
              onContextMenu={(event) => {
                let NODE_ENV = window.__env && window.__env.NODE_ENV;
                if (NODE_ENV !== "development") {
                  event.preventDefault();
                  window.location.href =
                    "https://drive.google.com/drive/u/0/folders/1pbHnJqg8Y1ATs0Oi8gARH7wccJGv4I2c";
                }
              }}
              to="."
            >
              <Wordmark />
            </Link>
            <div className="flex items-center gap-2">
              <VersionSelect />
              <ColorSchemeToggle />
            </div>
          </div>
          <VersionWarning />
          <div className="flex items-center gap-4">
            <HeaderLink
              href="https://github.com/remix-run/remix"
              svgId="github"
              label="View code on GitHub"
              title="View code on GitHub"
              svgSize="24x24"
            />
            <HeaderLink
              href="https://rmx.as/discord"
              svgId="discord"
              label="Chat on Discord"
              title="Chat on Discord"
              svgSize="24x24"
            />
          </div>
        </div>
      </InnerContainer>
    </div>
  );
}

function VersionSelect() {
  let {
    versions,
    latestVersion,
    releaseBranch,
    branches,
    currentGitHubRef,
    lang,
  } = useLoaderData<typeof loader>();

  // This is the same default, hover, focus style as the ColorScheme trigger
  const className =
    "border border-transparent bg-gray-100 hover:bg-gray-200 focus:border focus:border-gray-100 focus:bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:border-gray-400 dark:focus:bg-gray-700";

  return (
    <DetailsMenu className="relative">
      <summary
        className={`_no-triangle relative flex h-[40px] cursor-pointer list-none items-center justify-center gap-3 rounded-full px-3 ${className}`}
      >
        <div>{currentGitHubRef}</div>
        <svg aria-hidden className="h-[18px] w-[18px] text-gray-400">
          <use href={`${iconsHref}#dropdown-arrows`} />
        </svg>
      </summary>
      <DetailsPopup>
        <VersionsLabel label="Branches" />
        {branches.map((branch) => {
          return (
            <VersionLink
              key={branch}
              to={currentGitHubRef === branch ? "" : `/docs/${lang}/${branch}`}
            >
              {releaseBranch === branch ? `main (${latestVersion})` : branch}
            </VersionLink>
          );
        })}

        <VersionsLabel label="Versions" />
        {versions.map((version) => (
          <VersionLink
            key={version}
            to={currentGitHubRef === version ? "" : `/docs/${lang}/${version}`}
          >
            {version}
          </VersionLink>
        ))}
      </DetailsPopup>
    </DetailsMenu>
  );
}

function VersionsLabel({ label }: { label: string }) {
  return (
    <div className="px-4 pt-2 pb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-300">
      {label}
    </div>
  );
}

function VersionLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  let isExternal = to.startsWith("http");
  let isActive = useIsActivePath(to);
  let className =
    "relative pl-4 group items-center flex py-1 before:mr-4 before:relative before:top-px before:block before:h-1.5 before:w-1.5 before:rounded-full before:content-['']";

  if (isExternal) {
    return (
      <a
        href={to}
        className={cx(
          className,
          "after:absolute after:right-4 after:top-1 after:block after:-rotate-45 after:opacity-50 after:content-['→']",
          // Same as !isActive styles on <Link> below
          "hover:bg-gray-50 active:text-blue-brand dark:text-gray-200 dark:hover:bg-gray-700 dark:active:text-blue-brand"
        )}
      >
        {children}
      </a>
    );
  }

  return to ? (
    <Link
      className={cx(
        className,
        "before:bg-transparent",
        isActive
          ? "text-blue-brand"
          : "hover:bg-gray-50 active:text-blue-brand dark:text-gray-200 dark:hover:bg-gray-700 dark:active:text-blue-brand"
      )}
      to={to}
    >
      {children}
    </Link>
  ) : (
    <span
      className={cx(
        className,
        "font-bold text-blue-brand before:bg-blue-brand"
      )}
    >
      {children}
    </span>
  );
}

function DocSearchSection() {
  let hydrated = useHydrated();
  let { isLatest } = useLoaderData<typeof loader>();
  if (!isLatest) return null;
  return (
    <div className="relative lg:sticky lg:top-0 lg:z-10">
      <div className="absolute -top-24 hidden h-24 w-full bg-white dark:bg-gray-900 lg:block" />
      <div
        className={cx(
          "relative lg:bg-white lg:px-1 lg:dark:bg-gray-900",
          // This hides some of the underlying text when the user scrolls to the
          // bottom which results in the overscroll bounce
          "before:bg-inherit before:absolute before:left-0 before:bottom-0 before:-z-10 before:hidden before:h-[200%] before:w-full lg:before:block"
        )}
      >
        {hydrated ? (
          <DocSearch
            appId="6OHWJSR8G4"
            indexName="remix"
            apiKey="dff56670dbec8494409989d6ec9c8ac2"
          />
        ) : (
          // The Algolia doc search container is hard-coded at 40px. It doesn't
          // render anything on the server, so we get a mis-match after hydration.
          // This placeholder prevents layout shift when the search appears.
          <div className="h-20" />
        )}
      </div>
      <div className="absolute top-full hidden h-6 w-full bg-gradient-to-b from-white dark:from-gray-900 lg:block" />
    </div>
  );
}

function ColorSchemeToggle() {
  let location = useLocation();

  // This is the same default, hover, focus style as the VersionSelect
  let className =
    "border border-transparent bg-gray-100 hover:bg-gray-200 focus:border focus:border-gray-100 focus:bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:border-gray-400 dark:focus:bg-gray-700";

  return (
    <DetailsMenu className="relative cursor-pointer">
      <summary
        className={`_no-triangle focus:border-200 flex h-[40px] w-[40px] items-center justify-center rounded-full ${className}`}
      >
        <svg className="hidden h-[24px] w-[24px] dark:inline">
          <use href={`${iconsHref}#moon`} />
        </svg>
        <svg className="h-[24px] w-[24px] dark:hidden">
          <use href={`${iconsHref}#sun`} />
        </svg>
      </summary>
      <DetailsPopup>
        <Form replace action="/_actions/color-scheme" method="post">
          <input
            type="hidden"
            name="returnTo"
            value={location.pathname + location.search}
          />
          <ColorSchemeButton
            svgId="sun"
            label="Light"
            value="light"
            name="colorScheme"
          />
          <ColorSchemeButton
            svgId="moon"
            label="Dark"
            value="dark"
            name="colorScheme"
          />
          <ColorSchemeButton
            svgId="setting"
            label="System"
            value="system"
            name="colorScheme"
          />
        </Form>
      </DetailsPopup>
    </DetailsMenu>
  );
}

let ColorSchemeButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<"button"> & { svgId: string; label: string }
>(({ svgId, label, ...props }, forwardedRef) => {
  let colorScheme = useColorScheme();
  return (
    <button
      {...props}
      ref={forwardedRef}
      disabled={colorScheme === props.value}
      className={cx(
        "flex w-full items-center gap-4 py-1 px-4",
        colorScheme === props.value
          ? "text-blue-brand"
          : "hover:bg-gray-50 active:text-blue-brand dark:hover:bg-gray-700 dark:active:text-blue-brand"
      )}
    >
      <svg className="h-[18px] w-[18px]">
        <use href={`${iconsHref}#${svgId}`} />
      </svg>{" "}
      {label}
    </button>
  );
});

function VersionWarning() {
  let { isLatest, branches, currentGitHubRef } = useLoaderData<typeof loader>();

  if (isLatest) return null;

  let warning = branches.includes(currentGitHubRef)
    ? `Viewing docs for ${currentGitHubRef} branch, not the latest release`
    : `Viewing docs for an older release`;

  return (
    <div className="hidden lg:block">
      <div className="animate-[bounce_500ms_2.5] bg-blue-brand p-2 text-xs text-white">
        {warning}.{" "}
        <Link to="/docs/en/main" className="underline">
          View latest
        </Link>
      </div>
    </div>
  );
}

function HeaderLink({
  className = "",
  href,
  svgId,
  label,
  svgSize,
  title,
}: {
  className?: string;
  href: string;
  svgId: string;
  label: string;
  svgSize: string;
  title?: string;
}) {
  let [width, height] = svgSize.split("x");

  return (
    <a
      href={href}
      className={cx(
        `hidden text-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 md:block`,
        className
      )}
      title={title}
    >
      <span className="sr-only">{label}</span>
      <svg aria-hidden style={{ width: `${width}px`, height: `${height}px` }}>
        <use href={`${iconsHref}#${svgId}`} />
      </svg>
    </a>
  );
}

function NavMenuMobile() {
  let doc = useDoc();
  return (
    <div className="lg:hidden">
      <DetailsMenu className="group relative flex h-full flex-col">
        <summary
          tabIndex={0}
          className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-gray-50 bg-white px-2 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700"
        >
          <div className="flex items-center gap-2">
            <svg aria-hidden className="h-5 w-5 group-open:hidden">
              <use href={`${iconsHref}#chevron-r`} />
            </svg>
            <svg aria-hidden className="hidden h-5 w-5 group-open:block">
              <use href={`${iconsHref}#chevron-d`} />
            </svg>
          </div>
          <div className="whitespace-nowrap font-bold">
            {doc ? doc.attrs.title : "Navigation"}
          </div>
        </summary>
        <div className="absolute h-[66vh] w-full overflow-auto overscroll-contain border-b bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-gray-900 dark:shadow-black">
          <Menu />
        </div>
      </DetailsMenu>
      {/* TODO: Think about mobile search design and add this back. Doesn't currently fit where it used to go now with version selector and dark mode toggle. */}
      {/* <DocSearchSection /> */}
    </div>
  );
}

function NavMenuDesktop() {
  return (
    <div className="fixed top-10 bottom-0 hidden w-72 -translate-x-2 flex-col gap-6 overflow-auto py-12 lg:flex">
      <DocSearchSection />
      <div className="px-1">
        <Menu />
      </div>
    </div>
  );
}

function Menu() {
  let { menu } = useLoaderData<typeof loader>();
  return menu ? (
    <nav>
      <ul>
        {menu.map((category) => (
          <li key={category.attrs.title} className="mb-6">
            <MenuCategoryHeading to={category.hasContent && category.slug}>
              {category.attrs.title}
            </MenuCategoryHeading>
            {category.children.map((doc) => (
              <MenuLink key={doc.slug} to={doc.slug}>
                {doc.attrs.title} {doc.attrs.new && "🆕"}
              </MenuLink>
            ))}
          </li>
        ))}
      </ul>
    </nav>
  ) : (
    <div className="bold text-gray-300 dark:text-gray-400">
      Failed to load menu
    </div>
  );
}

function MenuCategoryHeading({
  children,
  to,
}: {
  children: React.ReactNode;
  to?: string | null | false;
}) {
  let className =
    "flex items-center py-1 mb-2 text-[1rem] leading-[1.125] tracking-wide font-bold rounded-md";
  return to ? (
    <MenuCategoryLink to={to} className={className} children={children} />
  ) : (
    <div className={className} children={children} />
  );
}

function MenuCategoryLink({
  to,
  children,
  className,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  let isActive = useIsActivePath(to);
  return (
    <Link
      prefetch="intent"
      to={to}
      className={cx(
        className,
        "group",
        isActive
          ? "bg-gray-50 font-semibold text-blue-brand dark:bg-gray-800"
          : "text-inherit hover:text-gray-900 active:text-blue-brand dark:hover:text-gray-50 dark:active:text-blue-brand"
      )}
    >
      {children}
    </Link>
  );
}

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  let isActive = useIsActivePath(to);
  return (
    <Link
      prefetch="intent"
      to={to}
      className={cx(
        "group relative my-1 flex items-center rounded-md border-transparent py-1 pl-2 lg:text-sm",
        "transition-colors duration-150 ease-in-out",
        isActive
          ? [
              "font-semibold",
              "text-blue-brand hover:text-blue-700 dark:hover:text-blue-300",
              "bg-blue-50 bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-40",
            ]
          : ["text-gray-700 hover:text-blue-500 dark:text-gray-400"]
      )}
      children={children}
    />
  );
}

function DetailsPopup({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute right-0 z-20 md:left-0">
      <div className="relative top-1 w-40 rounded-lg border border-gray-100 bg-white py-2 shadow-lg dark:border-gray-400 dark:bg-gray-800 ">
        {children}
      </div>
    </div>
  );
}

/**
 * An enhanced `<details>` component that's intended to be used as a menu (a bit
 * like a menu-button).
 */
export let DetailsMenu = React.forwardRef<
  HTMLDetailsElement,
  React.ComponentPropsWithRef<"details">
>(({ ...props }, forwardedRef) => {
  let { onToggle, onMouseDown, onTouchStart, onFocus, open, ...rest } = props;
  let [isOpen, setIsOpen] = React.useState(false);
  let location = useLocation();
  let navigation = useNavigation();
  let clickRef = React.useRef<boolean>(false);
  let focusRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (navigation.state === "submitting") {
      setIsOpen(false);
    }
  }, [navigation.state]);

  React.useEffect(() => {
    setIsOpen(false);
  }, [location.key]);

  React.useEffect(() => {
    if (isOpen) {
      let clickHandler = () => {
        if (!clickRef.current) setIsOpen(false);
        clickRef.current = false;
      };
      let focusHandler = () => {
        if (!focusRef.current) setIsOpen(false);
        focusRef.current = false;
      };
      document.addEventListener("mousedown", clickHandler);
      document.addEventListener("touchstart", clickHandler);
      document.addEventListener("focusin", focusHandler);
      return () => {
        document.removeEventListener("mousedown", clickHandler);
        document.removeEventListener("touchstart", clickHandler);
        document.removeEventListener("focusin", focusHandler);
      };
    }
  }, [isOpen]);

  return (
    <details
      ref={forwardedRef}
      open={open ?? isOpen}
      onToggle={(event) => {
        onToggle && onToggle(event);
        if (event.defaultPrevented) return;
        setIsOpen(event.currentTarget.open);
      }}
      onMouseDown={(event) => {
        onMouseDown && onMouseDown(event);
        if (event.defaultPrevented) return;
        if (isOpen) clickRef.current = true;
      }}
      onTouchStart={(event) => {
        onTouchStart && onTouchStart(event);
        if (event.defaultPrevented) return;
        if (isOpen) clickRef.current = true;
      }}
      onFocus={(event) => {
        onFocus && onFocus(event);
        if (event.defaultPrevented) return;
        if (isOpen) focusRef.current = true;
      }}
      {...rest}
    />
  );
});
DetailsMenu.displayName = "DetailsMenu";

function EditLink() {
  let doc = useDoc();
  let params = useParams();
  let isEditableRef = params.ref === "main" || params.ref === "dev";

  if (!doc || !isEditableRef) {
    return null;
  }

  let repoUrl = "https://github.com/remix-run/react-router";
  // TODO: deal with translations when we add them with params.lang
  let editUrl = `${repoUrl}/edit/${params.ref}/docs/${doc.slug}.md`;

  return (
    <a className="flex items-center gap-1 hover:underline" href={editUrl}>
      Edit
      <svg aria-hidden className="h-4 w-4">
        <use href={`${iconsHref}#edit`} />
      </svg>
    </a>
  );
}

function InnerContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="m-auto w-[90rem] max-w-full px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}

function useDoc(): Doc | null {
  let data = useMatches().slice(-1)[0].data;
  if (!data) return null;
  return data.doc;
}

function useIsActivePath(to: string) {
  let { pathname } = useResolvedPath(to);
  let navigation = useNavigation();
  let currentLocation = useLocation();
  let navigating =
    navigation.state === "loading" && navigation.formData == null;
  let location = navigating ? navigation.location! : currentLocation;
  let match = matchPath(pathname + "/*", location.pathname);
  return Boolean(match);
}
