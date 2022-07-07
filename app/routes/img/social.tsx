import { json, LoaderFunction } from "@remix-run/node";
import {
  getSocialImageUrl,
  getImageContentType,
} from "~/utils/social-image.server";

export let loader: LoaderFunction = async ({ request }) => {
  let siteUrl = new URL(request.url).host;
  let searchParams = new URLSearchParams(new URL(request.url).search);

  let slug = searchParams.get("slug");
  let title = searchParams.get("title");
  let authorName = searchParams.get("authorName");
  let authorTitle = searchParams.get("authorTitle");
  let displayDate = searchParams.get("date");

  if (!slug || !title || !authorName || !authorTitle || !displayDate) {
    throw json({ error: "Missing required params" }, 400);
  }

  let socialImageUrl = await getSocialImageUrl({
    slug,
    siteUrl,
    title,
    authorName,
    authorTitle,
    displayDate,
  });

  try {
    let contentType = await getImageContentType(socialImageUrl);
    if (!contentType) {
      throw json({ error: "Invalid image" }, 400);
    }
    let resp = await fetch(socialImageUrl, {
      headers: {
        "Content-Type": contentType,
      },
    });
    if (resp.status >= 300) {
      throw resp;
    }
    return resp;
  } catch (err) {
    throw Error(
      "Error fetching the social image; this is likely an error in the img/social route loader"
    );
  }
};

interface LoaderData {
  url: string;
  alt: string;
}

export type { LoaderData as SocialImageLoaderData };
