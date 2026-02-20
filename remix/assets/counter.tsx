import { clientEntry } from "remix/component";
import { press } from "remix/interaction/press";

import assets from "./counter.tsx?assets=client";

export const Counter = clientEntry(
  `${assets.entry}#Counter`,
  function Counter(handle) {
    let count = 0;

    const handlePress = () => {
      count++;
      handle.update();
    };

    return () => <button on={{ [press]: handlePress }}>Count: {count}</button>;
  },
);
