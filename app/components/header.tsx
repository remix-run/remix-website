import { NavLink } from "remix";
import { Wordmark } from "./logo";

export function Header({
  forceDark,
  className = "",
}: {
  forceDark?: boolean;
  className?: string;
}) {
  return (
    <header
      className={
        "px-6 lg:px-12 py-9 flex justify-between items-center" +
        " " +
        (forceDark ? "text-white " : "text-gray-900 dark:text-white ") +
        className
      }
    >
      <NavLink
        onContextMenu={(event) => {
          event.preventDefault();
          window.location.href =
            "https://drive.google.com/drive/u/0/folders/1pbHnJqg8Y1ATs0Oi8gARH7wccJGv4I2c";
        }}
        to="/"
        prefetch="intent"
        aria-label="Remix"
      >
        <Wordmark aria-hidden />
      </NavLink>

      <nav className="flex" aria-label="Main">
        <HeaderLink to="/docs/en/v1" children="Docs" />{" "}
        <HeaderLink
          to="https://github.com/remix-run"
          children="GitHub"
          className="hidden sm:block"
        />
      </nav>
    </header>
  );
}

function HeaderLink({
  to,
  children,
  className = "",
  prefetch = "none",
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: "none" | "intent";
}) {
  let external = to.startsWith("https://");

  if (external) {
    return (
      <a
        x-comp="HeaderLink"
        className={
          "text-d-p-sm mx-2 sm:mx-4 last:mr-0 opacity-80 hover:opacity-100 font-semibold " +
          className
        }
        href={to}
        children={children}
      />
    );
  }

  return (
    <NavLink
      prefetch={prefetch}
      x-comp="HeaderLink"
      className={
        "text-d-p-sm mx-2 sm:mx-4 last:mr-0 opacity-80 hover:opacity-100 " +
        className
      }
      to={to}
      children={children}
    />
  );
}
