import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { routes } from "../../../routes.ts";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { createRouteTestRouter } from "../../../../test/setup.ts";
import jam2025Controller, { getEventStatus } from "./controller.tsx";

// The event runs Oct 10, 2025, 00:00–18:00 in Toronto (EDT, UTC-04:00). These
// assertions use absolute instants so the result must not depend on the
// machine's local timezone.
let instant = (iso: string) => new Date(iso).getTime();

describe("Remix Jam 2025 routes", () => {
  it("renders the newsletter signup fragment", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2025, jam2025Controller);

    let response = await router.fetch(
      new URL(
        `${routes.jam.y2025.newsletterSignup.href()}?subscription=success`,
        "http://localhost:3000",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    let html = await response.text();
    expect(html).toContain("rmx-document");
    expect(html).toContain("You're good to go");
  });

  it("keeps the index response as a cacheable document", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2025, jam2025Controller);

    let response = await router.fetch(
      new URL(routes.jam.y2025.index.href(), "http://localhost:3000"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);
    expect(await response.text()).toContain("<html");
  });
});

describe("Jam 2025 getEventStatus", () => {
  it("reports 'before' prior to the event start", () => {
    expect(getEventStatus(instant("2025-10-09T23:59:59-04:00"))).toBe("before");
  });

  it("reports 'live' at the event start", () => {
    expect(getEventStatus(instant("2025-10-10T00:00:00-04:00"))).toBe("live");
  });

  it("reports 'after' once the event has ended", () => {
    expect(getEventStatus(instant("2025-10-10T18:00:00-04:00"))).toBe("after");
  });

  it("is timezone-independent: a UTC instant mid-event still reports 'live'", () => {
    // 16:00Z on Oct 10 is 12:00 EDT, squarely inside the event window.
    expect(getEventStatus(instant("2025-10-10T16:00:00Z"))).toBe("live");
  });
});
