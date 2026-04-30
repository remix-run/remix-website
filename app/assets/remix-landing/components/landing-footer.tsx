import { css, type Handle } from "remix/ui";
import { Wordmark } from "../../../ui/wordmark";
import { assetPaths } from "../../../utils/asset-paths";
import { colors } from "../styles/tokens";

const SOCIAL_LINKS = [
  {
    href: "https://github.com/remix-run/remix",
    label: "GitHub",
    icon: "github",
  },
  {
    href: "https://x.com/remix_run",
    label: "X",
    icon: "x",
  },
  {
    href: "https://www.youtube.com/c/Remix-Run/streams",
    label: "YouTube",
    icon: "youtube",
  },
  {
    href: "https://discord.gg/xwx7mMzVkA",
    label: "Discord",
    icon: "discord",
  },
] as const;

const footerShellStyles = css({
  padding: "40px 24px 24px",
});

const footerContentStyles = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  justifyContent: "flex-end",
  gap: "12px",
});

const brandRowStyles = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "24px",
  width: "100%",
  flexWrap: "wrap",
});

const wordmarkStyles = css({
  display: "block",
  color: colors.fg,
  flexShrink: "0",
});

const socialLinksStyles = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "16px",
});

const socialLinkStyles = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "20px",
  height: "20px",
  color: colors.fg,
  opacity: 1,
});

const socialIconStyles = css({
  display: "block",
  width: "20px",
  height: "20px",
});

const legalStyles = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  justifyContent: "flex-end",
  gap: "12px",
  width: "100%",
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: "400",
  fontSize: "10px",
  lineHeight: "1.6",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  color: colors.fg,
  whiteSpace: "nowrap",
});

const legalTextStyles = css({
  margin: "0",
});

const legalLinkStyles = css({
  color: "inherit",
  textDecoration: "none",
});

export function LandingFooter(_handle: Handle) {
  return () => (
    <footer mix={[footerShellStyles]}>
      <div mix={[footerContentStyles]}>
        <div mix={[brandRowStyles]}>
          <Wordmark
            role="img"
            aria-label="Remix"
            height={8}
            mix={[wordmarkStyles]}
          />
          <div mix={[socialLinksStyles]}>
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                target="_blank"
                rel="noopener noreferrer"
                mix={[socialLinkStyles]}
              >
                <svg aria-hidden="true" mix={[socialIconStyles]}>
                  <use href={`${assetPaths.iconsSprite}#${link.icon}`} />
                </svg>
              </a>
            ))}
          </div>
        </div>
        <div mix={[legalStyles]}>
          <p mix={[legalTextStyles]}>
            Docs and examples{" "}
            <a
              href="https://tlo.mit.edu/understand-ip/exploring-mit-open-source-license-comprehensive-guide#:~:text=The%20license%20originated%20from%20the%20MIT's%20Project,TensorFlow%20*%20React%20*%20jQuery%20*%20Node.js"
              target="_blank"
              rel="noopener noreferrer"
              mix={[legalLinkStyles]}
            >
              licensed under MIT
            </a>
          </p>
          <p mix={[legalTextStyles]}>
            ©{new Date().getFullYear()}{" "}
            <a
              href="https://www.shopify.com/"
              target="_blank"
              rel="noopener noreferrer"
              mix={[legalLinkStyles]}
            >
              Shopify, Inc.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
