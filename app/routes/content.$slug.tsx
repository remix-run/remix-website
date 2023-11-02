import { json, type LoaderFunctionArgs } from "@remix-run/node";
import type { SatoriOptions } from "satori";
import satori from "satori";
import svg2img from "svg2img";
import path from "path";
import fs from "fs/promises";

async function readFile(filePath: string) {
  console.log("the path", path.join(__dirname, filePath));
  try {
    const data = await fs.readFile(path.join(__dirname, filePath));
    return data.buffer;
  } catch (err) {
    console.log(err);
    throw new Error("Error reading font");
  }
}

function slugify(string: string) {
  return string
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");
}

// Code for getFont is in the previous section.
// import { getFont } from "./utils";
declare module "react" {
  interface HTMLAttributes<T> {
    tw?: string;
  }
}

async function getFont(
  font: string,
  weights = [100, 300, 500, 700, 900],
  text = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\!@#$%^&*()_+-=<>?[]{}|;:,.`'’\"–—",
) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${font}:wght@${weights.join(
      ";",
    )}&text=${encodeURIComponent(text)}`,
    {
      headers: {
        // Make sure it returns TTF.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    },
  ).then((response) => response.text());
  const resource = css.matchAll(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/g,
  );
  return Promise.all(
    [...resource]
      .map((match) => match[1])
      .map((url) => fetch(url).then((response) => response.arrayBuffer()))
      .map(async (buffer, i) => ({
        name: font,
        style: "normal",
        weight: weights[i],
        data: await buffer,
      })),
  ) as Promise<SatoriOptions["fonts"]>;
}

export async function loader({ request }: LoaderFunctionArgs) {
  let requestUrl = new URL(request.url);
  let searchParams = new URLSearchParams(requestUrl.search);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  let slug = searchParams.get("slug");
  let title = searchParams.get("title");
  let authorName = searchParams.get("authorName");
  let authorTitle = searchParams.get("authorTitle");
  let displayDate = searchParams.get("date");
  let authorNameSlug = slugify(authorName);

  if (!slug || !title || !authorName || !authorTitle || !displayDate) {
    throw json({ error: "Missing required params" }, 400);
  }

  console.table({ siteUrl, slug, title, authorName, authorTitle, displayDate });

  const titleSize = title.length < 40 ? "text-6xl" : "text-5xl";
  // const descriptionInput = params.get("description");
  // const description = decodeURIComponent(descriptionInput || "");
  // const dateInput = params.get("date");
  // invariant(dateInput, "date is required");
  // const date = new Date(decodeURIComponent(dateInput)).toLocaleDateString(
  //   "en-US",
  //   {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //   },
  // );
  // const imgInput = params.get("img") || "null";
  // const img = imgInput !== "null" ? decodeURIComponent(imgInput) : null;

  // sanitize the params
  const svg = await satori(
    // If the blog post doesn't have an image, show the title, description, and date
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
            fontWeight: 500,
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

      <div
        style={{
          display: "flex",
          width: 1600,
          marginLeft: 144,
          alignItems: "center",
        }}
      >
        <img
          width={320}
          height={320}
          alt=""
          src={`${siteUrl}/authors/profile-${authorNameSlug}.png`}
          style={{
            marginLeft: -40,
          }}
        />
        <h2
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 30,
            fontWeight: 500,
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
            {authorName}
          </span>
          <span
            style={{
              fontFamily: "Inter",
              color: "#d0d0d0",
              fontSize: 40,
              margin: 0,
            }}
          >
            {authorTitle}
          </span>
        </h2>
      </div>
    </div>,
    {
      width: 2400,
      height: 1256,
      fonts: [
        {
          name: "Founders Grotesk",
          data: await readFile("../public/font/founders-grotesk-bold.ttf"),
        },
        ...(await getFont("Inter")),
      ],
      // fonts: await Promise.all([
      //   getFont("Inter"),
      //   getFont("Playfair Display"),
      // ]).then((fonts) => fonts.flat()),
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
      "Cache-Control": "max-age=300",
    },
  });
}
