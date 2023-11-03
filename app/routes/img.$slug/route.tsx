import { json, type LoaderFunctionArgs } from "@remix-run/node";
import satori from "satori";
import svg2img from "svg2img";
import { CACHE_CONTROL } from "~/lib/http.server";
import {
  getAuthorPicUrl,
  getAuthors,
  getFont,
  stripEmojis,
} from "./utils.server";

export async function loader({ request }: LoaderFunctionArgs) {
  let requestUrl = new URL(request.url);
  let searchParams = new URLSearchParams(requestUrl.search);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  let title = searchParams.get("title");
  let displayDate = searchParams.get("date");

  let authors = getAuthors(searchParams);

  if (!title || !displayDate) {
    throw json({ error: "Missing required params" }, 400);
  }

  title = stripEmojis(title);
  displayDate = stripEmojis(displayDate);

  const svg = await satori(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
        fontFamily: "Inter",
        backgroundImage: `url(${siteUrl}/blog-images/social-background.png)`,
        padding: "125px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1600,
          marginLeft: 144,
        }}
      >
        <p
          style={{
            fontSize: 50,
            color: "#d0d0d0",
            margin: 0,
          }}
        >
          {displayDate}
        </p>
        <h1
          style={{
            fontFamily: "Founders Grotesk",
            color: "white",
            fontSize: 160,
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      <Authors siteUrl={siteUrl} authors={authors} />
    </div>,
    {
      width: 2400,
      height: 1256,
      // Unfortunately satori doesn't support WOFF2
      fonts: [
        {
          name: "Founders Grotesk",
          data: await getFont(`${siteUrl}/font/founders-grotesk-bold.woff`),
        },
        {
          name: "Inter",
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
      // May need to adjust this to make it longer
      "Cache-Control": CACHE_CONTROL.doc,
    },
  });
}

function Authors({
  siteUrl,
  authors,
}: {
  siteUrl: string;
  authors: { name: string; title: string }[];
}) {
  // We will have problems if we have more than 2 authors
  const picDimensions = authors.length * -60 + 380;

  console.log({ picDimensions });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {authors.map(({ name, title }) => (
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
            alt=""
            src={getAuthorPicUrl({ siteUrl, name })}
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
                fontFamily: "Inter",
                color: "white",
                fontSize: 70,
                margin: 0,
              }}
            >
              {name}
            </span>
            <span
              style={{
                fontFamily: "Inter",
                color: "#d0d0d0",
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
