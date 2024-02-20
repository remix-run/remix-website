import type { MetaFunction } from "@remix-run/node";
import type { FC } from "react";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Remix Assets and Branding Guidelines",
    },
  ];
};

export default function Brand() {
  return (
    <div className="md-prose container my-8 max-w-4xl">
      <h1>Remix Brand</h1>
      <p>
        These assets are provided for use in situations like articles and video
        tutorials.
      </p>
      <h2>Trademark Usage Agreement</h2>
      <p>
        The Remix name and logos are trademarks of Remix Software Inc.
      </p>
      <p>
        You may not use the Remix name or logos in any way that could
        mistakenly imply any official connection with or endorsement of Remix
        Software Inc. Any use of the Remix name or logos in a manner that
        could cause customer confusion is not permitted.
      </p>
      <p>
        Additionally, you may not use our trademarks for t-shirts, stickers, or
        other merchandise without explicit written consent.
      </p>
      <h2>Logo</h2>
      <p>
        Please use the logo with appropriate background. On dark backgrounds use
        the logo with white dots, and on light backgrounds use the logo with
        black dots.

        You may also <a content="Google drive containing all image files for Remix Logo\'s" href="https://drive.google.com/drive/u/0/folders/1pbHnJqg8Y1ATs0Oi8gARH7wccJGv4I2c"> download all image files for Remix Logo's in bulk through Google Drive.</a>
      </p>
      <h2>Logo</h2>
      <LogoBox name="remix-letter" Logo={LogoRemixLetter} />
      <h2>Logo Word</h2>
      <LogoBox name="remix" Logo={LogoRemix} />
    </div>
  );
}

interface LogoProps {
  fg: string;
  highlight: string;
  outline?: string;
}

function LogoBox({
  name,
  Logo,
}: {
  name: "remix-letter" | "remix";
  Logo: FC<LogoProps>;
}) {
  // Tailwind classnames for the various ways we style the individual
  // component pieces of each LogoBox variant
  let variants = {
    light: {
      bg: "bg-white",
      border: "border-gray-50 dark:border-transparent",
      fg: "fill-gray-900",
      highlight: "fill-black-brand",
      outline: "black",
    },
    'light-outline': {
        bg: "bg-white",
        border: "border-gray-50 dark:border-transparent",
        fg: "fill-gray-900",
        highlight: "fill-transparent",
        outline: "black",
      },
    dark: {
        bg: "bg-gray-900",
        border: "border-transparent dark:border-gray-800",
        fg: "fill-gray-900",
        highlight: "fill-white",
        outline: "white",
    },
    'dark-outline': {
        bg: "bg-gray-900",
        border: "border-transparent dark:border-gray-800",
        fg: "fill-gray-900",
        highlight: "fill-transparent",
        outline: "white",
    },
  };
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-4 gap-x-6">
      {Object.entries(variants).map(
        ([variant, { bg, border, fg, highlight, outline }]) => (
          <div className="flex flex-col" key={variant}>
            <div
              className={
                `flex h-40 items-center justify-center rounded-lg border-[3px] p-4 md:h-48 ${bg} ${border}`
              }
            >
              <Logo fg={fg} highlight={highlight} outline={outline} />
            </div>
            <div className="mt-1 flex items-end gap-4 text-sm">
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
        )
      )}
    </div>
  );
}

function LogoRemixLetter({ fg, highlight, outline }: LogoProps) {
    return (
      <svg
        width="200"
        height="200"
        viewBox="0 0 800 800"
        className={fg}
        xmlns="http://www.w3.org/2000/svg"
      >
      <path d="M589.94 527.613L589.939 527.595L589.937 527.577C587.275 499.813 578.691 478.677 564.403 463.234C552.056 449.888 535.585 440.94 515.372 435.566C569.234 424.272 608 379.587 608 313.42C608 266.703 592.597 228.492 561.505 201.997C530.461 175.543 484.047 161 422.456 161H195H193V163V259.41V261.41H195H399.889C426.723 261.41 446.529 267.174 459.586 277.401C472.568 287.57 479.13 302.347 479.13 321.011C479.13 342.372 472.531 356.69 459.665 365.785C446.642 374.991 426.849 379.109 399.889 379.109H195H193V381.109V479.634V481.634H195H355.883H393.871C415.216 481.634 431.143 484.652 442.233 493.952C453.278 503.214 459.967 519.095 461.833 545.957L461.834 545.965L461.834 545.972C464.673 582.864 464.317 601.111 463.975 618.633L463.975 618.648L463.975 618.658C463.865 624.303 463.756 629.89 463.756 636V638H465.756H592.201H594.201V636C594.201 608.005 594.201 582.331 589.94 527.613Z" 
        stroke={outline} strokeWidth="6" className={highlight}
      />
      <path d="M193 636V638H195H355.878H357.878V636V588.994C357.878 583.787 356.609 576.706 352.266 570.874C347.847 564.941 340.428 560.553 328.697 560.553H195H193V562.553V636Z" 
        stroke={outline} strokeWidth="6" className={highlight}
      />
      </svg>
    );
  }

  function LogoRemix({ fg, highlight, outline }: LogoProps) {
    return (
      <svg
        width="300"
        height="300"
        viewBox="0 0 1200 600"
        className={fg}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M289.128 342.216H228V305.876H306.122C316.64 305.876 324.744 304.272 330.231 300.362C335.796 296.398 338.494 290.199 338.494 281.489C338.494 273.772 335.778 267.468 330.271 263.121C324.8 258.803 316.704 256.517 306.122 256.517H228V221H314.836C338.367 221 355.822 226.601 367.381 236.526C378.917 246.433 384.716 260.764 384.716 278.535C384.716 304.983 368.506 322.098 346.66 324.956L346.593 326.928C355.892 328.802 363.157 332.384 368.348 338.039C373.537 343.69 376.745 351.51 377.747 362.033C379.337 382.607 379.385 392.578 379.387 403.065H332.56C332.57 401.087 332.605 399.232 332.642 397.347C332.774 390.493 332.912 383.332 331.811 368.898C331.077 358.26 328.423 351.49 323.615 347.427C318.828 343.382 312.125 342.216 303.798 342.216H289.128Z" 
            stroke={outline} strokeWidth="6" className={highlight}
        />
        <path d="M228 403.065V376.483H278.63C282.656 376.483 284.968 377.969 286.308 379.781C287.686 381.645 288.126 383.983 288.126 385.772V403.065H228Z" 
            stroke={outline} strokeWidth="6" className={highlight}
        />
        <path d="M822.173 404.745L871.656 340.074L872.111 339.481L871.67 338.877L826.173 276.524H875.555L896.701 307.043L897.512 308.214L898.338 307.053L920.063 276.524H965.929L920.2 336.819L919.745 337.418L920.195 338.021L970.006 404.745H920.635L895.143 369.826L894.336 368.72L893.528 369.826L868.036 404.745H822.173Z" 
            stroke={outline} strokeWidth="6" className={highlight}
        />
        <path d="M662.17 297.446L662.985 299.693L664.013 297.535C670.797 283.297 685.797 272.411 707.159 272.411C724.722 272.411 735.916 278.508 742.759 287.807C749.643 297.161 752.236 309.906 752.236 323.383V404.135H707.29V335.938C707.29 327.032 706.505 320.003 703.792 315.191C702.417 312.752 700.547 310.88 698.059 309.629C695.584 308.385 692.557 307.784 688.902 307.784C684.851 307.784 681.416 308.616 678.551 310.225C675.683 311.835 673.442 314.191 671.735 317.153C668.341 323.042 667.037 331.36 667.037 341.193V404.135H622.091V335.938C622.091 327.024 621.232 319.993 618.442 315.18C617.029 312.743 615.123 310.875 612.611 309.627C610.111 308.385 607.068 307.784 603.413 307.784C595.39 307.784 589.839 311.174 586.357 317.149C582.927 323.036 581.548 331.353 581.548 341.193V404.135H536.602V275.915H581.548V294.477L583.447 294.915C590.216 280.991 603.751 272.411 622.829 272.411C634.122 272.411 642.604 275.002 648.92 279.386C655.235 283.769 659.472 290.005 662.17 297.446Z" 
            stroke={outline} strokeWidth="6" className={highlight}
        />
        <path d="M523.156 358.992C519.749 373.128 512.378 384.135 501.82 391.668C490.977 399.405 476.704 403.526 459.765 403.526C439.244 403.526 421.75 397.311 409.399 386.05C397.058 374.798 389.766 358.435 389.766 337.956C389.766 297.344 419.453 268.298 459.185 268.298C480.532 268.298 496.774 275.652 507.684 287.289C518.605 298.937 524.258 314.957 524.258 332.409V344.547H434.553H433.478L433.556 345.619C434.153 353.893 437.453 360.073 442.508 364.171C447.545 368.254 454.234 370.197 461.504 370.197C467.986 370.197 473.391 369.085 477.756 366.599C481.951 364.21 485.109 360.596 487.342 355.661L523.156 358.992ZM434.142 322.633L433.981 323.773H435.133H480.63H481.681L481.629 322.724C481.329 316.69 479.23 311.05 475.346 306.907C471.449 302.749 465.817 300.167 458.606 300.167C450.849 300.167 445.14 302.581 441.154 306.674C437.189 310.745 435.03 316.374 434.142 322.633Z" 
            stroke={outline} strokeWidth="6" className={highlight}
        />
        <path d="M814.538 405H769.592V276.78H814.538V405ZM814.828 223.056V262.517H769.302V223.056H814.828Z" 
            stroke={outline} strokeWidth="6" className={highlight}
        />
        </svg>
    );
  }