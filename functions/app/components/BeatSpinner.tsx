import React from "react";

export default function Spinner() {
  return (
    <div className="BeatSpinner h-full w-4 flex items-end">
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-white" />
    </div>
  );
}
