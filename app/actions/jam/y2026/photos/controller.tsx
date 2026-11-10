import { createController } from "remix/router";

import { getPhotos } from "../../../../data/jam-storefront.ts";
import { routes } from "../../../../routes.ts";
import { CACHE } from "../../../../utils/cache-control.ts";
import { renderJam2026Page } from "../controller.tsx";
import { findPhotoViewerState, parsePhotoSlug } from "../photo-lookup.ts";

export default createController(routes.jam.y2026.photos, {
  actions: {
    show({ params, render, request }) {
      let photo = parsePhotoSlug(params.photo);
      if (photo === null) {
        return renderJam2026Page({ render, request, status: 400 });
      }

      return renderJam2026Page({ photo, render, request });
    },

    async download({ params, request }) {
      let slug = parsePhotoSlug(params.photo);
      if (slug === null) return textResponse("Invalid photo", 400);

      let viewer = findPhotoViewerState(
        await getPhotos("remix-jam-2026"),
        slug,
      );
      if (!viewer) return textResponse("Photo not found", 404);

      // The original upload, at full resolution.
      let upstream = await fetch(viewer.photo.url, { signal: request.signal });
      if (!upstream.ok || !upstream.body) {
        return textResponse("Unable to download photo", 502);
      }

      return new Response(upstream.body, {
        headers: {
          "Cache-Control": CACHE.RESOURCE,
          "Content-Type": upstream.headers.get("Content-Type") ?? "image/jpeg",
          "Content-Disposition": `attachment; filename="${viewer.photo.filename.replace(/"/g, "")}"`,
        },
      });
    },
  },
});

function textResponse(body: string, status: number) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
