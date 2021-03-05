import React from "react";
import { IconInfo } from "./icons";

export default function InfoBox({ children }) {
  return (
    <div className="rounded-md bg-blue-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <IconInfo className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm leading-5 text-blue-700">{children}</p>
        </div>
      </div>
    </div>
  );
}
