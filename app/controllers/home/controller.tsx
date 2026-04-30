import { routes } from "../../routes";
import { assetPaths } from "../../utils/asset-paths";
import { CACHE_CONTROL } from "../../utils/cache-control";
import { getRequestContext } from "../../utils/request-context";
import { render } from "../../utils/render";
import { HomePage } from "./page";

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
