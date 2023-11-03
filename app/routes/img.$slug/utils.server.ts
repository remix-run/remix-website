import { json } from "@remix-run/node";
import getEmojiRegex from "emoji-regex";

export function stripEmojis(string: string): string {
  return string.replace(getEmojiRegex(), "").replace(/\s+/g, " ").trim();
}

export async function getFont(fontPath: string) {
  const res = await fetch(fontPath);

  try {
    return res.arrayBuffer();
  } catch (err) {
    console.log(err);
    throw new Error("Error reading font");
  }
}

export function getAuthorPicUrl({
  siteUrl,
  name,
}: {
  siteUrl: string;
  name: string;
}) {
  const authorNameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");

  return `${siteUrl}/authors/profile-${authorNameSlug}.png`;
}

export function getAuthors(searchParams: URLSearchParams) {
  let authorNames = searchParams.getAll("authorName");
  let authorTitles = searchParams.getAll("authorTitle");

  if (authorNames.length === 0 || authorTitles.length === 0) {
    throw json({ error: "Missing required params" }, 400);
  }

  if (authorNames.length !== authorTitles.length) {
    throw json(
      { error: "Number of authorNames must match number of authorTitles" },
      400,
    );
  }

  return authorNames.map((name, i) => ({ name, title: authorTitles[i] }));
}
