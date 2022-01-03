import type { MetaFunction } from "remix";
import { Outlet } from "remix";

export let meta: MetaFunction = () => {
  return {
    title: "The Remix Podcast",
    description: "Let's build better websites",
  };
};

export default function PodcastRoute() {
  return (
    <div className="container md:max-w-2xl flex-1 flex flex-col justify-center">
      <Outlet />
    </div>
  );
}
