import { Twitter } from "./icons";

export type TweetData = {
  href: string;
  name: string;
  username: string;
  title: string;
  body: string;
  avatar: string;
};

export let tweets: TweetData[] = [
  {
    href: "https://twitter.com/elrickvm/status/1458918740918251524",
    username: "elrickvm",
    name: "Elrick Ryan",
    title: "Fullstack Dev, Frontside",
    body: "Remix is going to put developers on the Hot Path to build accessible, scaleable, and performant apps, that have stellar user experiences and amazing developer ergonomics. It's not only going to be a win for developers, but also a big win for the end-users!",
    avatar: "/img/elrick.jpg",
  },
  {
    href: "https://twitter.com/jkup/status/1456360115205033989",
    username: "jkup",
    name: "Jon Kuperman",
    title: "Cloudflare",
    body: "holy sh** Remix is good",
    avatar: "/img/jkup.jpg",
  },
  {
    href: "https://twitter.com/aweary/status/1456399484473200644",
    username: "aweary",
    name: "Brandon Dail",
    title: "Discord, prev React Core",
    body: "I just rewrote my first Remix app on top of Cloudflare Workers and Supabase and it’s so damn good",
    avatar: "/img/aweary.jpg",
  },
  {
    href: "https://twitter.com/sergiodxa/status/1400503400802959361",
    username: "sergiodxa",
    name: "Sergio Xalambrí",
    title: "Daffy, prev Vercel",
    body: "What’s really cool with Remix loaders is that you can do most of your data transformation and calculations there, like check if a list is empty, limit the number of records, only send specific attributes, so your React component just receives the data and renders it, no logic needed",
    avatar: "/img/sergio.jpg",
  },
  {
    href: "https://twitter.com/theflyingcoder1/status/1456407168291278851",
    username: "theflyingcoder1",
    name: "Tom Rowe",
    title: "Fullstack Developer",
    body: "In my opinion @remix_run will be game changer for corporate teams hesitant to adopt full stack JavaScript. The core concepts are so intuitive you can pick it up in a day, and it will even integrate into your existing stack.",
    avatar: "/img/tom.jpg",
  },
  {
    href: "https://twitter.com/meindertsmajens/status/1454393707604680711",
    username: "meindertsmajens",
    name: "Jens Meindertsma",
    title: "Web Developer",
    body: "Building with @remix_run has been awesome so far. Having used Next.js for applications for years, the nested layouts are a wonderful feature. I also haven't learned this much about the web in years.",
    avatar: "/img/jens.jpg",
  },
  {
    href: "https://twitter.com/cammchenry/status/1447267585456812039",
    username: "cammchenry",
    name: "Cameron McHenry",
    title: "Web Developer",
    body: "I love using @remix_run for my website.  Remix has improved my productivity as a front-end developer by empowering me to seamlessly switch between front-end and back-end code.",
    avatar: "/img/cammchenry.jpg",
  },
  {
    href: "https://twitter.com/airuyi/status/1456438853804298244",
    username: "airuyi",
    name: "Fergus Meiklejohn",
    title: "App Developer",
    body: "If you're doing #webdevelopment you should check out Remix 🔥 It's a new (old) paradigm for web dev, which simplifies our code, especially state management😅, speeds up our page loads, and gives us a mental model and framework we can rely on to create our best work",
    avatar: "/img/airuyi.jpg",
  },
];

export function Avatar({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <div className={"h-12 w-12" + " " + className}>
      <img src={src} className="object-cover rounded-full" />
    </div>
  );
}

export function TweetCarousel({ tweets }: { tweets: TweetData[] }) {
  return (
    <div className="max-w-max mx-auto">
      <div className="__carousel flex overflow-x-scroll gap-6 md:pb-4">
        {tweets.map((tweet, index) => (
          <div
            key={index}
            className="__slide flex-shrink-0 p-8 sm:p-10 w-[80vw] md:w-[45vw] xl:w-[30rem] bg-gray-800 text-white rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <Avatar src={tweet.avatar} />
                <div>
                  <a
                    href={tweet.href}
                    className="block text-m-h3 md:text-m-h3 font-display"
                  >
                    @{tweet.username}
                  </a>
                  <div className="text-m-p-sm lg:text-d-p-sm">
                    {tweet.title}
                  </div>
                </div>
              </div>
              <a href={tweet.href} className="block">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
            <div className="h-6" />
            <div className="text-m-p-sm xl:text-d-p-sm text-gray-200">
              {tweet.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BigTweet({ tweet }: { tweet: TweetData }) {
  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-center gap-4 text-white">
        <div className="flex">
          <Avatar src={tweet.avatar} className="relative z-10" />
          <Twitter className="h-12 w-12 text-white relative -left-4" />
        </div>
        <div>
          <a
            href={tweet.href}
            target="_blank"
            className="block text-m-h3 md:text-d-h3 font-display"
          >
            {tweet.name}
          </a>
          <div className="text-m-p-lg md:text-d-lg uppercase">
            {tweet.title}
          </div>
        </div>
      </div>
      <div className="h-10" />
      <div className="text-center text-m-p-lg leading-6 md:text-d-p-lg">
        {tweet.body}
      </div>
    </div>
  );
}
