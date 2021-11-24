import { GitHub, Twitter, YouTube } from "./icons";
import { Wordmark } from "./logo";

export function Footer({
  forceDark,
  className = "",
}: {
  forceDark?: boolean;
  className?: string;
}) {
  return (
    <footer
      x-comp="Footer"
      className={
        "px-6 lg:px-12 py-9 text-d-p-sm flex justify-between items-center" +
        " " +
        (forceDark ? "text-white " : "text-black dark:text-white ") +
        className
      }
    >
      <div className="flex items-center">
        <Wordmark height={16} aria-label="Remix logo" role="img" />
      </div>
      <nav
        className={
          "flex gap-6 " +
          (forceDark ? "text-white" : "text-black dark:text-white")
        }
        aria-label="Find us on the web"
      >
        <a href="https://github.com/remix-run">
          <GitHub aria-hidden />
        </a>
        <a href="https://twitter.com/remix_run">
          <Twitter aria-hidden />
        </a>
        <a href="https://youtube.com/remix_run">
          <YouTube aria-hidden />
        </a>
      </nav>
    </footer>
  );
}
