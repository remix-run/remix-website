import { css, type Handle, type MixInput } from "remix/ui";
import { theme } from "remix/ui/theme";
import { routes } from "../routes.ts";
import { assetPaths } from "../utils/asset-paths.ts";
import { Wordmark } from "./wordmark.tsx";

type FooterProps = {
  mix?: MixInput<HTMLElement>;
};

export function Footer(handle: Handle<FooterProps>) {
  return () => (
    <footer aria-label="Site footer" mix={[footerStyle, handle.props.mix]}>
      <div mix={footerTopStyle}>
        <a
          href={routes.home.href()}
          aria-label="Remix"
          mix={footerBrandLinkStyle}
        >
          <Wordmark height={12} aria-hidden />
        </a>
        <nav aria-label="Find us on the web" mix={footerSocialNavStyle}>
          <a
            href="https://github.com/remix-run"
            aria-label="GitHub"
            mix={footerSocialLinkStyle}
          >
            <svg aria-hidden="true" fill="none" mix={footerSocialIconStyle}>
              <use href={`${assetPaths.iconsSprite}#github`} />
            </svg>
          </a>
          <a
            href="https://x.com/remix_run"
            aria-label="X"
            mix={footerSocialLinkStyle}
          >
            <svg aria-hidden="true" fill="none" mix={footerSocialIconStyle}>
              <use href={`${assetPaths.iconsSprite}#x`} />
            </svg>
          </a>
          <a
            href="https://youtube.com/remix_run"
            aria-label="YouTube"
            mix={footerSocialLinkStyle}
          >
            <svg aria-hidden="true" fill="none" mix={footerSocialIconStyle}>
              <use href={`${assetPaths.iconsSprite}#youtube`} />
            </svg>
          </a>
          <a
            href="https://discord.gg/xwx7mMzVkA"
            aria-label="Remix"
            mix={footerSocialLinkStyle}
          >
            <svg aria-hidden="true" fill="none" mix={footerSocialIconStyle}>
              <use href={`${assetPaths.iconsSprite}#discord`} />
            </svg>
          </a>
        </nav>
      </div>

      <div mix={footerLegalStyle}>
        <p>docs and examples licensed under mit</p>
        <p>©{new Date().getFullYear()} Shopify, Inc.</p>
      </div>
    </footer>
  );
}

let footerStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
  padding: "48px 24px 144px",
  color: theme.colors.text.muted,
  "& a": {
    color: "inherit",
    opacity: 0.8,
    textDecoration: "none",
    transition: "opacity 150ms ease",
  },
  "& a:hover": {
    opacity: 1,
  },
  "& a:focus-visible": {
    outline: "2px solid currentColor",
    outlineOffset: "4px",
  },
  "@media (min-width: 1024px)": {
    paddingInline: "48px",
  },
});

let footerTopStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "24px",
});

let footerBrandLinkStyle = css({
  display: "inline-flex",
  alignItems: "center",
});

let footerSocialNavStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "24px",
});

let footerSocialLinkStyle = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

let footerSocialIconStyle = css({
  width: "20px",
  height: "20px",
});

let footerLegalStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  fontFamily: theme.fontFamily.mono,
  fontSize: "10px",
  lineHeight: "1.6",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
});
