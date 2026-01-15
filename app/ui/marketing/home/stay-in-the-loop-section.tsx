export function StayInTheLoopSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="rounded-2xl border border-black/10 p-8">
          <h2 className="text-sm uppercase tracking-wide opacity-60">
            TODO: Stay in the loop
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-black/5 p-6">
              <div className="text-xs uppercase tracking-wide opacity-60">
                TODO: Newsletter card
              </div>
              <div className="mt-4 h-10 w-full rounded bg-black/10" />
            </div>
            <div className="rounded-xl bg-black/5 p-6">
              <div className="text-xs uppercase tracking-wide opacity-60">
                TODO: Community / Discord card
              </div>
              <div className="mt-4 h-10 w-40 rounded bg-black/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
