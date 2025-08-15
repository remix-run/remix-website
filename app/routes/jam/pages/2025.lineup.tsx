import { Navbar } from "../navbar";
import { ScrambleText, Title, Paragraph } from "../text";
import { getMeta } from "~/lib/meta";
import ogImageSrc from "../images/og-thumbnail-1.jpg";

import type { Route } from "./+types/2025.faq";

export function meta({ matches }: Route.MetaArgs) {
  const [rootMatch] = matches;
  const { siteUrl } = rootMatch.data;

  let image = `${siteUrl}${ogImageSrc}`;

  return getMeta({
    title: "Speaker Lineup | Remix Jam 2025",
    description: "Speaker lineup coming soon for Remix Jam 2025",
    siteUrl: `${siteUrl}/jam`,
    image,
  });
}

export default function JamLineupPage() {
  return (
    <>
      <Navbar className="z-40" />
      <main className="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[120px] md:pt-[270px] lg:pt-[280px]">
        <Title className="text-center">
          <ScrambleText
            className="whitespace-nowrap"
            text="Speaker Lineup"
            delay={100}
            charDelay={70}
            cyclesToResolve={8}
            color="blue"
          />
        </Title>

        <div className="relative z-10 text-center">
          <Paragraph className="text-xl text-white/80 md:text-2xl lg:text-3xl">
            Speaker lineup coming soon
          </Paragraph>
        </div>
      </main>
    </>
  );
}
