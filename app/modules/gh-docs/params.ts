import * as semver from "semver";
import iso_639_1, { type LanguageCode } from "iso-639-1";

const CODES = iso_639_1.getAllCodes();

export function validateParams(
  tags: string[],
  branches: string[],
  params: { lang: string; ref?: string; ["*"]?: string },
  lang: string = "en"
): string | null {
  let { lang: first, ref: second, "*": splat } = params;

  let firstIsLang = CODES.includes(first as LanguageCode);
  let secondIsRef =
    second && (tags.includes(second) || branches.includes(second));

  if (firstIsLang) {
    if (!second) {
      return `${first}/${semver.maxSatisfying(tags, "*", {
        includePrerelease: false,
      })}`;
    }

    if (!secondIsRef) {
      let expandedRef = semver.maxSatisfying(tags, second, {
        includePrerelease: false,
      });
      let latest = semver.maxSatisfying(tags, "*");
      let path = [first];

      if (expandedRef) path.push(expandedRef);
      else if (latest) path.push(latest, second);

      if (splat) path.push(splat);
      return path.join("/");
    }
  }

  let ref =
    tags.includes(first) || branches.includes(first)
      ? first
      : semver.maxSatisfying(tags, first, { includePrerelease: false });
  if (ref) {
    let path = [lang, ref];
    if (second) path.push(second);
    if (splat) path.push(splat);
    return path.join("/");
  }

  if (!firstIsLang && !ref) {
    let path = [
      lang,
      semver.maxSatisfying(tags, "*", { includePrerelease: false }),
      first,
    ];
    if (second) path.push(second);
    if (splat) path.push(splat);
    return path.join("/");
  }

  return null;
}
