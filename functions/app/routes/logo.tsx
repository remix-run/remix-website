import React from "react";
import * as CacheControl from "../utils/CacheControl";

export function headers() {
  return CacheControl.pub;
}

export default function Logo() {
  return (
    <div className="text-center pb-20">
      <div className="bg-gray-900 text-white py-10">
        <div className="max-w-4xl m-auto pt-10">
          <p>On Dark Backgrounds</p>
          <img src="/img/remix-on-dark.png" />

          <div className="mt-5 inline-block p-4 bg-black rounded-3xl">
            <img src="/img/remix-r-on-dark.png" className="w-60" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl m-auto mt-10">
        <p>On Light Backgrounds</p>
        <img src="/img/remix-on-light.png" />
        <div className="mt-5 inline-block p-4 bg-gray-200 rounded-3xl">
          <img src="/img/remix-r-on-light.png" className="w-60" />
        </div>
      </div>
    </div>
  );
}
