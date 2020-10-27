import React from "react";
import Privacy from "../md/privacy.mdx";
import PublicTopNav from "../components/PublicTopNav";

export default function () {
  return (
    <>
      <PublicTopNav />
      <div className="max-w-4xl m-auto">
        <Privacy />
      </div>
    </>
  );
}
