import { createController } from "remix/router";

import { routes } from "../routes.ts";
import { assetPaths } from "../utils/public/asset-paths.ts";
import { assets } from "../utils/assets.ts";
import { CACHE } from "../utils/cache-control.ts";
import { getNewsletterSubscriptionStatus } from "./newsletter/subscription.tsx";
import { LandingNewsletterSubscribeForm } from "./public/remix-landing/components/feature-section.tsx";
import { blogOgImageAction } from "./blog-og-image.tsx";
import { BrandPage } from "./brand.tsx";
import { HomePage } from "./home.tsx";

export default createController(routes, {
  actions: {
    async assets({ request }) {
      let response = await assets.fetch(request);
      return response ?? new Response("Not found", { status: 404 });
    },

    blogOgImage: blogOgImageAction,

    brand({ render, request }) {
      return render(<BrandPage requestUrl={request.url} />);
    },

    home({ render, request }) {
      let requestUrl = new URL(request.url);
      let pageUrl = `${requestUrl.origin}${routes.home.href()}`;
      let previewImage = `${requestUrl.origin}${assetPaths.marketing.defaultOgImage}`;

      return render(<HomePage pageUrl={pageUrl} previewImage={previewImage} />);
    },

    homeNewsletterSignup({ render, request }) {
      return render(
        <LandingNewsletterSubscribeForm
          status={getNewsletterSubscriptionStatus(request)}
        />,
        { headers: { "Cache-Control": CACHE.PRIVATE } },
      );
    },

    // Keep healthcheck on a stable path so deploy checks never depend on the
    // rest of the route tree.
    healthcheck() {
      return new Response("OK", {
        headers: {
          "Cache-Control": CACHE.PRIVATE,
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    },
  },
});
