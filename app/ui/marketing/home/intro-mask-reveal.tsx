export function IntroMaskReveal() {
  return (
    <div
      x-comp="IntroMaskReveal"
      aria-hidden="true"
      // Placeholder: this will become the CSS-first 1s mask reveal overlay.
      className="pointer-events-none fixed inset-0 z-50 hidden"
    >
      <div className="grid h-full w-full place-items-center bg-black">
        <div className="h-12 w-12 rounded-full bg-white/20" />
      </div>
    </div>
  );
}
