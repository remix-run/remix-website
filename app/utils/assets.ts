import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  createAssetServer,
  createFsFileCache,
  defineFileTransform,
} from "remix/assets";
import { loadConfig } from "remix/cli";
import { componentHmr } from "remix/component-hmr/assets";
import sharp from "sharp";

let nodeEnv = process.env.NODE_ENV ?? "development";
let isDevelopment = nodeEnv === "development";
let isProduction = nodeEnv === "production";
let isHmr = Boolean(isDevelopment && process.env.REMIX_NODE_HMR);
let config = await loadConfig(import.meta.dirname);
if (!config.assets) throw new Error("Missing assets configuration");
if (!config.assets.files) throw new Error("Missing asset file configuration");
let rootDir = config.assets.rootDir;

// The Docker image ships a transform cache filled at build time (see
// `warm-image-cache.ts`), so production points both values at it. Elsewhere
// keys are per process, so each process gets its own directory: the built-in
// cache supports one instance per directory, and test workers and dev servers
// otherwise race on shared files.
let fileCacheDirectory =
  process.env.ASSET_FILE_CACHE_DIR ?? createProcessFileCacheDirectory();
let fileCacheKey = process.env.ASSET_FILE_CACHE_KEY ?? `process-${process.pid}`;
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
    cache: createFsFileCache({
      directory: fileCacheDirectory,
      // Keys ignore the requested fingerprint and transforms take no params,
      // so entries are capped at served images × transforms (1,192 today).
      // Staying above that keeps requests from evicting build-time entries.
      maxEntries: 4096,
      maxFileSize: 16 * 1024 * 1024,
      maxTotalSize: 512 * 1024 * 1024,
    }),
    cacheKey: fileCacheKey,
    maxRequestTransforms: 1,
    transforms: webpTransforms,
  },
  sourceMaps: isDevelopment ? "external" : undefined,
  minify: isProduction,
  hmr: isHmr
    ? {
        channel: createAppBrowserHmrChannel,
        moduleImporter: "remix/multiple-import-maps-polyfill",
      }
    : undefined,
  scripts: {
    define: {
      "process.env.NODE_ENV": JSON.stringify(nodeEnv),
    },
    loaders: isHmr ? [componentHmr()] : undefined,
  },
  watch: isDevelopment,
});

async function createAppBrowserHmrChannel() {
  let channel = await (
    await import("remix/node-hmr/runtime")
  ).createBrowserHmrChannel();
  let postsDirectory = path.join(rootDir, "data/posts");
  let postFilePaths = new Set(
    readdirSync(postsDirectory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => path.join(postsDirectory, entry.name)),
  );

  channel.updateWatchedFiles({ add: [...postFilePaths], remove: [] });
  channel.onFileEvents(async (events) => {
    let files = events
      .map((event) => event.filePath)
      .filter((filePath) => postFilePaths.has(filePath));

    return files.length > 0 ? [{ type: "reload", files }] : [];
  });

  return channel;
}

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

function createProcessFileCacheDirectory() {
  let directory = mkdtempSync(path.join(os.tmpdir(), "remix-website-assets-"));
  process.once("exit", () => {
    rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}
