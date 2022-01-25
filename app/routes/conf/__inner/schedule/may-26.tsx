import { Link, MetaFunction } from "remix";
import { Discord } from "~/components/icons";

export const meta: MetaFunction = () => ({
  title: "May 26th at Remix Conf",
  description:
    "May 26th is the day after the conference. Get together with other conference attendees before heading home.",
});

function getMapsDirections(address: string) {
  const url = new URL("http://maps.google.com/maps");
  url.searchParams.append(
    "saddr",
    "Sheraton Salt Lake City Hotel, 150 West 500 South Salt Lake City, Utah 84101"
  );
  url.searchParams.append("daddr", address);
  return url.toString();
}

type Location = {
  emoji: string;
  name: string;
  link: string;
  description: string;
  address: string;
  discordLink: string;
  walkingDistance: boolean;
};

const locations: Array<Location> = [
  {
    name: "Dave n Busters",
    emoji: "🎮",
    link: "https://www.daveandbusters.com/locations/salt-lake-city",
    description: "Food, drinks, video games, and sports.",
    address: "140 S Rio Grande St, Salt Lake City, UT 84101",
    discordLink:
      "https://discord.com/channels/770287896669978684/935586397350428773",
    walkingDistance: true,
  },
  {
    name: "The Grid",
    emoji: "🏎",
    link: "https://www.thegrid.com/",
    description: "Racing, arcade gaming, live entertainment, and dining.",
    address: "593 S Evermore Ln, Pleasant Grove, UT 84062",
    discordLink:
      "https://discord.com/channels/770287896669978684/935586523473125406",
    walkingDistance: false,
  },
  {
    name: "Snowbird",
    emoji: "⛷",
    link: "https://www.snowbird.com",
    description: `Skiing, Snowboarding, etc. Depends a lot on the weather. May not be enough snow.`,
    address: "9385 S. Snowbird Center Dr. Snowbird, UT 84092",
    discordLink:
      "https://discord.com/channels/770287896669978684/935586906345984060",
    walkingDistance: false,
  },
  {
    name: "Boondocks",
    emoji: "⛳",
    link: "https://draper.boondocks.com/",
    description:
      "Laser tag, arcade, VR, minigolf, bumper boats, go-karts, and food.",
    address: "75 Southfork Dr, Draper, UT 84020",
    discordLink:
      "https://discord.com/channels/770287896669978684/935587117793427496",
    walkingDistance: false,
  },
  {
    name: "Social Axe Throwing",
    emoji: "🔪",
    link: "https://slc.socialaxethrowing.com/slc/",
    description: "If you haven't axe throwing, it's more fun than you think.",
    address: "1154 S 300 W E, Salt Lake City, UT 84101",
    discordLink:
      "https://discord.com/channels/770287896669978684/935587497570877541",
    walkingDistance: true,
  },
  {
    name: "Leonardo Emersive Art",
    emoji: "🎨",
    link: "https://theleonardo.org/exhibits/current-exhibits/art-through-experience/",
    description:
      "Immersive exhibits that bring colors, art, and movement to life through 4k projections. (Tickets must be purchased in advance).",
    address: "209 East 500 South, Suite 301, Salt Lake City, UT 84111",
    discordLink:
      "https://discord.com/channels/770287896669978684/935587662428004372",
    walkingDistance: true,
  },
  {
    name: "Movies at the Gateway",
    emoji: "🍿",
    link: "https://www.megaplextheatres.com/gateway",
    description: "It's a great movie theater. Go watch a movie!",
    address: "400 W 200 S, Salt Lake City, UT 84101",
    discordLink:
      "https://discord.com/channels/770287896669978684/935587789515403285",
    walkingDistance: true,
  },
  {
    name: "Fat Cats",
    emoji: "🎳",
    link: "https://www.fatcatsfun.com/saltlakecity",
    description: "Bowling, arcade, VR, mini-golf, and food.",
    address: "3739 S 900 E, Millcreek, UT 84106",
    discordLink:
      "https://discord.com/channels/770287896669978684/935588005341704212",
    walkingDistance: false,
  },
  {
    name: "Get Out Game",
    emoji: "🧩",
    link: "https://getoutgames.com/escape-room-salt-lake-city/",
    description: "Escape Room (very close to the hotel).",
    address: "202 W 400 S, Salt Lake City, UT 84101",
    discordLink:
      "https://discord.com/channels/770287896669978684/935588244471566366",
    walkingDistance: true,
  },
  {
    name: "The Living Planet",
    emoji: "🐧",
    link: "https://thelivingplanet.com/",
    description: "Aquarium and food.",
    address: "12033 Lone Peak Pkwy, Draper, UT 84020",
    discordLink:
      "https://discord.com/channels/770287896669978684/935588448469934120",
    walkingDistance: false,
  },
  {
    name: "Creekside Park (Disc Golf)",
    emoji: "🥏",
    link: "https://udisc.com/courses/creekside-park-LMk1",
    description: "Disc golf is a blast, even if you've never tried before",
    address: "1592 E Murray Holladay Rd, Holladay, UT 84117",
    discordLink:
      "https://discord.com/channels/770287896669978684/935657377867378798",
    walkingDistance: false,
  },
];

export default function May25Schedule() {
  return (
    <div>
      <strong>Post-conference fun</strong>
      <p>
        This is post-conference day! Get together with other conference
        attendees before heading home. The conference organizers will facilitate
        getting folks together who want to do the same thing and help you know
        fun places to go hang out. Here are some possibilities
      </p>
      <ul className="pt-6 space-y-2">
        {locations.map((location) => (
          <li key={location.address}>
            <span className="pr-2">{location.emoji}</span>
            <a className="underline" href={location.link}>
              {location.name}
            </a>
            <a className="mx-2" href={location.discordLink}>
              <Discord className="inline h-6 w-6" />
            </a>
            {location.description}{" "}
            <a
              target="_blank"
              href={getMapsDirections(`${location.name}, ${location.address}`)}
              title={
                location.walkingDistance
                  ? "Walking directions"
                  : "Bus/Car directions"
              }
            >
              {location.walkingDistance ? "🚶" : "🚌"}
            </a>
          </li>
        ))}
      </ul>
      <p className="pt-10">
        We'll use{" "}
        <Link className="underline" to="/conf/discord">
          the Discord server
        </Link>{" "}
        to help get people together who want to participate in the same
        activities. Let us know if you have any other ideas!
      </p>
    </div>
  );
}
