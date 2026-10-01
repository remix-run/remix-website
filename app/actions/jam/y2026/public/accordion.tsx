import * as accordion from "@remix-run/ui/accordion";
import { spring } from "@remix-run/ui/animation";
import { css, type Handle, type Props } from "remix/component";

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

export function AccordionItem(handle: Handle<accordion.AccordionItemProps>) {
  return () => {
    let { children, disabled, mix, value, ...props } = handle.props;
    return (
      <accordion.ItemContext disabled={disabled} value={value}>
        <div {...props} mix={[itemStyle, accordion.item(), mix]}>
          {children}
        </div>
      </accordion.ItemContext>
    );
  };
}

export function AccordionTrigger(
  handle: Handle<accordion.AccordionTriggerProps>,
) {
  return () => {
    let { children, mix, type, ...props } = handle.props;
    return (
      <h3 mix={headingStyle}>
        <button
          {...props}
          type={type ?? "button"}
          mix={[triggerStyle, accordion.trigger(), mix]}
        >
          <span>{children}</span>
        </button>
      </h3>
    );
  };
}

export function AccordionContent(
  handle: Handle<accordion.AccordionContentProps>,
) {
  return () => {
    let { children, mix, ...props } = handle.props;
    return (
      <div {...props} mix={[panelStyle, accordion.content(), mix]}>
        <div mix={panelClipStyle}>
          <div mix={bodyStyle}>{children}</div>
        </div>
      </div>
    );
  };
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
