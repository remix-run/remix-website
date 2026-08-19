import * as os from "node:os";
import * as path from "node:path";
import { createAssetServer, defineFileTransform } from "remix/assets";
import { createFsFileStorage } from "remix/file-storage/fs";
import { uiHmr } from "remix/ui-hmr/assets";
import sharp from "sharp";

let nodeEnv = process.env.NODE_ENV ?? "development";
let isDevelopment = nodeEnv === "development";
let isProduction = nodeEnv === "production";
let isHmr = Boolean(isDevelopment && process.env.REMIX_NODE_HMR);
let rootDir = path.resolve(import.meta.dirname, "../..");
let buildId = isProduction ? getBuildId() : undefined;
let webpInputExtensions = [".jpeg", ".jpg", ".png"] as const;

export let assets = createAssetServer({
  basePath: "/assets",
  rootDir,
  fileMap: {
    "/app/*path": "app/*path",
    "/blog-images/*path": "public/blog-images/*path",
    "/npm/*path": "node_modules/*path",
  },
  allowFiles: ["app/routes.ts", "app/**/public/**", "public/blog-images/**"],
  allowPackages: ["remix", "three", "fathom-client"],
  denyFiles: ["app/**/*.test.*"],
  target: {
    chrome: "109",
    es: "2022",
    firefox: "115",
    safari: "16.4",
  },
  fingerprint: buildId ? { buildId } : undefined,
  files: {
    cache: createFsFileStorage(
      path.join(
        os.tmpdir(),
        "remix-website-assets",
        buildId
          ? Buffer.from(buildId).toString("base64url")
          : `process-${process.pid}`,
      ),
    ),
    extensions: [".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"],
    maxRequestTransforms: 1,
    transforms: {
      webp: createWebpTransform(),
      "webp-480": createWebpTransform(480),
      "webp-768": createWebpTransform(768),
      "webp-1200": createWebpTransform(1200),
      "webp-1600": createWebpTransform(1600),
    },
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

function createWebpTransform(width?: number) {
  return defineFileTransform({
    extensions: webpInputExtensions,
    async transform(bytes) {
      let image = sharp(bytes).rotate();
      if (width) {
        image.resize({ width, withoutEnlargement: true });
      }

      let content = await image
        .webp({ quality: 85, smartSubsample: true })
        .toBuffer();
      if (!width && content.byteLength >= bytes.byteLength) return bytes;

      return { content, extension: ".webp" };
    },
  });
}

function getBuildId() {
  let buildId = process.env.ASSET_BUILD_ID || process.env.FLY_IMAGE_REF;
  if (!buildId) {
    throw new Error(
      "ASSET_BUILD_ID or FLY_IMAGE_REF is required for production asset fingerprinting",
    );
  }
  return buildId;
}
