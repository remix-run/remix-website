import { Response } from "@remix-run/data";

export let error = (message) => {
  return new Response(JSON.stringify({ message }), {
    status: 500,
    headers: {
      "content-type": "application/json",
    },
  });
};
