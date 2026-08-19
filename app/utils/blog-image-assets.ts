import * as path from "node:path";
import sharp, { type Metadata } from "sharp";

import { assets } from "./assets.ts";

const ROOT_DIR = path.resolve(import.meta.dirname, "../..");
const RESPONSIVE_WIDTHS = [480, 768, 1200, 1600] as const;
const TRANSFORMABLE_EXTENSIONS = new Set([".jpeg", ".jpg", ".png"]);

type WebpTransform =
  | "webp"
  | "webp-480"
  | "webp-768"
  | "webp-1200"
  | "webp-1600";

export interface BlogImageAsset {
  height?: number;
  src: string;
  srcSet?: string;
  width?: number;
}

let assetBySource = new Map<string, Promise<BlogImageAsset>>();

export function getBlogImageAsset(source: string): Promise<BlogImageAsset> {
  let existing = assetBySource.get(source);
  if (existing) return existing;

  let asset = createBlogImageAsset(source);
  assetBySource.set(source, asset);
  return asset;
}

async function createBlogImageAsset(source: string): Promise<BlogImageAsset> {
  if (!source.startsWith("/blog-images/")) return { src: source };

  let pathname = new URL(source, "https://remix.run").pathname;
  let filePath = `public${decodeURIComponent(pathname)}`;
  let extension = path.extname(filePath).toLowerCase();
  let metadata = await sharp(path.join(ROOT_DIR, filePath)).metadata();
  let dimensions = getOrientedDimensions(metadata);

  if (!TRANSFORMABLE_EXTENSIONS.has(extension) || !dimensions.width) {
    return {
      ...dimensions,
      src: await assets.getHref(filePath),
    };
  }

  let sourceWidth = dimensions.width;
  let outputWidths: number[] = RESPONSIVE_WIDTHS.filter(
    (width) => width < sourceWidth,
  );
  if (sourceWidth <= RESPONSIVE_WIDTHS.at(-1)!) {
    outputWidths.push(sourceWidth);
  }

  let variants = await Promise.all(
    outputWidths.map(async (width) => ({
      href: await assets.getHref(filePath, {
        transform: [getWebpTransform(width, sourceWidth)],
      }),
      width,
    })),
  );
  let largest = variants.at(-1);
  if (!largest) {
    return {
      ...dimensions,
      src: await assets.getHref(filePath),
    };
  }

  return {
    ...dimensions,
    src: largest.href,
    srcSet:
      variants.length > 1
        ? variants.map(({ href, width }) => `${href} ${width}w`).join(", ")
        : undefined,
  };
}

function getWebpTransform(width: number, sourceWidth: number): WebpTransform {
  if (width === sourceWidth) return "webp";
  switch (width) {
    case 480:
      return "webp-480";
    case 768:
      return "webp-768";
    case 1200:
      return "webp-1200";
    case 1600:
      return "webp-1600";
    default:
      throw new TypeError(`Unsupported responsive image width: ${width}`);
  }
}

function getOrientedDimensions(metadata: Metadata) {
  let width = metadata.width;
  let height = metadata.pageHeight ?? metadata.height;
  if (
    width &&
    height &&
    metadata.orientation &&
    metadata.orientation >= 5 &&
    metadata.orientation <= 8
  ) {
    [width, height] = [height, width];
  }

  return {
    height,
    width,
  };
}
