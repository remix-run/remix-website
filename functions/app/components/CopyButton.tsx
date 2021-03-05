import React from "react";
import { IconCopy } from "./icons";

export default function CopyButton({ value }) {
  let [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (copied) {
      let id = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(id);
    }
  }, [copied]);

  return (
    <button
      className="w-28 inline-flex items-center justify-center px-2.5 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-gray-900 bg-gray-300 hover:bg-gray-200  active:bg-gray-400 transition ease-in-out duration-150"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
      }}
    >
      <IconCopy className="h-4 w-4 mr-1" />
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
