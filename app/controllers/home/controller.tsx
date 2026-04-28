import { routes } from "../../routes";
import { CACHE_CONTROL } from "../../utils/cache-control";
import { getRequestContext } from "../../utils/request-context";
import { render } from "../../utils/render";
import { HomePage } from "./page";

const HOME_PREVIEW_IMAGE_PATH = "/blog-images/social-background.png";

export async function homeHandler() {
  let requestUrl = new URL(getRequestContext().request.url);
  let pageUrl = `${requestUrl.origin}${routes.home.href()}`;
  let previewImage = `${requestUrl.origin}${HOME_PREVIEW_IMAGE_PATH}`;

  return render.document(
    <HomePage pageUrl={pageUrl} previewImage={previewImage} />,
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.DEFAULT,
      },
    },
  );
}
