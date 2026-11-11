import type { Handle, RemixNode } from "remix/component";

// How the viewer is doing, beyond which photo it shows: open, or closing and
// leaving the way it chose.
export type ViewerPhase =
  | { kind: "open" }
  | { kind: "closing"; exit: "shrink" | "roll" };

/** What the viewer's parts read from and ask of the frame that owns it. */
export type PhotoViewerSession = {
  readonly phase: ViewerPhase;
  /** Shows just the card-sized preview, while the filmstrip is scrubbed. */
  readonly previewOnly: boolean;
  requestClose(event?: Event): void;
};

// Hands the frame's session to the viewer's parts. A plain component, since
// a client entry can be wrapped (by hot reloading, at least), which makes it
// an unreliable context key.
export function PhotoViewerSessionProvider(
  handle: Handle<
    { children: RemixNode; session: PhotoViewerSession },
    PhotoViewerSession
  >,
) {
  handle.context.set(handle.props.session);
  return () => handle.props.children;
}
