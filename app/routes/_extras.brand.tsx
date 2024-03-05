import type { MetaFunction } from "@remix-run/node";
import type { FC } from "react";
import cx from "clsx";
import { getMeta } from "~/lib/meta";

export const meta: MetaFunction = () => {
  return getMeta({
    title: "Remix Assets and Branding Guidelines",
    description:
      "Remix brand assets and guidelines for using the Remix name and logos.",
  });
};

export default function Brand() {
  return (
    <div className="prose container flex max-w-full flex-col gap-8 text-base sm:text-lg lg:max-w-4xl">
      <h1 className="text-2xl font-extrabold dark:text-gray-200 md:text-5xl">
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
          content="Google drive containing all image files for Remix Logo\'s"
          href="https://drive.google.com/drive/u/0/folders/1pbHnJqg8Y1ATs0Oi8gARH7wccJGv4I2c"
          className="text-blue-brand hover:underline"
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
      <LogoBox name="remix-letter" Logo={LogoRemixLetter} />
      <AssetHeader>Logo Word</AssetHeader>
      <p>
        You can also use the full "Remix" logo. This is useful for things like
        hero images, Open Graph images, and other places where you want to use
        the full wordmark.
      </p>
      <LogoBox name="remix" Logo={LogoRemix} />
    </div>
  );
}

function AssetHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-extrabold dark:text-gray-200 md:text-3xl">
      {children}
    </h2>
  );
}

interface LogoProps {
  highlight: string;
  outline?: string;
}

// Tailwind classnames for the various ways we style the individual
// component pieces of each LogoBox variant
let variants = {
  light: {
    bg: "bg-white",
    border: "border-gray-50 dark:border-transparent",
    highlight: "fill-black-brand",
    outline: "black",
  },
  "light-outline": {
    bg: "bg-white",
    border: "border-gray-50 dark:border-transparent",
    highlight: "fill-transparent",
    outline: "black",
  },
  dark: {
    bg: "bg-gray-900",
    border: "border-transparent dark:border-gray-800",
    highlight: "fill-white",
    outline: "white",
  },
  "dark-outline": {
    bg: "bg-gray-900",
    border: "border-transparent dark:border-gray-800",
    highlight: "fill-transparent",
    outline: "white",
  },
  glowing: {
    bg: "bg-gray-900",
    border: "border-transparent dark:border-gray-800",
    highlight: "fill-white",
    outline: "glow",
  },
};

function LogoBox({
  name,
  Logo,
}: {
  name: "remix-letter" | "remix";
  Logo: FC<LogoProps>;
}) {
  return (
    <div className="grid grid-cols-1 grid-rows-2 gap-4 gap-x-6 sm:grid-cols-2">
      {Object.entries(variants).map(
        ([variant, { bg, border, highlight, outline }]) => (
          <div className="flex flex-col" key={variant}>
            <div
              className={cx(
                "flex h-40 items-center justify-center rounded-lg border-[3px] p-4 md:h-48",
                bg,
                border,
              )}
            >
              <Logo highlight={highlight} outline={outline} />
            </div>
            <div className="mt-1 flex items-end gap-4 text-sm text-gray-800 dark:text-gray-100">
              {["svg", "png"].map((format) => (
                <a
                  className="uppercase underline opacity-50 hover:opacity-100"
                  href={`/_brand/${name}-${variant}.${format}`}
                  download={true}
                  key={format}
                >
                  {format}
                </a>
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function LogoRemixLetter({ highlight, outline }: LogoProps) {
  if (outline === "glow") {
    return <GlowingLogoRemixLetter />;
  }

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 800 800"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M589.94 527.613L589.939 527.595L589.937 527.577C587.275 499.813 578.691 478.677 564.403 463.234C552.056 449.888 535.585 440.94 515.372 435.566C569.234 424.272 608 379.587 608 313.42C608 266.703 592.597 228.492 561.505 201.997C530.461 175.543 484.047 161 422.456 161H195H193V163V259.41V261.41H195H399.889C426.723 261.41 446.529 267.174 459.586 277.401C472.568 287.57 479.13 302.347 479.13 321.011C479.13 342.372 472.531 356.69 459.665 365.785C446.642 374.991 426.849 379.109 399.889 379.109H195H193V381.109V479.634V481.634H195H355.883H393.871C415.216 481.634 431.143 484.652 442.233 493.952C453.278 503.214 459.967 519.095 461.833 545.957L461.834 545.965L461.834 545.972C464.673 582.864 464.317 601.111 463.975 618.633L463.975 618.648L463.975 618.658C463.865 624.303 463.756 629.89 463.756 636V638H465.756H592.201H594.201V636C594.201 608.005 594.201 582.331 589.94 527.613Z"
        stroke={outline}
        strokeWidth="4"
        className={highlight}
      />
      <path
        d="M193 636V638H195H355.878H357.878V636V588.994C357.878 583.787 356.609 576.706 352.266 570.874C347.847 564.941 340.428 560.553 328.697 560.553H195H193V562.553V636Z"
        stroke={outline}
        strokeWidth="4"
        className={highlight}
      />
    </svg>
  );
}

function LogoRemix({ highlight, outline }: LogoProps) {
  if (outline === "glow") {
    return <GlowingLogoRemix />;
  }
  return (
    <svg
      className="w-full"
      viewBox="0 0 1200 627"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M289.128 342.216H228V305.876H306.122C316.64 305.876 324.744 304.272 330.231 300.362C335.796 296.398 338.494 290.199 338.494 281.489C338.494 273.772 335.778 267.468 330.271 263.121C324.8 258.803 316.704 256.517 306.122 256.517H228V221H314.836C338.367 221 355.822 226.601 367.381 236.526C378.917 246.433 384.716 260.764 384.716 278.535C384.716 304.983 368.506 322.098 346.66 324.956L346.593 326.928C355.892 328.802 363.157 332.384 368.348 338.039C373.537 343.69 376.745 351.51 377.747 362.033C379.337 382.607 379.385 392.578 379.387 403.065H332.56C332.57 401.087 332.605 399.232 332.642 397.347C332.774 390.493 332.912 383.332 331.811 368.898C331.077 358.26 328.423 351.49 323.615 347.427C318.828 343.382 312.125 342.216 303.798 342.216H289.128Z"
        stroke={outline}
        strokeWidth="2"
        className={highlight}
      />
      <path
        d="M228 403.065V376.483H278.63C282.656 376.483 284.968 377.969 286.308 379.781C287.686 381.645 288.126 383.983 288.126 385.772V403.065H228Z"
        stroke={outline}
        strokeWidth="2"
        className={highlight}
      />
      <path
        d="M822.173 404.745L871.656 340.074L872.111 339.481L871.67 338.877L826.173 276.524H875.555L896.701 307.043L897.512 308.214L898.338 307.053L920.063 276.524H965.929L920.2 336.819L919.745 337.418L920.195 338.021L970.006 404.745H920.635L895.143 369.826L894.336 368.72L893.528 369.826L868.036 404.745H822.173Z"
        stroke={outline}
        strokeWidth="2"
        className={highlight}
      />
      <path
        d="M662.17 297.446L662.985 299.693L664.013 297.535C670.797 283.297 685.797 272.411 707.159 272.411C724.722 272.411 735.916 278.508 742.759 287.807C749.643 297.161 752.236 309.906 752.236 323.383V404.135H707.29V335.938C707.29 327.032 706.505 320.003 703.792 315.191C702.417 312.752 700.547 310.88 698.059 309.629C695.584 308.385 692.557 307.784 688.902 307.784C684.851 307.784 681.416 308.616 678.551 310.225C675.683 311.835 673.442 314.191 671.735 317.153C668.341 323.042 667.037 331.36 667.037 341.193V404.135H622.091V335.938C622.091 327.024 621.232 319.993 618.442 315.18C617.029 312.743 615.123 310.875 612.611 309.627C610.111 308.385 607.068 307.784 603.413 307.784C595.39 307.784 589.839 311.174 586.357 317.149C582.927 323.036 581.548 331.353 581.548 341.193V404.135H536.602V275.915H581.548V294.477L583.447 294.915C590.216 280.991 603.751 272.411 622.829 272.411C634.122 272.411 642.604 275.002 648.92 279.386C655.235 283.769 659.472 290.005 662.17 297.446Z"
        stroke={outline}
        strokeWidth="2"
        className={highlight}
      />
      <path
        d="M523.156 358.992C519.749 373.128 512.378 384.135 501.82 391.668C490.977 399.405 476.704 403.526 459.765 403.526C439.244 403.526 421.75 397.311 409.399 386.05C397.058 374.798 389.766 358.435 389.766 337.956C389.766 297.344 419.453 268.298 459.185 268.298C480.532 268.298 496.774 275.652 507.684 287.289C518.605 298.937 524.258 314.957 524.258 332.409V344.547H434.553H433.478L433.556 345.619C434.153 353.893 437.453 360.073 442.508 364.171C447.545 368.254 454.234 370.197 461.504 370.197C467.986 370.197 473.391 369.085 477.756 366.599C481.951 364.21 485.109 360.596 487.342 355.661L523.156 358.992ZM434.142 322.633L433.981 323.773H435.133H480.63H481.681L481.629 322.724C481.329 316.69 479.23 311.05 475.346 306.907C471.449 302.749 465.817 300.167 458.606 300.167C450.849 300.167 445.14 302.581 441.154 306.674C437.189 310.745 435.03 316.374 434.142 322.633Z"
        stroke={outline}
        strokeWidth="2"
        className={highlight}
      />
      <path
        d="M814.538 405H769.592V276.78H814.538V405ZM814.828 223.056V262.517H769.302V223.056H814.828Z"
        stroke={outline}
        strokeWidth="2"
        className={highlight}
      />
    </svg>
  );
}

function GlowingLogoRemixLetter() {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 800 800"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_dd_126_53)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M587.947 527.768C592.201 582.418 592.201 608.036 592.201 636H465.756C465.756 629.909 465.865 624.337 465.975 618.687C466.317 601.123 466.674 582.807 463.828 545.819C460.067 491.667 436.748 479.634 393.871 479.634H355.883H195V381.109H399.889C454.049 381.109 481.13 364.633 481.13 321.011C481.13 282.654 454.049 259.41 399.889 259.41H195V163H422.456C545.069 163 606 220.912 606 313.42C606 382.613 563.123 427.739 505.201 435.26C554.096 445.037 582.681 472.865 587.947 527.768Z"
          fill="#E8F2FF"
        />
        <path
          d="M195 636V562.553H328.697C351.029 562.553 355.878 579.116 355.878 588.994V636H195Z"
          fill="#E8F2FF"
        />
      </g>
      <defs>
        <filter
          id="filter0_dd_126_53"
          x="131"
          y="99"
          width="539"
          height="601"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="28" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.223529 0 0 0 0 0.572549 0 0 0 0 1 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_126_53"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="32" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.223529 0 0 0 0 0.572549 0 0 0 0 1 0 0 0 0.9 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_126_53"
            result="effect2_dropShadow_126_53"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_126_53"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

function GlowingLogoRemix() {
  return (
    <svg
      className="w-full"
      viewBox="0 0 1200 627"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_dd_351_34)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M378.744 361.947C380.387 383.214 380.387 393.183 380.387 404.065H331.558C331.558 401.694 331.6 399.526 331.642 397.327C331.774 390.492 331.912 383.365 330.813 368.971C329.361 347.899 320.356 343.216 303.798 343.216H289.128H227V304.876H306.122C327.037 304.876 337.494 298.464 337.494 281.489C337.494 266.563 327.037 257.517 306.122 257.517H227V220H314.836C362.186 220 385.716 242.536 385.716 278.535C385.716 305.461 369.158 323.021 346.79 325.948C365.672 329.753 376.71 340.582 378.744 361.947Z"
          fill="#E8F2FF"
        />
        <path
          d="M227 404.065V375.483H278.63C287.254 375.483 289.126 381.929 289.126 385.772V404.065H227Z"
          fill="#E8F2FF"
        />
      </g>
      <g filter="url(#filter1_dd_351_34)">
        <path
          d="M967.943 275.524H919.548L897.523 306.474L876.079 275.524H824.206L870.862 339.467L820.148 405.745H868.544L894.336 370.416L920.127 405.745H972L920.996 337.423L967.943 275.524Z"
          fill="#FFF0F1"
        />
      </g>
      <g filter="url(#filter2_dd_351_34)">
        <path
          d="M663.111 297.105C657.605 281.922 645.723 271.411 622.83 271.411C603.414 271.411 589.504 280.171 582.549 294.477V274.915H535.602V405.135H582.549V341.193C582.549 321.631 588.055 308.784 603.414 308.784C617.614 308.784 621.091 318.127 621.091 335.938V405.135H668.038V341.193C668.038 321.631 673.254 308.784 688.903 308.784C703.102 308.784 706.29 318.127 706.29 335.938V405.135H753.237V323.383C753.237 296.229 742.804 271.411 707.16 271.411C685.425 271.411 670.066 282.506 663.111 297.105Z"
          fill="#FFFAEA"
        />
      </g>
      <g filter="url(#filter3_dd_351_34)">
        <path
          d="M486.716 354.599C482.369 364.818 474.255 369.197 461.504 369.197C447.304 369.197 435.712 361.606 434.553 345.547H525.258V332.409C525.258 297.08 502.365 267.298 459.185 267.298C418.904 267.298 388.766 296.788 388.766 337.956C388.766 379.416 418.325 404.526 459.765 404.526C493.961 404.526 517.724 387.884 524.389 358.102L486.716 354.599ZM435.133 322.773C436.871 310.51 443.537 301.167 458.606 301.167C472.516 301.167 480.05 311.094 480.63 322.773H435.133Z"
          fill="#F1FFF0"
        />
      </g>
      <g filter="url(#filter4_dd_351_34)">
        <path
          d="M768.592 275.78V406H815.538V275.78H768.592ZM768.302 263.517H815.828V222.056H768.302V263.517Z"
          fill="#FFF7FF"
        />
      </g>
      <defs>
        <filter
          id="filter0_dd_351_34"
          x="185"
          y="178"
          width="242.715"
          height="268.065"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="21" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.223529 0 0 0 0 0.572549 0 0 0 0 1 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_351_34"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="14" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.223529 0 0 0 0 0.572549 0 0 0 0 1 0 0 0 0.9 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_351_34"
            result="effect2_dropShadow_351_34"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_351_34"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_dd_351_34"
          x="788.148"
          y="243.524"
          width="215.852"
          height="194.22"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="14" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.960784 0 0 0 0 0.2 0 0 0 0 0.258824 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_351_34"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="16" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.960784 0 0 0 0 0.2 0 0 0 0 0.258824 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_351_34"
            result="effect2_dropShadow_351_34"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_351_34"
            result="shape"
          />
        </filter>
        <filter
          id="filter2_dd_351_34"
          x="507.602"
          y="243.411"
          width="273.634"
          height="189.724"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="14" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.996078 0 0 0 0 0.8 0 0 0 0 0.105882 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_351_34"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="14" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.996078 0 0 0 0 0.8 0 0 0 0 0.105882 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_351_34"
            result="effect2_dropShadow_351_34"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_351_34"
            result="shape"
          />
        </filter>
        <filter
          id="filter3_dd_351_34"
          x="360.766"
          y="239.298"
          width="192.493"
          height="193.228"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="14" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.419608 0 0 0 0 0.85098 0 0 0 0 0.407843 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_351_34"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="14" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.419608 0 0 0 0 0.85098 0 0 0 0 0.407843 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_351_34"
            result="effect2_dropShadow_351_34"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_351_34"
            result="shape"
          />
        </filter>
        <filter
          id="filter4_dd_351_34"
          x="740.302"
          y="194.056"
          width="103.526"
          height="239.944"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="14" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.847059 0 0 0 0 0.231373 0 0 0 0 0.823529 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_351_34"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="14" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.847059 0 0 0 0 0.231373 0 0 0 0 0.823529 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_351_34"
            result="effect2_dropShadow_351_34"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_351_34"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}
