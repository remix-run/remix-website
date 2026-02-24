import cx from "clsx";

let heroImageSrc = "/marketing/racecar-teaser-hero.webp";

export function HeroSection() {
  return () => (
    <section class="flex min-h-[540px] flex-col items-center justify-end overflow-hidden px-12 pb-6 md:min-h-[70vh] md:pb-12 xl:min-h-[80vh]">
      <div class="flex w-full flex-col items-center gap-12 md:gap-24">
        <div
          class={cx(
            "rmx-hero",
            "text-rmx-primary flex w-full flex-col items-start gap-12 md:items-center md:gap-6 md:text-center",
          )}
        >
          <h1 class="rmx-heading-hero">Remix 3 is under active development</h1>
          <p class="rmx-body">A new full stack framework built on Web APIs</p>
        </div>

        <div class="relative aspect-[1600/367] w-full max-w-[1600px] max-md:-mx-12 max-md:aspect-[480/110] max-md:w-screen max-md:min-w-[480px] max-md:max-w-none">
          <img
            src={heroImageSrc}
            alt="Racecar under a black sheet with a Remix 3 logo"
            class="pointer-events-none absolute inset-0 size-full object-cover"
            width={1600}
            height={367}
          />
        </div>
      </div>
    </section>
  );
}
