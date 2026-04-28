import { Document } from "../ui/document";
import { RemixLandingApp } from "../assets/remix-landing/home-app";
import { CACHE_CONTROL } from "../utils/cache-control";
import { getRequestContext } from "../utils/request-context";
import { render } from "../utils/render";
import { styleHrefs } from "../utils/style-hrefs";

const HOME_TITLE = "Remix - A Web Framework for Building Anything";
const HOME_DESCRIPTION =
  "Remix gives you the power and tools to build anything you can dream of.";

export async function homeHandler() {
  let requestUrl = new URL(getRequestContext().request.url);
  let pageUrl = `${requestUrl.origin}/`;
  let previewImage = `${requestUrl.origin}/blog-images/social-background.png`;

  return render.document(
    <HomePage pageUrl={pageUrl} previewImage={previewImage} />,
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.DEFAULT,
      },
    },
  );
}

function HomePage() {
  return (props: { pageUrl: string; previewImage: string }) => (
    <Document
      title={HOME_TITLE}
      description={HOME_DESCRIPTION}
      forceTheme="dark"
      stylesheets={[styleHrefs.home]}
      headTags={[
        { kind: "meta", property: "og:type", content: "website" },
        {
          kind: "meta",
          property: "og:title",
          content: HOME_TITLE,
        },
        {
          kind: "meta",
          property: "og:description",
          content: HOME_DESCRIPTION,
        },
        { kind: "meta", property: "og:url", content: props.pageUrl },
        {
          kind: "meta",
          property: "og:image",
          content: props.previewImage,
        },
        {
          kind: "meta",
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          kind: "meta",
          name: "twitter:title",
          content: HOME_TITLE,
        },
        {
          kind: "meta",
          name: "twitter:description",
          content: HOME_DESCRIPTION,
        },
        {
          kind: "meta",
          name: "twitter:image",
          content: props.previewImage,
        },
      ]}
    >
      <RemixLandingApp />
    </Document>
  );
}
