import { json } from "@remix-run/node";
import getEmojiRegex from "emoji-regex";
import satori from "satori";
import interRegular from "./inter-regular-basic-latin.woff?arraybuffer";
import interBlack from "./inter-black-basic-latin.woff?arraybuffer";
import { Wordmark } from "~/ui/logo";

// Big thanks goes to Jacob Paris' blog outlining how to set this up
// https://www.jacobparis.com/content/remix-og

let primaryTextColor = "#ffffff";
let secondaryTextColor = "#d0d0d0";

let primaryFont = "Inter";

export async function createOgImageSVG(request: Request) {
  let requestUrl = new URL(request.url);
  let searchParams = new URLSearchParams(requestUrl.search);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  let { title, displayDate, authors, ogImage } = getDataFromParams(
    siteUrl,
    searchParams,
  );

  let backgroundImage: string;
  if (ogImage) {
    backgroundImage = `url(${siteUrl}${ogImage})`;
  } else {
    let socialBackground = await import("./social-background.png?arraybuffer");
    let base64 = arrayBufferToBase64(socialBackground.default);
    backgroundImage = `url("data:image/png;base64,${base64}")`;
  }

  return satori(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
        fontFamily: primaryFont,
        color: primaryTextColor,
        backgroundImage,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        padding: "144px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1800,
        }}
      >
        <div
          style={{
            fontSize: 48,
            color: secondaryTextColor,
            margin: 0,
          }}
        >
          {displayDate}
        </div>
        <div
          style={{
            fontWeight: "bold",
            fontSize: 144,
            lineHeight: 1.1,
            margin: 0,
            marginTop: 48,
          }}
        >
          {title}
        </div>
      </div>

      <Authors authors={authors} />
    </div>,
    {
      width: 2400,
      height: 1256,
      // Unfortunately satori doesn't support WOFF2 so we have to have a woff version
      fonts: [
        {
          name: primaryFont,
          data: interRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: primaryFont,
          data: interBlack,
          weight: 900,
          style: "normal",
        },
      ],
    },
  );
}

// Taken from https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function stripEmojis(string: string): string {
  return string.replace(getEmojiRegex(), "").replace(/\s+/g, " ").trim();
}

function getAuthorImgSrc(siteUrl: string, name: string) {
  let authorNameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");

  return `${siteUrl}/authors/profile-${authorNameSlug}.png`;
}

/**
 * Extracts the data needed for the og image from the params. Throws a 400 error if
 * any anything is wrong
 */
function getDataFromParams(siteUrl: string, searchParams: URLSearchParams) {
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
    throw json({ error: "Missing required params" }, 400);
  }

  if (authorNames.length !== authorTitles.length) {
    throw json(
      { error: "Number of authorNames must match number of authorTitles" },
      400,
    );
  }

  let authors = authorNames.map((name, i) => ({
    name,
    title: authorTitles[i],
    imgSrc: getAuthorImgSrc(siteUrl, name),
  }));

  return {
    title: stripEmojis(title),
    displayDate: stripEmojis(displayDate),
    ogImage,
    authors,
  };
}

function Authors({
  authors,
}: {
  authors: ReturnType<typeof getDataFromParams>["authors"];
}) {
  // We will have problems if we have more than 2 authors
  const picDimensions = authors.length * -40 + 280;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        {authors.map(({ name, title, imgSrc }) => (
          <div
            style={{
              display: "flex",
              width: 1600,
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
                marginLeft: 0,
                borderRadius: 9999,
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginLeft: 48,
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: authors.length * -8 + 80,
                }}
              >
                {name}
              </div>
              <div
                style={{
                  color: secondaryTextColor,
                  fontSize: 40,
                }}
              >
                {title}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Wordmark
        style={{
          width: 480,
          height: 120,
          opacity: 0.25,
          marginBottom: authors.length * -32 + 96,
        }}
      />
    </div>
  );
}
