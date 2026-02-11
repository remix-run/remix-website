export async function loader() {
  return new Response("OK", {
    headers: { "Cache-Control": "no-store" },
  });
}
