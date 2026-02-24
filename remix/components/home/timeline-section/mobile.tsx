import cx from "clsx";
import type { Props, RemixNode } from "remix/component/jsx-runtime";

const YEARS = Array.from({ length: 13 }, (_, index) => 2014 + index);
const ROW_HEIGHT = 57;
type CssProps = Props<"div">["css"];

type CellConfig = string | { label?: string; css: CssProps };

const LANE_CELL_CONFIG: Record<string, Record<number, CellConfig>> = {
  "react-router": {
    2017: "v4",
    2019: "v5",
    2020: "v6",
    2021: " ",
    2023: " ",
    2024: "v7",
    2026: { css: { opacity: 1 } },
  },
  remix: {
    2021: "v1",
    2023: "v2",
  },
  "remix-3": {
    2025: { label: "💿", css: { fontSize: "20px" } },
    2026: { css: { opacity: 1 } },
  },
};

export function TimelineDiagramMobile() {
  return () => (
    <div
      class="relative mx-auto grid w-[380px]"
      css={{
        gridTemplateColumns: "auto repeat(3, 1fr)",
        gridTemplateRows: `repeat(${YEARS.length + 1}, ${ROW_HEIGHT}px)`,
      }}
    >
      <div
        css={{
          gridColumn: 2,
          gridRow: "1 / -1",
          background:
            "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-shade-red) 70%, var(--rmx-neutral-950) 100%)",
        }}
      />
      <div
        css={{
          gridColumn: 3,
          gridRow: "1 / -1",
          background:
            "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-shade-blue) 70%, var(--rmx-neutral-950) 100%)",
        }}
      />
      <div
        css={{
          gridColumn: 4,
          gridRow: "1 / -1",
          background:
            "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-shade-green) 70%, var(--rmx-neutral-950) 100%)",
        }}
      />

      <TrackSegments />

      {YEARS.map((year, index) => (
        <YearLabel key={year} css={{ gridColumn: 1, gridRow: index + 2 }}>
          {year}
        </YearLabel>
      ))}

      <LaneHeader css={{ gridColumn: 2, gridRow: 2 }}>React Router</LaneHeader>
      <LaneHeader css={{ gridColumn: 3, gridRow: 2 }}>Remix 1-2</LaneHeader>
      <LaneHeader css={{ gridColumn: 4, gridRow: 2 }}>Remix 3</LaneHeader>

      {YEARS.slice(1).map((year, index) => [
        <LaneCell
          key={`rr-${year}`}
          lane="react-router"
          year={year}
          css={{ gridColumn: 2, gridRow: index + 3 }}
        />,
        <LaneCell
          key={`rx-${year}`}
          lane="remix"
          year={year}
          css={{ gridColumn: 3, gridRow: index + 3 }}
        />,
        <LaneCell
          key={`r3-${year}`}
          lane="remix-3"
          year={year}
          css={{ gridColumn: 4, gridRow: index + 3 }}
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
        <div
          class="mx-auto w-12"
          css={{
            gridColumn: 2,
            gridRow: "1 / -1",
            borderRadius: "0 0 24px 24px",
            background:
              "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-highlight-red) 30%)",
          }}
        />
        <div
          class="mx-auto w-12"
          css={{
            gridColumn: 2,
            gridRow: "8 / 10",
            borderRadius: "24px 24px 0 24px",
            background: "var(--rmx-highlight-blue)",
            marginBottom: verticalSegmentMargin,
          }}
        />
        <div
          class="ml-12 h-12 self-center"
          css={{
            gridColumn: "2 / 4",
            gridRow: 9,
            borderRadius: "0 24px 0 24px",
            background: "var(--rmx-highlight-blue)",
            marginRight: horizontalSegmentInset,
          }}
        />
        <div
          class="mx-auto w-12"
          css={{
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
          css={{
            gridColumn: "2 / 4",
            gridRow: 11,
            borderRadius: "24px 0 24px 0",
            background: "var(--rmx-highlight-blue)",
            marginLeft: horizontalSegmentInset,
          }}
        />
        <div
          class="mx-auto w-12"
          css={{
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
          css={{
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
  return (props: { children: RemixNode; css?: CssProps }) => (
    <div
      class={cx(
        "text-rmx-neutral-100",
        "flex items-center justify-center whitespace-nowrap text-xs font-extrabold uppercase leading-[1.6] tracking-[0.6px]",
      )}
      css={props.css}
    >
      {props.children}
    </div>
  );
}

function YearLabel() {
  return (props: { children: RemixNode; css?: CssProps }) => {
    let year = Number(props.children);
    let opacity = 1;
    if (year === 2014) opacity = 0.25;
    else if (year === 2015) opacity = 0.5;
    else if (year === 2016) opacity = 0.75;

    return (
      <div
        class="rmx-caption text-rmx-tertiary flex items-center justify-end px-6"
        css={{ opacity, ...(props.css ?? {}) }}
      >
        {props.children}
      </div>
    );
  };
}

function LaneCell() {
  return (props: { lane: string; year: number; css?: CssProps }) => {
    let config = LANE_CELL_CONFIG[props.lane]?.[props.year];
    let label = typeof config === "string" ? config : config?.label;
    let configStyle = typeof config === "object" ? config.css : undefined;

    if (label) {
      return (
        <div
          class={cx(
            "rmx-caption text-rmx-neutral-100",
            "self-center justify-self-center font-bold",
          )}
          css={{ ...(props.css ?? {}), ...(configStyle ?? {}) }}
        >
          {label}
        </div>
      );
    }

    return (
      <div class="self-center justify-self-center" css={props.css}>
        <div
          class="size-[9px] rounded-full border border-[--rmx-neutral-100] opacity-40"
          css={configStyle}
        />
      </div>
    );
  };
}
