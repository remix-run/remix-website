import { describe, expect, it } from "vitest";
import { jam2025LineupHandler } from "./2025-lineup";
import { routes } from "../../routes";
import { createRouteTestRouter } from "../../../test/create-route-test-router";

describe("Jam lineup route", () => {
  it("renders the jam stylesheet link", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2025.lineup, jam2025LineupHandler);

    let response = await router.fetch("http://localhost:3000/jam/2025/lineup");

    expect(response.status).toBe(200);

    let html = await response.text();
    expect(html).toContain("Schedule and Lineup | Remix Jam 2025");
    expect(html).toContain('href="/styles/jam.css"');
  });
});
