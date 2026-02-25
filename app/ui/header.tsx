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
    <header className={cx("p-12", "text-rmx-primary", className)}>
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between">
        <a
          onContextMenu={(event) => {
            event.preventDefault();
            navigate("/brand");
          }}
          href={to}
          aria-label="Remix"
        >
          <Wordmark aria-hidden />
        </a>

        <nav className="hidden gap-6 md:flex" aria-label="Main">
          <HeaderLink to={href("/blog")}>Blog</HeaderLink>
          <HeaderLink to={href("/jam/2025")}>Jam</HeaderLink>
          <HeaderLink to="https://shop.remix.run" external>
            Store
          </HeaderLink>
          <HeaderLink to="https://v2.remix.run/docs">V2 Docs</HeaderLink>
        </nav>

        <HeaderMenuMobile className="md:hidden" />
      </div>
    </header>
  );
}

function HeaderMenuMobile({ className = "" }: { className: string }) {
  let baseClasses =
    "bg-gray-100 hover:bg-gray-200 text-rmx-primary [[open]>&]:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:[[open]>&]:bg-gray-700";

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
          <HeaderLink to={href("/blog")}>Blog</HeaderLink>
          <HeaderLink to={href("/jam/2025")}>Jam</HeaderLink>
          <HeaderLink to="https://shop.remix.run" external>
            Store
          </HeaderLink>
          <HeaderLink to="https://v2.remix.run/docs">V2 Docs</HeaderLink>
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
      className={cx(
        "text-rmx-primary text-base font-semibold leading-6 tracking-[0.01em] opacity-80 last:mr-0 hover:opacity-100",
        className,
      )}
      to={to}
      children={children}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    />
  );
}
