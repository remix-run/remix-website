/** @jsxImportSource remix/component */
import cx from "clsx";
import type { RemixNode } from "remix/component/jsx-runtime";

const YEARS = Array.from({ length: 13 }, (_, index) => 2014 + index);
const ROW_HEIGHT = 57;

type CellConfig = string | { label?: string; style: Record<string, string | number> };

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
    <div
      class="relative mx-auto grid w-[380px]"
      style={{
        gridTemplateColumns: "auto repeat(3, 1fr)",
        gridTemplateRows: `repeat(${YEARS.length + 1}, ${ROW_HEIGHT}px)`,
      }}
    >
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

      {YEARS.map((year, index) => (
        <YearLabel key={year} style={{ gridColumn: 1, gridRow: index + 2 }}>
          {year}
        </YearLabel>
      ))}

      <LaneHeader style={{ gridColumn: 2, gridRow: 2 }}>React Router</LaneHeader>
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
    const trackWidth = 48;
    const horizontalSegmentInset = 27;
    const verticalSegmentMargin = (ROW_HEIGHT - trackWidth) / 2;

    return (
      <>
        <div
          class="mx-auto w-12"
          style={{
            gridColumn: 2,
            gridRow: "1 / -1",
            borderRadius: "0 0 24px 24px",
            background:
              "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-highlight-red) 30%)",
          }}
        />
        <div
          class="mx-auto w-12"
          style={{
            gridColumn: 2,
            gridRow: "8 / 10",
            borderRadius: "24px 24px 0 24px",
            background: "var(--rmx-highlight-blue)",
            marginBottom: verticalSegmentMargin,
          }}
        />
        <div
          class="ml-12 h-12 self-center"
          style={{
            gridColumn: "2 / 4",
            gridRow: 9,
            borderRadius: "0 24px 0 24px",
            background: "var(--rmx-highlight-blue)",
            marginRight: horizontalSegmentInset,
          }}
        />
        <div
          class="mx-auto w-12"
          style={{
            gridColumn: 3,
            gridRow: "9 / 12",
            borderRadius: "0 24px 24px 0",
            background: "var(--rmx-highlight-blue)",
            marginTop: verticalSegmentMargin,
            marginBottom: verticalSegmentMargin,
          }}
        />
        <div
          class="mr-12 h-12 self-center"
          style={{
            gridColumn: "2 / 4",
            gridRow: 11,
            borderRadius: "24px 0 24px 0",
            background: "var(--rmx-highlight-blue)",
            marginLeft: horizontalSegmentInset,
          }}
        />
        <div
          class="mx-auto w-12"
          style={{
            gridColumn: 2,
            gridRow: "11 / 13",
            borderRadius: "48px 24px 0 0",
            background:
              "linear-gradient(180deg, var(--rmx-highlight-blue) 46.82%, var(--rmx-highlight-red) 100%)",
            marginTop: verticalSegmentMargin,
          }}
        />
        <div
          class="mx-auto w-12 rounded-3xl"
          style={{
            gridColumn: 4,
            gridRow: "13 / 15",
            background: "var(--rmx-highlight-green)",
          }}
        />
      </>
    );
  };
}

function LaneHeader() {
  return (props: { children: RemixNode; style?: Record<string, string | number> }) => (
    <div
      class={cx(
        "text-rmx-neutral-100",
        "flex items-center justify-center whitespace-nowrap text-xs font-extrabold uppercase leading-[1.6] tracking-[0.6px]",
      )}
      style={props.style}
    >
      {props.children}
    </div>
  );
}

function YearLabel() {
  return (props: { children: RemixNode; style?: Record<string, string | number> }) => {
    const year = Number(props.children);
    let opacity = 1;
    if (year === 2014) opacity = 0.25;
    else if (year === 2015) opacity = 0.5;
    else if (year === 2016) opacity = 0.75;

    return (
      <div
        class="rmx-caption text-rmx-tertiary flex items-center justify-end px-6"
        style={{ opacity, ...(props.style ?? {}) }}
      >
        {props.children}
      </div>
    );
  };
}

function LaneCell() {
  return (props: { lane: string; year: number; style?: Record<string, string | number> }) => {
    const config = LANE_CELL_CONFIG[props.lane]?.[props.year];
    const label = typeof config === "string" ? config : config?.label;
    const configStyle = typeof config === "object" ? config.style : undefined;

    if (label) {
      return (
        <div
          class={cx(
            "rmx-caption text-rmx-neutral-100",
            "self-center justify-self-center font-bold",
          )}
          style={{ ...(props.style ?? {}), ...(configStyle ?? {}) }}
        >
          {label}
        </div>
      );
    }

    return (
      <div class="self-center justify-self-center" style={props.style}>
        <div
          class="size-[9px] rounded-full border border-[--rmx-neutral-100] opacity-40"
          style={configStyle}
        />
      </div>
    );
  };
}
