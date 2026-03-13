import type { RemixNode } from "remix/component/jsx-runtime";
export function JamGalleryModalControls() {
  return (props: {
    closeHref: string;
    previousHref: string;
    nextHref: string;
    focusPhotoIndex: number;
    class?: string;
    children: RemixNode;
  }) => {
    return (
      <div
        data-gallery-modal
        role="dialog"
        aria-modal="true"
        tabindex={-1}
        class={props.class}
      >
        {props.children}
      </div>
    );
  };
}
