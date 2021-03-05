import React from "react";

export default function BrowserOnly({ children }) {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line
  let [firstRender, setFirstRender] = React.useState(true);
  // eslint-disable-next-line
  React.useLayoutEffect(() => {
    setFirstRender(false);
  }, []);
  return firstRender ? null : children;
}
