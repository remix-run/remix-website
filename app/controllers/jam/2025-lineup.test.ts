import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { jam2025LineupHandler } from "./2025-lineup.tsx";
import { routes } from "../../routes.ts";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { createRouteTestRouter } from "../../../test/create-route-test-router.ts";

describe("Jam lineup route", () => {
  it("renders the schedule with Jam page assets", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2025.lineup, jam2025LineupHandler);

    let response = await router.fetch("http://localhost:3000/jam/2025/lineup");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();
    expect(html).toContain("Schedule and Lineup | Remix Jam 2025");
    expect(html).toContain('href="/styles/jam.css"');
    expect(html).toContain("Interactive MCP with React Router");
    expect(html).toContain("Kent C. Dodds");
    expect(html).toContain("Introducing Remix\u00A03 — Part 1");
    expect(html).toContain("Ryan Florence");
  });
});
