import { clientEntry } from "remix/component";
import { press } from "remix/interaction/press";

import assets from "./counter.tsx?assets=client";

export let Counter = clientEntry(
  `${assets.entry}#Counter`,
  function Counter(handle) {
    let count = 0;

    let handlePress = () => {
      count++;
      handle.update();
    };

    return () => <button on={{ [press]: handlePress }}>Count: {count}</button>;
  },
);
