import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import getEmojiRegex from "emoji-regex";
import * as s from "remix/data-schema";
import satori from "satori";
import svg2img from "svg2img";

type BlogOgImageContext = {
  params: { slug?: string };
  request: Request;
};

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

export async function blogOgImageHandler(context: BlogOgImageContext) {
  let parsedQuery = parseOgImageQuery(context.request);
  if (!parsedQuery.success) {
    return Response.json({ error: parsedQuery.error }, { status: 400 });
  }

  let svg = await createOgImageSVG(context.request, parsedQuery.value);
  let { data, error } = await svgToPng(svg);
  if (error || !data) {
    return new Response(error?.toString() || "Failed to generate image", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": `max-age=${60 * 60 * 24}`,
    },
  });
}

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
  let { interRegular, interBlack } = await getInterFontData();
  let rootNode = createOgRootNode(request, data);
  return satori(rootNode as any, {
    width: 2400,
    height: 1256,
    // satori supports TTF/OTF/WOFF. We load local WOFFs from @fontsource/inter.
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
          backgroundColor: "#111827",
          backgroundImage:
            "linear-gradient(160deg, rgba(11,17,32,1) 0%, rgba(26,25,53,1) 45%, rgba(56,31,77,1) 100%)",
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

async function svgToPng(svg: string) {
  return new Promise<{ data: Buffer | null; error: Error | null }>(
    (resolve) => {
      svg2img(svg, (error, buffer) => {
        if (error) {
          resolve({ data: null, error });
        } else {
          resolve({ data: buffer, error: null });
        }
      });
    },
  );
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
let require = createRequire(import.meta.url);
let interFontDataPromise:
  | Promise<{ interRegular: ArrayBuffer; interBlack: ArrayBuffer }>
  | undefined;

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

async function getInterFontData() {
  if (!interFontDataPromise) {
    interFontDataPromise = (async () => {
      let regularPath =
        require.resolve("@fontsource/inter/files/inter-latin-400-normal.woff");
      let blackPath =
        require.resolve("@fontsource/inter/files/inter-latin-900-normal.woff");

      let [regularBuffer, blackBuffer] = await Promise.all([
        readFile(regularPath),
        readFile(blackPath),
      ]);

      return {
        interRegular: toArrayBuffer(regularBuffer),
        interBlack: toArrayBuffer(blackBuffer),
      };
    })();
  }
  return interFontDataPromise;
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return Uint8Array.from(buffer).buffer;
}
