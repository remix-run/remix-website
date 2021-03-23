import { usePendingLocation } from "@remix-run/react";

export default function Spinner({
  startText = "Navigating",
  endText = "Navigation complete",
}: {
  startText?: string;
  endText?: string;
}) {
  let pendingLocation = usePendingLocation();
  return (
    <>
      <span
        aria-live="assertive"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: "0",
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: "0",
        }}
      >
        {pendingLocation ? startText : endText}
      </span>
      <svg
        data-docs-spinner
        data-spin={!!pendingLocation}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M20 4v5h-.582m0 0a8.001 8.001 0 00-15.356 2m15.356-2H15M4 20v-5h.581m0 0a8.003 8.003 0 0015.357-2M4.581 15H9"
        />
      </svg>
    </>
  );
}
