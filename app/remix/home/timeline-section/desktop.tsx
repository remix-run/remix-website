/** @jsxImportSource remix/component */
import cx from "clsx";

export function TimelineDiagramDesktop() {
  return (props: { class?: string }) => (
    <svg
      class={props.class}
      width="1919"
      height="209"
      viewBox="0 0 1919 209"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Year labels (non-interactive years) */}
      <g
        class={cx("rmx-caption", "fill-[var(--rmx-text-tertiary)]")}
        textAnchor="middle"
      >
        <text x="373" y="9" opacity="0.1">
          2014
        </text>
        <text x="462" y="9" opacity="0.25">
          2015
        </text>
        <text x="551" y="9" opacity="0.5">
          2016
        </text>
        <text x="728" y="9">
          2018
        </text>
        <text x="1086" y="9">
          2022
        </text>
        <text x="1451" y="9" opacity="0.5">
          2026
        </text>
        <text x="1543" y="9" opacity="0.25">
          2027
        </text>
      </g>

      {/* React Router track (red) */}
      <rect
        y="64.494"
        width="1918.49"
        height="36"
        fill="var(--rmx-shade-red)"
      />
      <g filter="url(#glow-react-router)">
        <path
          d="M365 82.494C365 72.5529 373.059 64.494 383 64.494H1454.2C1464.14 64.494 1472.2 72.5529 1472.2 82.494C1472.2 92.4351 1464.14 100.494 1454.2 100.494H383C373.059 100.494 365 92.4351 365 82.494Z"
          fill="var(--rmx-highlight-red)"
        />
      </g>
      <TrackLabel x={497} y={87} label="react router" />

      {/* Remix 3 track (green) */}
      <rect
        y="152.494"
        width="1918.49"
        height="36"
        fill="var(--rmx-shade-green)"
      />
      <g filter="url(#glow-remix-3)">
        <path
          d="M1336 170.494C1336 160.553 1344 152.494 1354 152.494H1454.2C1464.14 152.494 1472.2 160.553 1472.2 170.494C1472.2 180.435 1464.14 188.494 1454.2 188.494H1354C1344 188.494 1336 180.435 1336 170.494Z"
          fill="var(--rmx-highlight-green)"
        />
      </g>
      <TrackLabel x={476} y={175} label="remix 3" />

      {/* Remix track (blue) */}
      <rect
        y="108.494"
        width="1918.49"
        height="36"
        fill="var(--rmx-shade-blue)"
      />
      <TrackLabel x={481} y={131} label="remix 1-2" />

      {/* Blue glow segments */}
      <g filter="url(#glow-blue)">
        <path
          d="M986.2 126.494C986.2 116.553 994.259 108.494 1004.2 108.494H1181.8C1191.74 108.494 1199.8 116.553 1199.8 126.494C1199.8 136.435 1191.74 144.494 1181.8 144.494H1004.2C994.259 144.494 986.2 136.435 986.2 126.494Z"
          fill="var(--rmx-highlight-blue)"
        />
      </g>
      <g filter="url(#glow-blue)">
        <path
          d="M884 82.494C884 72.5529 892 64.494 902 64.494H955C964.941 64.494 973 72.5529 973 82.494C973 92.4351 964.941 100.494 955 100.494H902C892 100.494 884 92.4351 884 82.494Z"
          fill="var(--rmx-highlight-blue)"
        />
      </g>

      {/* Gradient and diagonal connectors */}
      <path
        d="M1208.75 82.494C1208.75 72.5529 1216.81 64.494 1226.75 64.494H1368.75V100.494H1226.75C1216.81 100.494 1208.75 92.4351 1208.75 82.494Z"
        fill="url(#gradient-remix-to-router)"
      />
      <g filter="url(#glow-blue)">
        <path
          d="M1016.93 138.996C1023.96 131.966 1023.96 120.569 1016.93 113.54L973.391 70.0023C966.361 62.9729 954.964 62.9729 947.935 70.0023C940.905 77.0318 940.905 88.4287 947.935 95.4582L991.472 138.996C998.502 146.025 1009.9 146.025 1016.93 138.996Z"
          fill="var(--rmx-highlight-blue)"
        />
      </g>
      <g filter="url(#glow-blue)">
        <path
          d="M1169.68 138.996C1162.66 131.966 1162.66 120.569 1169.68 113.54L1213.5 69.7279C1220.53 62.6985 1231.92 62.6985 1238.95 69.7279C1245.98 76.7574 1245.98 88.1543 1238.95 95.1838L1195.14 138.996C1188.11 146.025 1176.71 146.025 1169.68 138.996Z"
          fill="var(--rmx-highlight-blue)"
        />
      </g>

      {/* Track end circles */}
      <TrackEndCircle cx={1450.7} cy={82.494} />
      <TrackEndCircle cx={1450.7} cy={170.494} />

      {/* Milestones */}
      <Milestone
        year="2017"
        yearX={640}
        nodeX={640}
        nodeY={82.494}
        lineY1={58}
        label="v4"
        labelY={87}
        labelColor="var(--rmx-highlight-red)"
      />
      <Milestone
        year="2019"
        yearX={817}
        nodeX={817}
        nodeY={82.494}
        lineY1={58}
        label="v5"
        labelY={87}
        labelColor="var(--rmx-highlight-red)"
        href="https://v5.reactrouter.com/"
      />
      <Milestone
        year="2020"
        yearX={906}
        nodeX={906}
        nodeY={82.494}
        lineY1={58}
        label="v6"
        labelY={87}
        labelColor="var(--rmx-highlight-red)"
        href="https://reactrouter.com/v6"
      />
      <Milestone
        year="2021"
        yearX={997}
        nodeX={1004.2}
        nodeY={125.994}
        lineY1={102}
        label="v1"
        labelY={131}
        labelColor="var(--rmx-highlight-blue)"
      />
      <Milestone
        year="2023"
        yearX={1177}
        nodeX={1182.8}
        nodeY={125.994}
        lineY1={102}
        label="v2"
        labelY={131}
        labelColor="var(--rmx-highlight-blue)"
        href="https://v2.remix.run/"
      />
      <Milestone
        year="2024"
        yearX={1268}
        nodeX={1274.95}
        nodeY={82.494}
        lineY1={58}
        label="v7"
        labelY={87}
        labelColor="var(--rmx-highlight-red)"
        href="https://reactrouter.com/"
      />
      <Milestone
        year="2025"
        yearX={1360}
        nodeX={1360}
        nodeY={170.494}
        lineY1={146}
        label="v3"
        labelY={175}
        labelColor="var(--rmx-highlight-green)"
        href="https://github.com/remix-run/remix"
      />

      <defs>
        <filter
          id="glow-react-router"
          x="345"
          y="44.494"
          width="1147.2"
          height="76"
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
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.85098 0 0 0 0 0.172549 0 0 0 0 0.286275 0 0 0 0.65 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_93_585"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.85098 0 0 0 0 0.172549 0 0 0 0 0.286275 0 0 0 0.35 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_93_585"
            result="effect2_dropShadow_93_585"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="8" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.85098 0 0 0 0 0.172549 0 0 0 0 0.286275 0 0 0 0.35 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow_93_585"
            result="effect3_dropShadow_93_585"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="10" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.85098 0 0 0 0 0.172549 0 0 0 0 0.286275 0 0 0 0.35 0"
          />
          <feBlend
            mode="normal"
            in2="effect3_dropShadow_93_585"
            result="effect4_dropShadow_93_585"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect4_dropShadow_93_585"
            result="shape"
          />
        </filter>
        <filter
          id="glow-remix-3"
          x="1302"
          y="132.494"
          width="188"
          height="76"
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
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0235294 0 0 0 0 0.917647 0 0 0 0 0.541176 0 0 0 0.65 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_93_585"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0235294 0 0 0 0 0.917647 0 0 0 0 0.541176 0 0 0 0.35 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_93_585"
            result="effect2_dropShadow_93_585"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="8" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0235294 0 0 0 0 0.917647 0 0 0 0 0.541176 0 0 0 0.35 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow_93_585"
            result="effect3_dropShadow_93_585"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="10" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0235294 0 0 0 0 0.917647 0 0 0 0 0.541176 0 0 0 0.35 0"
          />
          <feBlend
            mode="normal"
            in2="effect3_dropShadow_93_585"
            result="effect4_dropShadow_93_585"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect4_dropShadow_93_585"
            result="shape"
          />
        </filter>
        <filter
          id="glow-blue"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          filterUnits="objectBoundingBox"
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
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.145098 0 0 0 0 0.619608 0 0 0 0 0.937255 0 0 0 0.65 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.145098 0 0 0 0 0.619608 0 0 0 0 0.937255 0 0 0 0.35 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow"
            result="effect2_dropShadow"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="8" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.145098 0 0 0 0 0.619608 0 0 0 0 0.937255 0 0 0 0.35 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow"
            result="effect3_dropShadow"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="10" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.145098 0 0 0 0 0.619608 0 0 0 0 0.937255 0 0 0 0.35 0"
          />
          <feBlend
            mode="normal"
            in2="effect3_dropShadow"
            result="effect4_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect4_dropShadow"
            result="shape"
          />
        </filter>
        <linearGradient
          id="gradient-remix-to-router"
          x1="1269.81"
          y1="82.494"
          x2="1368.75"
          y2="82.494"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--rmx-highlight-blue)" />
          <stop offset="1" stopColor="var(--rmx-highlight-red)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Track name label (e.g., "REACT ROUTER", "REMIX", "REMIX 3") */
function TrackLabel() {
  return ({ x, y, label }: { x: number; y: number; label: string }) => (
    <text
      x={x}
      y={y}
      class={cx(
        "rmx-caption",
        "fill-[var(--rmx-neutral-100)] font-semibold uppercase tracking-wider",
      )}
      textAnchor="middle"
    >
      {label}
    </text>
  );
}

/** Open circle at the end of a track */
function TrackEndCircle() {
  return ({ cx, cy }: { cx: number; cy: number }) => (
    <circle
      cx={cx}
      cy={cy}
      r="5"
      stroke="var(--rmx-neutral-200)"
      strokeWidth="2"
      fill="none"
    />
  );
}

type MilestoneProps = {
  year: string;
  yearX: number;
  nodeX: number;
  nodeY: number;
  lineY1: number;
  label: string;
  labelY: number;
  labelColor: string;
  href?: string;
};

/** Interactive milestone marker with hover/focus states */
function Milestone() {
  return ({
    year,
    yearX,
    nodeX,
    nodeY,
    lineY1,
    label,
    labelY,
    labelColor,
    href,
  }: MilestoneProps) => {
    const content = (
      <>
        {/* Year label */}
        <text
          x={yearX}
          y="9"
          textAnchor="middle"
          class={cx(
            "rmx-caption",
            "fill-[var(--rmx-text-tertiary)] transition-all duration-150",
            "group-hover:fill-[var(--rmx-neutral-100)] group-hover:font-bold",
            "group-focus-visible:fill-[var(--rmx-neutral-100)] group-focus-visible:font-bold",
          )}
        >
          {year}
        </text>

        {/* Hover hitbox */}
        <circle cx={nodeX} cy={nodeY} r="24" fill="transparent" />

        {/* Connecting line */}
        <line
          x1={nodeX}
          y1={lineY1}
          x2={nodeX}
          y2="20"
          stroke="var(--rmx-neutral-200)"
          strokeWidth="2"
          class="opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
        />

        {/* Default state: small dot */}
        <circle
          cx={nodeX}
          cy={nodeY}
          r="6"
          fill="var(--rmx-neutral-200)"
          class="opacity-100 transition-opacity duration-150 group-hover:opacity-0 group-focus-visible:opacity-0"
        />

        {/* Hover/focus state: white circle with colored label */}
        <g class="opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
          <circle cx={nodeX} cy={nodeY} r="24" fill="white" />
          <text
            x={nodeX}
            y={labelY}
            textAnchor="middle"
            class="rmx-caption font-semibold"
            fill={labelColor}
          >
            {label}
          </text>
        </g>
      </>
    );

    if (href) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          class="group cursor-pointer"
        >
          {content}
        </a>
      );
    }

    return (
      <g
        tabIndex={0}
        role="img"
        aria-label={`${label} released in ${year}`}
        class="group cursor-default"
      >
        {content}
      </g>
    );
  };
}
