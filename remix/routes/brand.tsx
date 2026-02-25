import cx from "clsx";
import type { RemixNode } from "remix/component/jsx-runtime";
import { Document } from "../components/document";
import { Footer } from "../components/home/footer";
import { Header } from "../components/home/header";
import { render } from "../utils/render";
import { CACHE_CONTROL } from "../../shared/cache-control";

export default async function BrandRoute() {
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
      <main class="flex flex-1 flex-col" tabIndex={-1}>
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

let variants = {
  light: {
    bg: "bg-white",
    border: "border-gray-50 dark:border-transparent",
  },
  "light-outline": {
    bg: "bg-white",
    border: "border-gray-50 dark:border-transparent",
  },
  dark: {
    bg: "bg-gray-900",
    border: "border-transparent dark:border-gray-800",
  },
  "dark-outline": {
    bg: "bg-gray-900",
    border: "border-transparent dark:border-gray-800",
  },
  glowing: {
    bg: "bg-gray-900",
    border: "border-transparent dark:border-gray-800",
  },
} as const;

function LogoBox() {
  return (props: { name: "remix-letter" | "remix" }) => (
    <div class="grid grid-cols-1 grid-rows-2 gap-4 gap-x-6 sm:grid-cols-2">
      {Object.entries(variants).map(([variant, { bg, border }]) => (
        <div class="flex flex-col" key={variant}>
          <div
            class={cx(
              "flex h-40 items-center justify-center rounded-lg border-[3px] p-4 md:h-48",
              bg,
              border,
            )}
          >
            <img
              class="h-full max-w-full object-contain"
              src={`/_brand/${props.name}-${variant}.svg`}
              alt={`Remix ${props.name} ${variant}`}
            />
          </div>
          <div class="mt-1 flex items-end gap-4 text-sm text-gray-800 dark:text-gray-100">
            {["svg", "png"].map((format) => (
              <a
                class="uppercase underline opacity-50 hover:opacity-100"
                href={`/_brand/${props.name}-${variant}.${format}`}
                download
                key={format}
              >
                {format}
              </a>
            ))}
          </div>
        </div>
      ))}
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
      <p>
        You may also{" "}
        <a
          href="https://drive.google.com/drive/u/0/folders/1pbHnJqg8Y1ATs0Oi8gARH7wccJGv4I2c"
          class="text-blue-brand hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          download all image files for Remix Logo's in bulk through Google
          Drive.
        </a>
      </p>
      <AssetHeader>Logo</AssetHeader>
      <p>
        Please use the logo with appropriate background. On dark backgrounds use
        the light or glowing logo, and on light backgrounds use the dark logo.
      </p>
      <LogoBox name="remix-letter" />
      <AssetHeader>Logo Word</AssetHeader>
      <p>
        You can also use the full "Remix" logo. This is useful for things like
        hero images, Open Graph images, and other places where you want to use
        the full wordmark.
      </p>
      <LogoBox name="remix" />
    </div>
  );
}
