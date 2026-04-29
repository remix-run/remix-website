# Remix Homepage Performance Follow-Ups

This note tracks performance work for the Remix 3 homepage. It focuses on changes that are likely to improve load time, scroll smoothness, or main-thread stability without changing the visual direction of the page.

## Highest-Value Remaining Ideas

### 1. Narrow scroll-linked re-render scope

`app/assets/remix-landing/landing-enhancements.tsx` updates `morphValue`, `currentScrollY`, model loading, nav state, section nav, logo state, package logos, labels, and particle props from one scroll RAF.

That is convenient, but it means a scroll tick re-renders the whole enhancement tree. The next meaningful scroll perf win is to split responsibilities so only the parts that actually depend on each value update:

- Keep `ParticleCanvas` driven by `morphValue`.
- Keep `ScrollLogo` responsible for its own local scroll progress.
- Keep nav components driven by the rounded active section.
- Consider using small refs or direct DOM/CSS variable writes for purely visual scroll effects that do not need a full component diff.

This is more architectural than the earlier allocation cleanup, but it is probably the largest remaining main-thread opportunity.

### 2. Revisit the loading media format

The runner GIF is now much smaller, but GIF is still not an ideal animated image format. If we want to push further:

- Try animated WebP or AVIF alongside the GIF fallback.
- Keep the current GIF as the compatibility fallback.
- Use a `<picture>` only if the added markup and test surface are worth the extra savings.

Because the optimized GIF is only 11 KB, this is no longer urgent.

## Smaller Cleanup Candidates

- Move the `package-logos` to `feature-section` coupling away from `id="full-stack-panel"` and toward explicit ownership of the measured panel element or rect.
- Consider caching `LANDING_SECTION_IDS` element references after hydration and invalidating them only when layout changes, rather than repeatedly using `document.getElementById`.
- Consider converting repeated keyboard target checks into a shared local helper across `LandingNav` and `RemixLandingEnhancements` if those modules continue to grow.

## Verification Plan

For each substantial follow-up:

- Run `pnpm run typecheck`.
- Run focused `oxlint` on touched files.
- Check the homepage in the dev server for hydration errors.
- Test scroll from top to bottom and back.
- Test keyboard paths: section arrows, nav shortcuts, Konami sequence, and `F` for FPS.
- For performance-sensitive changes, capture before/after Chrome Performance traces with CPU throttling and watch for long tasks, GC pauses, and raster/paint spikes.
