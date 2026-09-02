import { css, type Handle, type RemixNode } from "remix/ui";
import { Document } from "../ui/document.tsx";
import { Footer } from "../ui/footer.tsx";
import { Header } from "../ui/header.tsx";
import {
  marketingPageStyle,
  pageBodyStyle,
  pageMetaStyle,
  pageTitleSmallStyle,
  pageTitleStyle,
} from "../ui/public/marketing-styles.ts";
import { breakpointMedia, theme } from "../ui/public/theme.ts";
import { getSocialHeadTags } from "../utils/social-head-tags.ts";

export function BrandPage(handle: Handle<{ requestUrl: string }>) {
  return () => (
    <Document
      title="Remix Assets and Branding Guidelines"
      description="Remix brand assets and guidelines for using the Remix name and logos."
      headTags={getSocialHeadTags({
        requestUrl: handle.props.requestUrl,
        title: "Remix Assets and Branding Guidelines",
        description:
          "Remix brand assets and guidelines for using the Remix name and logos.",
      })}
    >
      <Header />
      <main id="main-content" mix={brandMainStyle} tabIndex={-1}>
        <BrandPageContent />
      </main>
      <Footer />
    </Document>
  );
}

function AssetHeader(handle: Handle<{ children: RemixNode }>) {
  return () => (
    <h2 mix={[pageTitleStyle, pageTitleSmallStyle, brandHeadingStyle]}>
      {handle.props.children}
    </h2>
  );
}

const BRAND_ASSETS_ZIP = "/_brand/remix-brand-assets.zip";

type BrandAssetFormat = "svg" | "png";

type BrandAsset = {
  title: string;
  fileBase: string;
  previewTheme: "light" | "dark";
  formats: readonly [BrandAssetFormat, ...BrandAssetFormat[]];
};

let previewThemes = {
  light: css({
    borderColor: "light-dark(#f7f7f7, transparent)",
    backgroundColor: "#ffffff",
    backgroundImage:
      "linear-gradient(45deg, #e8e8e8 25%, transparent 25%), linear-gradient(-45deg, #e8e8e8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8e8e8 75%), linear-gradient(-45deg, transparent 75%, #e8e8e8 75%)",
    backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0",
    backgroundSize: "24px 24px",
  }),
  dark: css({
    borderColor: "light-dark(transparent, #383838)",
    backgroundColor: "#181818",
    backgroundImage:
      "linear-gradient(45deg, #242424 25%, transparent 25%), linear-gradient(-45deg, #242424 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #242424 75%), linear-gradient(-45deg, transparent 75%, #242424 75%)",
    backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0",
    backgroundSize: "24px 24px",
  }),
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

function AssetGrid(handle: Handle<{ assets: readonly BrandAsset[] }>) {
  return () => (
    <div mix={assetGridStyle}>
      {handle.props.assets.map((asset) => {
        let primaryFormat = asset.formats[0];

        return (
          <div mix={assetStyle} key={asset.fileBase}>
            <div mix={[assetPreviewStyle, previewThemes[asset.previewTheme]]}>
              <img
                mix={assetImageStyle}
                src={`/_brand/${asset.fileBase}.${primaryFormat}`}
                alt={`Remix ${asset.title}`}
              />
            </div>
            <div mix={assetFormatsStyle}>
              {asset.formats.map((format) => (
                <a
                  mix={[pageMetaStyle, assetFormatLinkStyle]}
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

function BrandPageContent() {
  return () => (
    <div mix={[pageBodyStyle, marketingPageStyle, brandPageContentStyle]}>
      <h1 mix={[pageTitleStyle, brandHeadingStyle]}>Remix Brand</h1>
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
      <AssetHeader>Download Assets</AssetHeader>
      <p>You can download a zip file containing all the Remix brand assets:</p>
      <p>
        <a href={BRAND_ASSETS_ZIP} mix={brandDownloadLinkStyle} download>
          Remix Brand Assets
        </a>
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
    </div>
  );
}

let brandMainStyle = css({ display: "flex", flex: 1, flexDirection: "column" });

let brandHeadingStyle = css({ color: theme.colors.text.primary });

let assetGridStyle = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "16px 24px",
  [breakpointMedia.sm]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
});

let assetStyle = css({ display: "flex", flexDirection: "column" });

let assetPreviewStyle = css({
  display: "flex",
  height: "160px",
  alignItems: "center",
  justifyContent: "center",
  borderStyle: "solid",
  borderWidth: "3px",
  borderRadius: "8px",
  padding: "32px",
  [breakpointMedia.md]: { height: "192px", padding: "40px" },
});

let assetImageStyle = css({
  height: "100%",
  maxWidth: "100%",
  objectFit: "contain",
});

let assetFormatsStyle = css({
  display: "flex",
  alignItems: "flex-end",
  gap: "16px",
  marginTop: "4px",
  color: "light-dark(#383838, #e3e3e3)",
});

let assetFormatLinkStyle = css({
  opacity: 0.5,
  textDecorationLine: "underline",
  "&:hover": { opacity: 1 },
});

let brandPageContentStyle = css({
  boxSizing: "border-box",
  width: "100%",
  maxWidth: "100%",
  marginInline: "auto",
  paddingInline: "24px",
  lineHeight: 1.6,
  "& > p": { margin: "0 0 16px" },
  "& > h1, & > h2": { margin: "40px 0 16px" },
  "& > h1:first-child": { margin: "0 0 64px" },
  [breakpointMedia.md]: { paddingInline: "32px" },
  [breakpointMedia.lg]: { maxWidth: "896px", paddingInline: "40px" },
});

let brandDownloadLinkStyle = css({
  textDecorationLine: "underline",
  "&:hover": { color: "#f44250" },
});
