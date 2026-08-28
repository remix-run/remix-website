import * as os from "node:os";
import * as path from "node:path";
import { createAssetServer, defineFileTransform } from "remix/assets";
import { loadConfig } from "remix/cli";
import { createFsFileStorage } from "remix/file-storage/fs";
import { uiHmr } from "remix/ui-hmr/assets";
import sharp from "sharp";

let nodeEnv = process.env.NODE_ENV ?? "development";
let isDevelopment = nodeEnv === "development";
let isProduction = nodeEnv === "production";
let isHmr = Boolean(isDevelopment && process.env.REMIX_NODE_HMR);
let config = await loadConfig(import.meta.dirname);
if (!config.assets) throw new Error("Missing assets configuration");
if (!config.assets.files) throw new Error("Missing asset file configuration");

let fileCacheKey = process.env.FLY_IMAGE_REF ?? `process-${process.pid}`;
let webpInputExtensions = [".jpeg", ".jpg", ".png"] as const;
let webpTransforms = {
  webp: createWebpTransform(),
  "webp-64": createWebpTransform(64),
  "webp-128": createWebpTransform(128),
  "webp-480": createWebpTransform(480),
  "webp-640": createWebpTransform(640),
  "webp-768": createWebpTransform(768),
  "webp-1200": createWebpTransform(1200),
  "webp-1600": createWebpTransform(1600),
};

export let assets = createAssetServer({
  ...config.assets,
  target: {
    chrome: "109",
    es: "2022",
    firefox: "115",
    safari: "16.4",
  },
  fingerprint: isProduction,
  files: {
    ...config.assets.files,
    cache: createFsFileStorage(path.join(os.tmpdir(), "remix-website-assets")),
    cacheKey: fileCacheKey,
    maxRequestTransforms: 1,
    transforms: webpTransforms,
  },
  sourceMaps: isDevelopment ? "external" : undefined,
  minify: isProduction,
  hmr: isHmr
    ? async () =>
        (await import("remix/node-hmr/runtime")).createBrowserHmrChannel()
    : undefined,
  scripts: {
    define: {
      "process.env.NODE_ENV": JSON.stringify(nodeEnv),
    },
    loaders: isHmr ? [uiHmr()] : undefined,
  },
  watch: isDevelopment,
});

export function getWebpHref(filePath: string, width?: number) {
  let transform = width === undefined ? "webp" : `webp-${width}`;
  if (!Object.hasOwn(webpTransforms, transform)) {
    throw new TypeError(`Unsupported responsive image width: ${width}`);
  }

  return assets.getHref(filePath, {
    transform: [transform as keyof typeof webpTransforms],
  });
}

function createWebpTransform(width?: number) {
  return defineFileTransform({
    extensions: webpInputExtensions,
    async transform(bytes) {
      let image = sharp(bytes).rotate();
      if (width) {
        image.resize({ width, withoutEnlargement: true });
      }

      let content = await image
        .webp({ quality: 80, smartSubsample: true })
        .toBuffer();
      if (!width && content.byteLength >= bytes.byteLength) return bytes;

      return { content, extension: ".webp" };
    },
  });
}
