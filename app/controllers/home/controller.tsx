import { routes } from "../../routes.ts";
import { assetPaths } from "../../utils/asset-paths.ts";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import type { AppContext } from "../../middleware/render.ts";
import { HomePage } from "./page.tsx";

export async function homeHandler({ render, request }: AppContext) {
  let requestUrl = new URL(request.url);
  let pageUrl = `${requestUrl.origin}${routes.home.href()}`;
  let previewImage = `${requestUrl.origin}${assetPaths.marketing.defaultOgImage}`;

  return render(<HomePage pageUrl={pageUrl} previewImage={previewImage} />, {
    headers: {
      "Cache-Control": CACHE_CONTROL.DEFAULT,
    },
  });
}
