import { Fragment } from "react";
import cx from "clsx";

// =============================================================================
// Mobile Layout Constants
// =============================================================================

const YEARS = Array.from({ length: 13 }, (_, index) => 2014 + index);
const ROW_HEIGHT = 57;

// Cell config: string for label, or object with optional label and style overrides
type CellConfig = string | { label?: string; style: React.CSSProperties };

const LANE_CELL_CONFIG: Record<string, Record<number, CellConfig>> = {
  "react-router": {
    2017: "v4",
    2019: "v5",
    2020: "v6",
    2021: " ",
    2023: " ",
    2024: "v7",
    2026: { style: { opacity: 1 } },
  },
  remix: {
    2021: "v1",
    2023: "v2",
  },
  "remix-3": {
    2025: { label: "💿", style: { fontSize: "20px" } },
    2026: { style: { opacity: 1 } },
  },
};

// =============================================================================
// Mobile Timeline Component
// =============================================================================

export function TimelineDiagramMobile() {
  return (
    <div
      className="relative mx-auto grid w-[380px]"
      style={{
        gridTemplateColumns: `auto repeat(3, 1fr)`,
        gridTemplateRows: `repeat(${YEARS.length + 1}, ${ROW_HEIGHT}px)`,
      }}
    >
      {/* Lane background gradients - these span all rows */}
      <div
        style={{
          gridColumn: 2,
          gridRow: "1 / -1",
          background:
            "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-shade-red) 70%, var(--rmx-neutral-950) 100%)",
        }}
      />
      <div
        style={{
          gridColumn: 3,
          gridRow: "1 / -1",
          background:
            "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-shade-blue) 70%, var(--rmx-neutral-950) 100%)",
        }}
      />
      <div
        style={{
          gridColumn: 4,
          gridRow: "1 / -1",
          background:
            "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-shade-green) 70%, var(--rmx-neutral-950) 100%)",
        }}
      />

      <TrackSegments />

      {/* Year labels */}
      {YEARS.map((year, index) => (
        <YearLabel key={year} style={{ gridColumn: 1, gridRow: index + 2 }}>
          {year}
        </YearLabel>
      ))}

      {/* Lane headers on 2014 row (row 2) */}
      <LaneHeader style={{ gridColumn: 2, gridRow: 2 }}>
        React Router
      </LaneHeader>
      <LaneHeader style={{ gridColumn: 3, gridRow: 2 }}>Remix 1-2</LaneHeader>
      <LaneHeader style={{ gridColumn: 4, gridRow: 2 }}>Remix 3</LaneHeader>

      {/* Year markers or version labels for each lane - skip 2014 which has headers */}
      {YEARS.slice(1).map((year, index) => (
        <Fragment key={year}>
          <LaneCell
            lane="react-router"
            year={year}
            style={{ gridColumn: 2, gridRow: index + 3 }}
          />
          <LaneCell
            lane="remix"
            year={year}
            style={{ gridColumn: 3, gridRow: index + 3 }}
          />
          <LaneCell
            lane="remix-3"
            year={year}
            style={{ gridColumn: 4, gridRow: index + 3 }}
          />
        </Fragment>
      ))}
    </div>
  );
}

// =============================================================================
// Mobile-Specific Sub-Components
// =============================================================================

function TrackSegments() {
  // Track width is 48px (w-12 in Tailwind)
  const trackWidth = 48;
  // Margin for horizontal segments to align with centered tracks
  // This is roughly (lane width - track width) / 2, adjusted for visual alignment
  const horizontalSegmentInset = 27;
  // Vertical margin to align with centered horizontal segments
  const verticalSegmentMargin = (ROW_HEIGHT - trackWidth) / 2;

  return (
    <>
      {/* React Router - red track from top to 2026 */}
      <div
        className="mx-auto w-12"
        style={{
          gridColumn: 2,
          gridRow: "1 / -1",
          borderRadius: "0 0 24px 24px",
          background:
            "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-highlight-red) 30%)",
        }}
      />

      {/* Blue connector - Segment 1: Vertical in React Router (2020-2021) */}
      <div
        className="mx-auto w-12"
        style={{
          gridColumn: 2,
          gridRow: "8 / 10", // 2020-2021
          borderRadius: "24px 24px 0 24px",
          background: "var(--rmx-highlight-blue)",
          marginBottom: verticalSegmentMargin,
        }}
      />

      {/* Blue connector - Segment 2: Horizontal from React Router to Remix (2021) */}
      <div
        className="ml-12 h-12 self-center"
        style={{
          gridColumn: "2 / 4", // React Router to Remix
          gridRow: 9, // 2021
          borderRadius: "0 24px 0 24px",
          background: "var(--rmx-highlight-blue)",
          marginRight: horizontalSegmentInset, // End at Remix track
        }}
      />

      {/* Blue connector - Segment 3: Vertical in Remix (2021-2023) */}
      <div
        className="mx-auto w-12"
        style={{
          gridColumn: 3,
          gridRow: "9 / 12", // 2021-2023
          borderRadius: "0 24px 24px 0",
          background: "var(--rmx-highlight-blue)",
          marginTop: verticalSegmentMargin,
          marginBottom: verticalSegmentMargin,
        }}
      />

      {/* Blue connector - Segment 4: Horizontal from Remix back to React Router (2023) */}
      <div
        className="mr-12 h-12 self-center"
        style={{
          gridColumn: "2 / 4", // React Router to Remix (spans both)
          gridRow: 11, // 2023
          borderRadius: "24px 0 24px 0",
          background: "var(--rmx-highlight-blue)",
          marginLeft: horizontalSegmentInset, // Start at React Router track
        }}
      />

      {/* Blue connector - Segment 5: Merge back into React Router (2023-2024) */}
      <div
        className="mx-auto w-12"
        style={{
          gridColumn: 2,
          gridRow: "11 / 13", // 2023-2024
          borderRadius: "48px 24px 0 0",
          background:
            "linear-gradient(180deg, var(--rmx-highlight-blue) 46.82%, var(--rmx-highlight-red) 100%)",
          marginTop: verticalSegmentMargin,
        }}
      />

      {/* Remix 3 - green pill for 2025-2026 */}
      <div
        className="mx-auto w-12 rounded-3xl"
        style={{
          gridColumn: 4,
          gridRow: "13 / 15", // 2025-2026
          background: "var(--rmx-highlight-green)",
        }}
      />
    </>
  );
}

function LaneHeader({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cx(
        "text-rmx-neutral-100",
        "flex items-center justify-center whitespace-nowrap text-xs font-extrabold uppercase leading-[1.6] tracking-[0.6px]",
      )}
      style={style}
    >
      {children}
    </div>
  );
}

function YearLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const year = Number(children);
  // Years fade in from 2014 (0.25) to 2017+ (1.0)
  let opacity = 1;
  if (year === 2014) opacity = 0.25;
  else if (year === 2015) opacity = 0.5;
  else if (year === 2016) opacity = 0.75;

  return (
    <div
      className="rmx-caption text-rmx-tertiary flex items-center justify-end px-6"
      style={{ opacity, ...style }}
    >
      {children}
    </div>
  );
}

function LaneCell({
  lane,
  year,
  style,
}: {
  lane: string;
  year: number;
  style?: React.CSSProperties;
}) {
  const config = LANE_CELL_CONFIG[lane]?.[year];

  const label = typeof config === "string" ? config : config?.label;
  const configStyle = typeof config === "object" ? config.style : undefined;

  if (label) {
    return (
      <div
        className={cx(
          "rmx-caption text-rmx-neutral-100",
          "self-center justify-self-center font-bold",
        )}
        style={{ ...style, ...configStyle }}
      >
        {label}
      </div>
    );
  }

  return <YearMarker style={style} markerStyle={configStyle} />;
}

function YearMarker({
  style,
  markerStyle,
}: {
  style?: React.CSSProperties;
  markerStyle?: React.CSSProperties;
}) {
  return (
    <div className="self-center justify-self-center" style={style}>
      <div
        className="size-[9px] rounded-full border border-[--rmx-neutral-100] opacity-40"
        style={markerStyle}
      />
    </div>
  );
}
