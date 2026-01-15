import { getMeta } from "~/lib/meta";
import {
  HeroSection,
  IntroMaskReveal,
  PitchSection,
  StayInTheLoopSection,
  TimelineSection,
} from "~/ui/marketing/home";
import type { Route } from "./+types/home";

export function meta({ matches }: Route.MetaArgs) {
  let { siteUrl } = matches[0].loaderData;
  let title = "Remix";
  let image = undefined;
  let description = "TODO: 2026 homepage meta description";

  return getMeta({ title, description, siteUrl, image });
}

export default function HomePage() {
  return (
    <div className="marketing-home">
      <IntroMaskReveal />
      <HeroSection />
      <PitchSection />
      <TimelineSection />
      <StayInTheLoopSection />
    </div>
  );
}
