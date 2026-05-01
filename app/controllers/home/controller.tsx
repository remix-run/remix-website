import { routes } from "../../routes.ts";
import { assetPaths } from "../../utils/asset-paths.ts";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { getRequestContext } from "../../utils/request-context.ts";
import { render } from "../../utils/render.ts";
import { HomePage } from "./page.tsx";

export async function homeHandler() {
  let requestUrl = new URL(getRequestContext().request.url);
  let pageUrl = `${requestUrl.origin}${routes.home.href()}`;
  let previewImage = `${requestUrl.origin}${assetPaths.marketing.defaultOgImage}`;

  return render.document(
    <HomePage pageUrl={pageUrl} previewImage={previewImage} />,
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.DEFAULT,
      },
    },
  );
}
