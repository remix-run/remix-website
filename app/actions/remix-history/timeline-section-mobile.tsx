import { css, type Handle, type Props, type RemixNode } from "remix/ui";

import { captionStyle } from "../../ui/public/marketing-styles.ts";
import { theme } from "../../ui/public/theme.ts";

const YEARS = Array.from({ length: 13 }, (_, index) => 2014 + index);
const ROW_HEIGHT = 57;
type StyleProps = Props<"div">["style"];

type CellConfig = string | { label?: string; style: StyleProps };

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

export function TimelineDiagramMobile() {
  return () => (
    <div mix={mobileDiagramStyle}>
      <div mix={[laneBackgroundStyle, reactRouterLaneBackgroundStyle]} />
      <div mix={[laneBackgroundStyle, remixLaneBackgroundStyle]} />
      <div mix={[laneBackgroundStyle, remixThreeLaneBackgroundStyle]} />

      <TrackSegments />

      {YEARS.map((year, index) => (
        <YearLabel key={year} style={{ gridColumn: 1, gridRow: index + 2 }}>
          {year}
        </YearLabel>
      ))}

      <LaneHeader style={{ gridColumn: 2, gridRow: 2 }}>
        React Router
      </LaneHeader>
      <LaneHeader style={{ gridColumn: 3, gridRow: 2 }}>Remix 1-2</LaneHeader>
      <LaneHeader style={{ gridColumn: 4, gridRow: 2 }}>Remix 3</LaneHeader>

      {YEARS.slice(1).map((year, index) => [
        <LaneCell
          key={`rr-${year}`}
          lane="react-router"
          year={year}
          style={{ gridColumn: 2, gridRow: index + 3 }}
        />,
        <LaneCell
          key={`rx-${year}`}
          lane="remix"
          year={year}
          style={{ gridColumn: 3, gridRow: index + 3 }}
        />,
        <LaneCell
          key={`r3-${year}`}
          lane="remix-3"
          year={year}
          style={{ gridColumn: 4, gridRow: index + 3 }}
        />,
      ])}
    </div>
  );
}

function TrackSegments() {
  return () => {
    let trackWidth = 48;
    let horizontalSegmentInset = 27;
    let verticalSegmentMargin = (ROW_HEIGHT - trackWidth) / 2;

    return (
      <>
        <div mix={[verticalTrackStyle, reactRouterTrackStyle]} />
        <div
          mix={[verticalTrackStyle, remixMergeStartStyle]}
          style={{ marginBottom: verticalSegmentMargin }}
        />
        <div
          mix={remixMergeAcrossStyle}
          style={{ marginRight: horizontalSegmentInset }}
        />
        <div
          mix={[verticalTrackStyle, remixTrackStyle]}
          style={{
            marginTop: verticalSegmentMargin,
            marginBottom: verticalSegmentMargin,
          }}
        />
        <div
          mix={remixReturnAcrossStyle}
          style={{ marginLeft: horizontalSegmentInset }}
        />
        <div
          mix={[verticalTrackStyle, reactRouterReturnStyle]}
          style={{ marginTop: verticalSegmentMargin }}
        />
        <div mix={[verticalTrackStyle, remixThreeTrackStyle]} />
      </>
    );
  };
}

function LaneHeader(
  handle: Handle<{ children: RemixNode; style?: StyleProps }>,
) {
  return () => (
    <div mix={laneHeaderStyle} style={handle.props.style}>
      {handle.props.children}
    </div>
  );
}

function YearLabel(
  handle: Handle<{ children: RemixNode; style?: StyleProps }>,
) {
  return () => {
    let year = Number(handle.props.children);
    let opacity = 1;
    if (year === 2014) opacity = 0.25;
    else if (year === 2015) opacity = 0.5;
    else if (year === 2016) opacity = 0.75;

    return (
      <div
        mix={[captionStyle, yearLabelStyle]}
        style={{
          opacity,
          ...(typeof handle.props.style === "object" && handle.props.style
            ? handle.props.style
            : {}),
        }}
      >
        {handle.props.children}
      </div>
    );
  };
}

function LaneCell(
  handle: Handle<{ lane: string; year: number; style?: StyleProps }>,
) {
  return () => {
    let config = LANE_CELL_CONFIG[handle.props.lane]?.[handle.props.year];
    let label = typeof config === "string" ? config : config?.label;
    let configStyle = typeof config === "object" ? config.style : undefined;

    if (label) {
      return (
        <div
          mix={[captionStyle, laneCellLabelStyle]}
          style={{
            ...(typeof handle.props.style === "object" && handle.props.style
              ? handle.props.style
              : {}),
            ...(typeof configStyle === "object" && configStyle
              ? configStyle
              : {}),
          }}
        >
          {label}
        </div>
      );
    }

    return (
      <div mix={laneCellStyle} style={handle.props.style}>
        <div mix={laneCellDotStyle} style={configStyle} />
      </div>
    );
  };
}

let mobileDiagramStyle = css({
  position: "relative",
  display: "grid",
  width: "380px",
  marginInline: "auto",
  gridTemplateColumns: "auto repeat(3, 1fr)",
  gridTemplateRows: `repeat(${YEARS.length + 1}, ${ROW_HEIGHT}px)`,
});

let laneBackgroundStyle = css({ gridRow: "1 / -1" });

let reactRouterLaneBackgroundStyle = css({
  gridColumn: 2,
  background:
    "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-shade-red) 70%, var(--rmx-neutral-950) 100%)",
});

let remixLaneBackgroundStyle = css({
  gridColumn: 3,
  background:
    "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-shade-blue) 70%, var(--rmx-neutral-950) 100%)",
});

let remixThreeLaneBackgroundStyle = css({
  gridColumn: 4,
  background:
    "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-shade-green) 70%, var(--rmx-neutral-950) 100%)",
});

let verticalTrackStyle = css({ width: "48px", marginInline: "auto" });

let reactRouterTrackStyle = css({
  gridColumn: 2,
  gridRow: "1 / -1",
  borderRadius: "0 0 24px 24px",
  background:
    "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-highlight-red) 30%)",
});

let remixMergeStartStyle = css({
  gridColumn: 2,
  gridRow: "8 / 10",
  borderRadius: "24px 24px 0 24px",
  background: "var(--rmx-highlight-blue)",
});

let remixMergeAcrossStyle = css({
  alignSelf: "center",
  height: "48px",
  marginLeft: "48px",
  gridColumn: "2 / 4",
  gridRow: 9,
  borderRadius: "0 24px 0 24px",
  background: "var(--rmx-highlight-blue)",
});

let remixTrackStyle = css({
  gridColumn: 3,
  gridRow: "9 / 12",
  borderRadius: "0 24px 24px 0",
  background: "var(--rmx-highlight-blue)",
});

let remixReturnAcrossStyle = css({
  alignSelf: "center",
  height: "48px",
  marginRight: "48px",
  gridColumn: "2 / 4",
  gridRow: 11,
  borderRadius: "24px 0 24px 0",
  background: "var(--rmx-highlight-blue)",
});

let reactRouterReturnStyle = css({
  gridColumn: 2,
  gridRow: "11 / 13",
  borderRadius: "48px 24px 0 0",
  background:
    "linear-gradient(180deg, var(--rmx-highlight-blue) 46.82%, var(--rmx-highlight-red) 100%)",
});

let remixThreeTrackStyle = css({
  gridColumn: 4,
  gridRow: "13 / 15",
  borderRadius: "24px",
  background: "var(--rmx-highlight-green)",
});

let laneHeaderStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--rmx-neutral-100)",
  fontSize: "0.75rem",
  fontWeight: theme.fontWeight.extrabold,
  lineHeight: 1.6,
  letterSpacing: "0.6px",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});

let yearLabelStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  paddingInline: "24px",
  color: "var(--rmx-text-tertiary)",
});

let laneCellLabelStyle = css({
  alignSelf: "center",
  justifySelf: "center",
  color: "var(--rmx-neutral-100)",
  fontWeight: theme.fontWeight.bold,
});

let laneCellStyle = css({ alignSelf: "center", justifySelf: "center" });

let laneCellDotStyle = css({
  width: "9px",
  height: "9px",
  border: "1px solid var(--rmx-neutral-100)",
  borderRadius: "9999px",
  opacity: 0.4,
});
