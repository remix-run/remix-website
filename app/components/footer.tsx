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
    <div
      x-comp="Footer"
      className={
        "px-6 sm:px-8 py-9 text-xs flex justify-between items-center" +
        " " +
        (forceDark ? "text-white " : "text-black dark:text-white ") +
        className
      }
    >
      <div className="flex items-center">
        <Wordmark height={16} />
      </div>
      <div
        className={
          "flex gap-6 " +
          (forceDark ? "text-white" : "text-black dark:text-white")
        }
      >
        <a href="https://github.com/remix-run">
          <GitHub />
        </a>
        <a href="https://twitter.com/remix_run">
          <Twitter />
        </a>
        <a href="https://youtube.com/remix_run">
          <YouTube />
        </a>
      </div>
    </div>
  );
}
