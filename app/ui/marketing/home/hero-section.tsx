import heroImageSrc from "/racecar-teaser-hero.webp";

export function HeroSection() {
  return (
    <section className="flex min-h-[540px] flex-col items-center justify-end overflow-hidden px-12 pb-6 md:min-h-[920px] md:pb-12">
      <div className="flex w-full flex-col items-center gap-12 md:gap-24">
        <div className="text-rmx-primary flex w-full flex-col items-start gap-12 md:items-center md:gap-6 md:text-center">
          <h1 className="text-2xl font-bold leading-[1.4] md:text-4xl md:font-semibold md:tracking-tight">
            Remix 3 is under active development
          </h1>
          <p className="text-base leading-[1.6] tracking-wide">
            A new full stack framework built on Web APIs
          </p>
        </div>

        <div className="relative aspect-[1600/367] w-full max-w-[1600px] max-md:-mx-12 max-md:aspect-[480/110] max-md:w-screen max-md:min-w-[480px] max-md:max-w-none">
          <img
            src={heroImageSrc}
            alt=""
            className="pointer-events-none absolute inset-0 size-full object-cover"
            width={1600}
            height={367}
          />
        </div>
      </div>
    </section>
  );
}
