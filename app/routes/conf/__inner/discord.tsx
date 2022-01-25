import type { MetaFunction } from "remix";
import { Link } from "remix";
import { primaryButtonLinkClass } from "~/components/buttons";
import { Discord } from "~/components/icons";

export const meta: MetaFunction = () => ({
  title: "Remix Conf Discord Server",
  description: "Much of our coordination happens on Discord.",
});

const channels = [
  {
    name: "conf",
    link: "https://discord.gg/WVUDqPVH8d",
    description: "General chat for the conference happens here. Say hi!",
  },
  {
    name: "conf-activities",
    link: "https://discord.gg/76RmFyD3Gq",
    description: (
      <>
        Coordinating the{" "}
        <Link className="underline" to="../schedule/may-26">
          post-conf activities
        </Link>{" "}
        happens here.
      </>
    ),
  },
];

export default function Speak() {
  return (
    <div>
      <h1 className="font-display text-m-h1 sm:text-d-h2 text-white xl:text-d-j mb-16">
        <a href="https://discord.gg/remix" className="flex items-center gap-4">
          <Discord />
          <span>Remix Conf Discord</span>
        </a>
      </h1>
      <div className="container text-m-p-lg lg:text-d-p-lg text-white flex flex-col gap-4">
        <p>
          <a href="https://discord.gg/remix" className="underline">
            The Remix Discord server
          </a>{" "}
          will be used throughout the conference to keep you up-to-date on
          what's going on with the conference (in addition to it being just a
          cool place to hang out and talk about building awesome web
          experiences).
        </p>
        <ul className="list-disc list-inside">
          {channels.map(({ name, link, description }) => (
            <li key={name}>
              <a className="underline" href={link}>
                #{name}
              </a>
              : {description}
            </li>
          ))}
        </ul>
        <p className="pt-4">Chat it up during the conference!</p>
        <div className="w-full mt-6 text-center">
          <a
            href="https://discord.gg/remix"
            className={`${primaryButtonLinkClass} font-display uppercase flex items-center gap-4`}
          >
            <Discord /> Join the Discord
          </a>
        </div>
      </div>
    </div>
  );
}
