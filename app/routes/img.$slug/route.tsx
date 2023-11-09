import { type LoaderFunctionArgs } from "@remix-run/node";
import satori from "satori";
import svg2img from "svg2img";
import { CACHE_CONTROL } from "~/lib/http.server";
import { getDataFromParams, getFont } from "./utils.server";

// Big thanks goes to Jacob Paris' blog outlining how to set this up
// https://www.jacobparis.com/content/remix-og

let primaryTextColor = "#ffffff";
let secondaryTextColor = "#d0d0d0";

let primaryFont = "Inter";
let titleFont = "Inter";

export async function loader({ request }: LoaderFunctionArgs) {
  let requestUrl = new URL(request.url);
  let searchParams = new URLSearchParams(requestUrl.search);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  let { title, displayDate, authors } = getDataFromParams(
    siteUrl,
    searchParams,
  );

  const svg = await satori(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
        fontFamily: primaryFont,
        backgroundImage: `url(${siteUrl}/blog-images/social-background.png)`,
        padding: "125px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1800,
          marginLeft: 144,
        }}
      >
        <p
          style={{
            fontSize: 50,
            color: secondaryTextColor,
            margin: 0,
          }}
        >
          {displayDate}
        </p>
        <h1
          style={{
            fontFamily: titleFont,
            fontWeight: 900,
            color: primaryTextColor,
            fontSize: 144,
            margin: 0,
            marginTop: 32,
          }}
        >
          {title}
        </h1>
      </div>

      <Authors authors={authors} />
    </div>,
    {
      width: 2400,
      height: 1256,
      // Unfortunately satori doesn't support WOFF2 so we have to have a woff version
      fonts: [
        {
          name: titleFont,
          data: await getFont(`${siteUrl}/font/inter-roman-latin-var.woff`),
        },
        {
          name: primaryFont,
          data: await getFont(`${siteUrl}/font/inter-roman-latin-var.woff`),
        },
      ],
    },
  );
  const { data, error } = await new Promise(
    (
      resolve: (value: { data: Buffer | null; error: Error | null }) => void,
    ) => {
      svg2img(svg, (error, buffer) => {
        if (error) {
          resolve({ data: null, error });
        } else {
          resolve({ data: buffer, error: null });
        }
      });
    },
  );
  if (error) {
    return new Response(error.toString(), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
  return new Response(data, {
    headers: {
      "Content-Type": "image/png",
      // May need to adjust this to make it a longer cache since these are just images
      "Cache-Control": CACHE_CONTROL.doc,
    },
  });
}

function Authors({
  authors,
}: {
  authors: ReturnType<typeof getDataFromParams>["authors"];
}) {
  // We will have problems if we have more than 2 authors
  const picDimensions = authors.length * -60 + 380;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {authors.map(({ name, title, imgSrc }) => (
        <div
          style={{
            display: "flex",
            width: 1600,
            marginLeft: 144,
            alignItems: "center",
          }}
          key={name + title}
        >
          <img
            width={picDimensions}
            height={picDimensions}
            // No alt needed, this is all turning into an image
            alt=""
            src={imgSrc}
            style={{
              marginLeft: -40,
              borderRadius: 9999,
            }}
          />
          <h2
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 30,
            }}
          >
            <span
              style={{
                fontFamily: primaryFont,
                color: primaryTextColor,
                fontSize: 70,
                margin: 0,
              }}
            >
              {name}
            </span>
            <span
              style={{
                fontFamily: primaryFont,
                color: secondaryTextColor,
                fontSize: 40,
                margin: 0,
              }}
            >
              {title}
            </span>
          </h2>
        </div>
      ))}
    </div>
  );
}
