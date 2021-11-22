import { Link } from "remix";
import { Wordmark } from "./logo";
import { Hamburger } from "./icons";

export function Header({
  forceDark,
  className = "",
}: {
  forceDark?: boolean;
  className?: string;
}) {
  return (
    <div
      x-comp="Header"
      className={
        "px-6 lg:px-12 py-9 flex justify-between items-center" +
        " " +
        (forceDark ? "text-white " : "text-gray-900 dark:text-white ") +
        className
      }
    >
      <Link to="/" prefetch="intent">
        <Wordmark />
      </Link>

      <nav className="flex">
        <HeaderLink to="/docs" children="Docs" />{" "}
        <HeaderLink
          to="https://github.com/remix-run"
          children="GitHub"
          className="hidden sm:block"
        />
      </nav>
    </div>
  );
}

function HeaderLink({
  to,
  children,
  className = "",
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  let external = to.startsWith("https://");

  if (external) {
    return (
      <a
        x-comp="HeaderLink"
        className={
          "text-d-p-sm mx-2 sm:mx-4 last:mr-0 opacity-80 hover:opacity-100 " +
          className
        }
        href={to}
        children={children}
      />
    );
  }

  return (
    <Link
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
