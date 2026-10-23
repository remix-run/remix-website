import * as accordion from "@remix-run/ui/accordion";
import { spring } from "@remix-run/ui/animation";
import { css, type Handle, type Props, type RemixNode } from "remix/component";

export function Accordion(
  handle: Handle<
    accordion.AccordionContextProps & { mix?: Props<"div">["mix"] }
  >,
) {
  return () => {
    let { children, mix, ...contextProps } = handle.props;
    return (
      <accordion.Context {...contextProps}>
        <div mix={[rootStyle, accordion.root(), mix]}>{children}</div>
      </accordion.Context>
    );
  };
}

type AccordionPartProps = {
  children?: RemixNode;
  mix?: Props<"div">["mix"];
};

export function AccordionItem(
  handle: Handle<AccordionPartProps & { value: string }>,
) {
  return () => (
    <accordion.ItemContext value={handle.props.value}>
      <div mix={[itemStyle, accordion.item(), handle.props.mix]}>
        {handle.props.children}
      </div>
    </accordion.ItemContext>
  );
}

export function AccordionTrigger(
  handle: Handle<{ children?: RemixNode; mix?: Props<"button">["mix"] }>,
) {
  return () => (
    <h3 mix={headingStyle}>
      <button
        type="button"
        mix={[triggerStyle, accordion.trigger(), handle.props.mix]}
      >
        <span>{handle.props.children}</span>
      </button>
    </h3>
  );
}

export function AccordionContent(handle: Handle<AccordionPartProps>) {
  return () => (
    <div mix={[panelStyle, accordion.content(), handle.props.mix]}>
      <div mix={panelClipStyle}>
        <div mix={bodyStyle}>{handle.props.children}</div>
      </div>
    </div>
  );
}

let rootStyle = css({ display: "flex", flexDirection: "column", minWidth: 0 });
let itemStyle = css({ minWidth: 0 });
let headingStyle = css({ margin: 0, minWidth: 0 });
let triggerStyle = css({
  all: "unset",
  boxSizing: "border-box",
  cursor: "pointer",
  width: "100%",
  textAlign: "left",
});
let panelStyle = css({
  display: "grid",
  gridTemplateRows: "0fr",
  transition: `grid-template-rows ${spring()}`,
  "&[data-state='open']": { gridTemplateRows: "1fr" },
  "&[data-state='closed']": { pointerEvents: "none" },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});
let panelClipStyle = css({ minHeight: 0, overflow: "hidden" });
let bodyStyle = css({
  display: "flow-root",
  minHeight: 0,
  "& > :first-child": { marginTop: 0 },
  "& > :last-child": { marginBottom: 0 },
});
