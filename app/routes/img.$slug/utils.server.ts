import { json } from "@remix-run/node";
import getEmojiRegex from "emoji-regex";

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
export function getDataFromParams(
  siteUrl: string,
  searchParams: URLSearchParams,
) {
  let title = searchParams.get("title");
  let displayDate = searchParams.get("date");

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
    authors,
  };
}

export async function getFont(fontPath: string) {
  let res = await fetch(fontPath);

  try {
    return res.arrayBuffer();
  } catch (err) {
    console.log(err);
    throw new Error("Error reading font");
  }
}
