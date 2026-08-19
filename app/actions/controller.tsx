import { createController } from "remix/router";

import { routes } from "../routes.ts";
import { assetPaths } from "../utils/public/asset-paths.ts";
import { assets } from "../utils/assets.ts";
import { CACHE_CONTROL } from "../utils/cache-control.ts";
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
      return render(<BrandPage requestUrl={request.url} />, {
        headers: { "Cache-Control": CACHE_CONTROL.DEFAULT },
      });
    },

    home({ render, request }) {
      let requestUrl = new URL(request.url);
      let pageUrl = `${requestUrl.origin}${routes.home.href()}`;
      let previewImage = `${requestUrl.origin}${assetPaths.marketing.defaultOgImage}`;

      return render(
        <HomePage pageUrl={pageUrl} previewImage={previewImage} />,
        {
          headers: { "Cache-Control": CACHE_CONTROL.DEFAULT },
        },
      );
    },

    // Keep healthcheck on a stable path so deploy checks never depend on the
    // rest of the route tree.
    healthcheck() {
      return new Response("OK", {
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    },
  },
});
