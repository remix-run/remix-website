import getEmojiRegex from "emoji-regex";
import * as s from "remix/data-schema";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import interBlack from "./inter-black-basic-latin.woff?arraybuffer";
import interRegular from "./inter-regular-basic-latin.woff?arraybuffer";
import socialBackground from "./social-background.png?arraybuffer";
import type { BuildAction } from "remix/fetch-router";
import type { routes } from "../routes";

type ParsedOgImageQuery =
  | { success: true; value: OgImageQuery }
  | { success: false; error: string };

type OgNode = {
  type: string;
  props: {
    style?: Record<string, unknown>;
    children?: OgNode | OgNode[] | string;
    [key: string]: unknown;
  };
};

export let blogOgImageHandler: BuildAction<
  "GET",
  typeof routes.blogOgImage
> = async ({ request }) => {
  let parsedQuery = parseOgImageQuery(request);
  if (!parsedQuery.success) {
    return Response.json({ error: parsedQuery.error }, { status: 400 });
  }

  let svg = await createOgImageSVG(request, parsedQuery.value);
  let pngData;
  try {
    pngData = renderSvgToPng(svg);
  } catch (error) {
    let message = error instanceof Error ? error.message : String(error);
    return new Response(message || "Failed to generate image", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(Uint8Array.from(pngData), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": `max-age=${60 * 60 * 24}`,
    },
  });
};

export function parseOgImageQuery(request: Request): ParsedOgImageQuery {
  let requestUrl = new URL(request.url);
  let searchParams = requestUrl.searchParams;

  let title = searchParams.get("title");
  let displayDate = searchParams.get("date");
  let ogImage = searchParams.get("ogImage");
  let authorNames = searchParams.getAll("authorName");
  let authorTitles = searchParams.getAll("authorTitle");

  if (
    !title ||
    !displayDate ||
    authorNames.length === 0 ||
    authorTitles.length === 0
  ) {
    return { success: false, error: "Missing required params" };
  }
  if (authorNames.length !== authorTitles.length) {
    return {
      success: false,
      error: "Number of authorNames must match number of authorTitles",
    };
  }

  let authors = authorNames.map((name, i) => ({
    name,
    title: authorTitles[i],
    imgSrc: getAuthorImgSrc(requestUrl.origin, name),
  }));

  let result = s.parseSafe(ogImageQuerySchema, {
    title: stripEmojis(title),
    displayDate: stripEmojis(displayDate),
    ogImage: ogImage ?? undefined,
    authors,
  });
  if (!result.success) {
    return { success: false, error: "Invalid params" };
  }

  return { success: true, value: result.value };
}

async function createOgImageSVG(request: Request, data: OgImageQuery) {
  let rootNode = createOgRootNode(request, data);
  return satori(rootNode, {
    width: 2400,
    height: 1256,
    // satori supports TTF/OTF/WOFF. We keep local WOFFs in this route folder.
    fonts: [
      {
        name: PRIMARY_FONT,
        data: interRegular,
        weight: 400,
        style: "normal",
      },
      {
        name: PRIMARY_FONT,
        data: interBlack,
        weight: 900,
        style: "normal",
      },
    ],
  });
}

function createOgRootNode(request: Request, data: OgImageQuery): OgNode {
  let titleSize = data.title.length > 50 ? 110 : 144;
  let siteUrl = new URL(request.url).origin;
  let backgroundStyles =
    data.ogImage !== undefined
      ? {
          backgroundImage: `url(${siteUrl}${data.ogImage})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }
      : {
          backgroundImage: `url("data:image/png;base64,${arrayBufferToBase64(socialBackground)}")`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        };

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        fontFamily: PRIMARY_FONT,
        color: PRIMARY_TEXT_COLOR,
        padding: "144px",
        ...backgroundStyles,
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              width: 1800,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 48,
                    color: PRIMARY_TEXT_COLOR,
                    margin: 0,
                  },
                  children: data.displayDate,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontWeight: "bold",
                    fontSize: titleSize,
                    lineHeight: 1.1,
                    margin: 0,
                    marginTop: 48,
                  },
                  children: data.title,
                },
              },
            ],
          },
        },
        createAuthorsNode(data.authors),
      ],
    },
  };
}

function createAuthorsNode(authors: OgImageAuthor[]): OgNode {
  let picDimensions = authors.length * -40 + 280;
  return {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", gap: 48 },
      children: authors.map(({ name, title, imgSrc }) => ({
        type: "div",
        props: {
          style: {
            display: "flex",
            width: 1600,
            alignItems: "center",
          },
          children: [
            {
              type: "img",
              props: {
                width: picDimensions,
                height: picDimensions,
                alt: "",
                src: imgSrc,
                style: {
                  marginLeft: 0,
                  borderRadius: 9999,
                },
              },
            },
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginLeft: 48,
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        fontWeight: "bold",
                        fontSize: authors.length * -8 + 80,
                      },
                      children: name,
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        color: PRIMARY_TEXT_COLOR,
                        fontSize: 40,
                      },
                      children: title,
                    },
                  },
                ],
              },
            },
          ],
        },
      })),
    },
  };
}

function renderSvgToPng(svg: string): Uint8Array {
  let resvg = new Resvg(svg);
  return resvg.render().asPng();
}

function stripEmojis(value: string): string {
  return value.replace(getEmojiRegex(), "").replace(/\s+/g, " ").trim();
}

function getAuthorImgSrc(siteUrl: string, name: string) {
  let authorNameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");
  return `${siteUrl}/authors/profile-${authorNameSlug}.png`;
}

let PRIMARY_TEXT_COLOR = "#ffffff";
let PRIMARY_FONT = "Inter";

let ogImageAuthorSchema = s.object({
  name: s.string(),
  title: s.string(),
  imgSrc: s.string(),
});

let ogImageQuerySchema = s.object({
  title: s.string(),
  displayDate: s.string(),
  ogImage: s.optional(s.string()),
  authors: s.array(ogImageAuthorSchema),
});

type OgImageAuthor = s.InferOutput<typeof ogImageAuthorSchema>;
type OgImageQuery = s.InferOutput<typeof ogImageQuerySchema>;

// Keep parity with the old OG route, which embedded social-background.png.
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  let bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
