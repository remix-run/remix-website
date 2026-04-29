import cx from "clsx";
import type { RemixNode } from "remix/component/jsx-runtime";
import { Document } from "../ui/document";
import { Footer } from "../ui/footer";
import { Header } from "../ui/header";
import { render } from "../utils/render";
import { CACHE_CONTROL } from "../utils/cache-control";

export async function brandHandler() {
  return render.document(<Page />, {
    headers: {
      "Cache-Control": CACHE_CONTROL.DEFAULT,
    },
  });
}

function Page() {
  return () => (
    <Document
      title="Remix Assets and Branding Guidelines"
      description="Remix brand assets and guidelines for using the Remix name and logos."
    >
      <Header />
      <main id="main-content" class="flex flex-1 flex-col" tabIndex={-1}>
        <BrandPage />
      </main>
      <Footer />
    </Document>
  );
}

function AssetHeader() {
  return (props: { children: RemixNode }) => (
    <h2 class="text-xl font-extrabold md:text-3xl dark:text-gray-200">
      {props.children}
    </h2>
  );
}

type BrandAssetFormat = "svg" | "png";

type BrandAsset = {
  title: string;
  fileBase: string;
  previewTheme: "light" | "dark";
  formats: readonly [BrandAssetFormat, ...BrandAssetFormat[]];
};

let previewThemes = {
  light: {
    bg: "bg-white",
    border: "border-gray-50 dark:border-transparent",
  },
  dark: {
    bg: "bg-gray-900",
    border: "border-transparent dark:border-gray-800",
  },
} as const;

let logoAssets = [
  {
    title: "Logo, light mode",
    fileBase: "remix-logo-light-mode",
    previewTheme: "light",
    formats: ["svg", "png"],
  },
  {
    title: "Logo, dark mode",
    fileBase: "remix-logo-dark-mode",
    previewTheme: "dark",
    formats: ["svg", "png"],
  },
  {
    title: "Racing logo, light mode",
    fileBase: "remix-logo-racing-light-mode",
    previewTheme: "light",
    formats: ["svg", "png"],
  },
  {
    title: "Racing logo, dark mode",
    fileBase: "remix-logo-racing-dark-mode",
    previewTheme: "dark",
    formats: ["svg", "png"],
  },
] satisfies BrandAsset[];

let wordmarkAssets = [
  {
    title: "Wordmark, light mode",
    fileBase: "remix-wordmark-light-mode",
    previewTheme: "light",
    formats: ["svg", "png"],
  },
  {
    title: "Wordmark, dark mode",
    fileBase: "remix-wordmark-dark-mode",
    previewTheme: "dark",
    formats: ["svg", "png"],
  },
  {
    title: "Racing wordmark, light mode",
    fileBase: "remix-wordmark-racing-light-mode",
    previewTheme: "light",
    formats: ["svg", "png"],
  },
  {
    title: "Racing wordmark, dark mode",
    fileBase: "remix-wordmark-racing-dark-mode",
    previewTheme: "dark",
    formats: ["png"],
  },
  {
    title: "Color wordmark",
    fileBase: "remix-wordmark-color",
    previewTheme: "light",
    formats: ["svg", "png"],
  },
] satisfies BrandAsset[];

let socialAssets = [
  {
    title: "Default Open Graph image",
    fileBase: "remix-run-share-thumbnail",
    previewTheme: "light",
    formats: ["png"],
  },
] satisfies BrandAsset[];

function AssetGrid() {
  return (props: { assets: readonly BrandAsset[] }) => (
    <div class="not-prose grid grid-cols-1 gap-4 gap-x-6 sm:grid-cols-2">
      {props.assets.map((asset) => {
        let { bg, border } = previewThemes[asset.previewTheme];
        let primaryFormat = asset.formats[0];

        return (
          <div class="flex flex-col" key={asset.fileBase}>
            <div
              class={cx(
                "flex h-40 items-center justify-center rounded-lg border-[3px] p-4 md:h-48",
                bg,
                border,
              )}
            >
              <img
                class="h-full max-w-full object-contain"
                src={`/_brand/${asset.fileBase}.${primaryFormat}`}
                alt={`Remix ${asset.title}`}
              />
            </div>
            <div class="mt-1 flex items-end gap-4 text-sm text-gray-800 dark:text-gray-100">
              <span class="mr-auto font-medium">{asset.title}</span>
              {asset.formats.map((format) => (
                <a
                  class="uppercase underline opacity-50 hover:opacity-100"
                  href={`/_brand/${asset.fileBase}.${format}`}
                  download
                  key={format}
                >
                  {format}
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BrandPage() {
  return () => (
    <div class="prose container flex max-w-full flex-col gap-8 text-base sm:text-lg lg:max-w-4xl">
      <h1 class="text-2xl font-extrabold md:text-5xl dark:text-gray-200">
        Remix Brand
      </h1>
      <p>
        These assets are provided for use in situations like articles and video
        tutorials.
      </p>
      <AssetHeader>Trademark Usage Agreement</AssetHeader>
      <p>The Remix name and logos are trademarks of Shopify Inc.</p>
      <p>
        You may not use the Remix name or logos in any way that could mistakenly
        imply any official connection with or endorsement of Shopify Inc. Any
        use of the Remix name or logos in a manner that could cause customer
        confusion is not permitted.
      </p>
      <p>
        Additionally, you may not use our trademarks for t-shirts, stickers, or
        other merchandise without explicit written consent.
      </p>
      <AssetHeader>Logo</AssetHeader>
      <p>
        Please use the logo with an appropriate background. The light-mode
        assets are designed for light backgrounds, and the dark-mode assets are
        designed for dark backgrounds.
      </p>
      <AssetGrid assets={logoAssets} />
      <AssetHeader>Wordmark</AssetHeader>
      <p>
        You can also use the full "Remix" logo. This is useful for things like
        hero images, Open Graph images, and other places where you want to use
        the full wordmark.
      </p>
      <AssetGrid assets={wordmarkAssets} />
      <AssetHeader>Share Image</AssetHeader>
      <p>
        Use the default Open Graph image for social previews when a page does
        not have a more specific image.
      </p>
      <AssetGrid assets={socialAssets} />
    </div>
  );
}
