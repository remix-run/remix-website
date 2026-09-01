import * as path from "node:path";
import type { Metadata } from "sharp";
import { createMatcher } from "remix/route-pattern/match";

import { assets, getWebpHref } from "./assets.ts";
import { sharp, withNativeImageOperation } from "./native-image.ts";

let imageSourceMatcher = createMatcher("http(s)://remix.run/:directory/*path");

export interface BlogImageAsset {
  fullSrc?: string;
  height?: number;
  src: string;
  srcSet?: string;
  width?: number;
}

let authorAssetBySource = new Map<string, Promise<BlogImageAsset>>();
let blogAssetBySource = new Map<string, Promise<BlogImageAsset>>();

export function getAuthorImageAsset(source: string): Promise<BlogImageAsset> {
  let existing = authorAssetBySource.get(source);
  if (existing) return existing;

  let asset = createImageAsset(source, "authors", [64, 128]);
  authorAssetBySource.set(source, asset);
  return asset;
}

export function getBlogImageAsset(source: string): Promise<BlogImageAsset> {
  let existing = blogAssetBySource.get(source);
  if (existing) return existing;

  let asset = createImageAsset(
    source,
    "blog-images",
    [480, 640, 768, 1200, 1600],
  );
  blogAssetBySource.set(source, asset);
  return asset;
}

async function createImageAsset(
  source: string,
  directory: "authors" | "blog-images",
  responsiveWidths: readonly number[],
): Promise<BlogImageAsset> {
  let fallback: BlogImageAsset = { src: source };

  try {
    let match = imageSourceMatcher.match(source, {
      baseURL: "https://remix.run",
    });
    if (match?.params.directory !== directory) return fallback;

    let filePath = path.join("public", directory, match.params.path);
    let extension = path.extname(filePath).toLowerCase();
    let [metadata, originalSrc] = await Promise.all([
      withNativeImageOperation(() =>
        sharp(path.resolve(import.meta.dirname, "../..", filePath)).metadata(),
      ),
      assets.getHref(filePath),
    ]);
    let dimensions = getOrientedDimensions(metadata);
    fallback = { ...dimensions, src: originalSrc };

    if (![".jpeg", ".jpg", ".png"].includes(extension) || !dimensions.width) {
      return fallback;
    }

    let sourceWidth = dimensions.width;
    let outputWidths = responsiveWidths.filter((width) => width < sourceWidth);
    if (sourceWidth <= responsiveWidths.at(-1)!) {
      outputWidths.push(sourceWidth);
    }

    let variants = await Promise.all(
      outputWidths.map(async (width) => ({
        href: await getWebpHref(
          filePath,
          width === sourceWidth ? undefined : width,
        ),
        width,
      })),
    );
    let largest = variants.at(-1);
    if (!largest) return fallback;

    return {
      ...dimensions,
      fullSrc: directory === "blog-images" ? originalSrc : undefined,
      src: largest.href,
      srcSet:
        variants.length > 1
          ? variants.map(({ href, width }) => `${href} ${width}w`).join(", ")
          : undefined,
    };
  } catch (error) {
    console.error(
      `Failed to optimize image "${source}"; using its original source.`,
      error,
    );
    return fallback;
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
