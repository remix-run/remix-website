import path from "path";
import fsp from "fs/promises";
import getEmojiRegex from "emoji-regex";
import invariant from "ts-invariant";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_FOLDER_NAME = process.env.CLOUDINARY_FOLDER_NAME;

invariant(
  CLOUDINARY_CLOUD_NAME,
  "process.env.CLOUDINARY_CLOUD_NAME must be set for generating social images"
);
invariant(
  CLOUDINARY_FOLDER_NAME,
  "process.env.CLOUDINARY_FOLDER_NAME must be set for generating social images"
);

function stripEmojis(string: string): string {
  return string.replace(getEmojiRegex(), "").replace(/\s+/g, " ").trim();
}

// cloudinary needs double-encoding
function doubleEncode(s: string) {
  return encodeURIComponent(encodeURIComponent(s));
}

function getCloudinarySocialImageUrl({
  title,
  displayDate,
  authorName,
  authorTitle,
}: SocialImageArgs) {
  // Important: no leading hash for hex values
  let primaryTextColor = "ffffff";
  let secondaryTextColor = "d0d0d0";

  // Custom font files — must be uploaded to cloudinary in the same folder as
  // all of the images
  let primaryFont = "Inter-Medium.woff2";
  let titleFont = "Founders-Grotesk-Bold.woff2";

  let vars = [
    "$th_1256", // image height in pixels
    "$tw_2400", // image width in pixels
    "$gh_$th_div_12", // image height / 12
    "$gw_$tw_div_24", // image width / 24
  ].join(",");

  let templateImage = `${CLOUDINARY_FOLDER_NAME}/social-background.png`;
  let templateImageTransform = [
    "c_fill", // fit rule
    "w_$tw", // width
    "h_$th", // height
  ].join(",");

  let encodedDate = doubleEncode(stripEmojis(displayDate));
  let dateTransform = [
    `co_rgb:${secondaryTextColor}`, // text color
    "c_fit", // fit rule
    "g_north_west", // text box position
    "w_$gw_mul_14", // text box width ($gw * 14)
    "h_$gh", // text box height
    "x_$gw_mul_1.5", // text box x position ($gw * 1.5)
    "y_$gh_mul_1.3", // text box y position ($gh * 1.3)
    `l_text:${CLOUDINARY_FOLDER_NAME}:${primaryFont}_50_bold:${encodedDate}`, // textbox:font:content
  ].join(",");

  let encodedTitle = doubleEncode(stripEmojis(title));
  let titleTransform = [
    `co_rgb:${primaryTextColor}`, // text color
    "c_fit", // fit rule
    "g_north_west", // text box position
    "w_$gw_mul_20.5", // text box width ($gw * 20.5)
    "h_$gh_mul_7", // text box height ($gh * 7)
    "x_$gw_mul_1.5", // text box x position ($gw * 1.5)
    "y_$gh_mul_2.3", // text box y position ($gh * 2.3)
    `l_text:${CLOUDINARY_FOLDER_NAME}:${titleFont}_160:${encodedTitle}`, // textbox:font:content
  ].join(",");

  let encodedAuthorName = doubleEncode(stripEmojis(authorName));
  let authorNameSlug = slugify(stripEmojis(authorName));
  let authorNameTransform = [
    `co_rgb:${primaryTextColor}`, // text color
    `c_fit`, // fit rule
    `g_north_west`, // text box position
    `w_$gw_mul_5.5`, // text box width ($gw * 5.5)
    `h_$gh_mul_4`, // text box height ($gh * 4)
    `x_$gw_mul_4.5`, // text box x position ($gw * 4.5)
    `y_$gh_mul_9`, // text box y position ($gh * 9)
    `l_text:${CLOUDINARY_FOLDER_NAME}:${primaryFont}_70:${encodedAuthorName}`, // textbox:font:content
  ].join(",");

  let encodedAuthorTitle = doubleEncode(stripEmojis(authorTitle));
  let authorTitleTransform = [
    `co_rgb:${secondaryTextColor}`, // text color
    `c_fit`, // fit rule
    `g_north_west`, // text box position
    `w_$gw_mul_9`, // text box width ($gw * 9)
    `x_$gw_mul_4.5`, // text box x position ($gw * 4.5)
    `y_$gh_mul_9.8`, // text box y position ($gh * 9.8)
    `l_text:${CLOUDINARY_FOLDER_NAME}:${primaryFont}_40:${encodedAuthorTitle}`, // textbox:font:content
  ].join(",");

  let authorImageTransform = [
    "c_fit", // fit rule
    "g_north_west", // image position
    `r_max`, // image radius
    "w_$gw_mul_4", // image width ($gw * 4)
    "h_$gh_mul_3", // image height ($gh * 3)
    "x_$gw", // image x position ($gw)
    "y_$gh_mul_8", // image y position ($gh * 8)
    `l_${CLOUDINARY_FOLDER_NAME}:profile-${authorNameSlug}.jpg`, // image filename
  ].join(",");

  return [
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    vars,
    templateImageTransform,
    dateTransform,
    titleTransform,
    authorImageTransform,
    authorNameTransform,
    authorTitleTransform,
    templateImage,
  ].join("/");
}

export async function getSocialImageUrl({
  slug,
  siteUrl,
  ...socialImageArgs
}: { slug: string; siteUrl: string } & SocialImageArgs) {
  let basePath = `blog-images/social/${slug}.jpg`;
  let filePath = path.join(__dirname, "..", "public", basePath);
  if (await fileExists(filePath)) {
    return `${siteUrl}/${basePath}`;
  }
  return getCloudinarySocialImageUrl(socialImageArgs);
}

export async function getImageContentType(imagePath: string) {
  let ext = path.extname(imagePath).toLowerCase();
  if (!ext) return null;
  return `image/${ext.slice(1)}`;
}

interface SocialImageArgs {
  title: string;
  displayDate: string;
  authorName: string;
  authorTitle: string;
}

async function fileExists(filePath: string) {
  try {
    let stat = await fsp.stat(filePath);
    return stat.isFile();
  } catch (_) {
    return false;
  }
}

function slugify(string: string) {
  return string
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");
}
