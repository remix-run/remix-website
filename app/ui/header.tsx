import { NavLink } from "~/ui/link";
import { Wordmark } from "~/ui/logo";
import { DetailsMenu, DetailsPopup } from "~/ui/details-menu";
import cx from "clsx";
import iconsHref from "~/icons.svg";
import { href, useNavigate } from "react-router";

export function Header({
  to = "/",
  className = "",
}: {
  to?: string;
  className?: string;
}) {
  let navigate = useNavigate();
  return (
    <header
      className={cx(
        "px-6 py-8 md:px-8 lg:px-12",
        "text-marketing-primary",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between">
        <NavLink
          onContextMenu={(event) => {
            event.preventDefault();
            navigate("/brand");
          }}
          to={to}
          prefetch="intent"
          aria-label="Remix"
        >
          <Wordmark aria-hidden />
        </NavLink>

        <nav className="hidden gap-6 md:flex" aria-label="Main">
          <HeaderLink to="https://v2.remix.run/docs">Docs</HeaderLink>
          <HeaderLink to={href("/blog")}>Blog</HeaderLink>
          <HeaderLink to={href("/jam/2025")}>Jam</HeaderLink>
          <HeaderLink to="https://shop.remix.run" external>
            Store
          </HeaderLink>
        </nav>

        <HeaderMenuMobile className="md:hidden" />
      </div>
    </header>
  );
}

function HeaderMenuMobile({ className = "" }: { className: string }) {
  let baseClasses =
    "bg-gray-100 hover:bg-gray-200 shadow-sm text-marketing-primary [[open]>&]:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:[[open]>&]:bg-gray-700";

  return (
    <DetailsMenu className={cx("relative cursor-pointer", className)}>
      <summary
        className={cx(
          baseClasses,
          "_no-triangle grid h-10 w-10 place-items-center rounded-full",
        )}
      >
        <svg className="h-5 w-5">
          <use href={`${iconsHref}#menu`} />
        </svg>
      </summary>
      <DetailsPopup>
        <nav className="flex flex-col gap-2 px-2 py-2.5">
          <HeaderLink to="https://v2.remix.run/docs">Docs</HeaderLink>
          <HeaderLink to={href("/blog")}>Blog</HeaderLink>
          <HeaderLink to={href("/jam/2025")}>Jam</HeaderLink>
          <HeaderLink to="https://shop.remix.run" external>
            Store
          </HeaderLink>
        </nav>
      </DetailsPopup>
    </DetailsMenu>
  );
}

function HeaderLink({
  to,
  children,
  className = "",
  prefetch = "intent",
  external = false,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: "none" | "intent";
  external?: boolean;
}) {
  return (
    <NavLink
      prefetch={prefetch}
      x-comp="HeaderLink"
      className={cx(
        "text-marketing-primary text-base font-semibold leading-6 tracking-[0.01em] opacity-80 last:mr-0 hover:opacity-100",
        className,
      )}
      to={to}
      children={children}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    />
  );
}
