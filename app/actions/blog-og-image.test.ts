import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { routes } from "../routes.ts";
import { createRouteTestRouter } from "../../test/setup.ts";
import { parseOgImageQuery } from "./blog-og-image.tsx";
import rootController from "./controller.tsx";

describe("Blog OG image route", () => {
  it("returns 400 when required params are missing", async () => {
    let router = createRouteTestRouter();
    router.map(routes, rootController);

    let response = await router.fetch(
      new URL(
        routes.blogOgImage.href({ slug: "remix-v2" }),
        "http://localhost:3000",
      ),
    );
    let body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Missing required params" });
  });

  it("returns 400 when author params are mismatched", async () => {
    let router = createRouteTestRouter();
    router.map(routes, rootController);

    let response = await router.fetch(
      new URL(
        `${routes.blogOgImage.href({ slug: "remix-v2" })}?title=Title&date=Date&authorName=Ada&authorName=Grace&authorTitle=Engineer`,
        "http://localhost:3000",
      ),
    );
    let body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: "Number of authorNames must match number of authorTitles",
    });
  });

  it("parses valid query params into a typed payload", () => {
    let result = parseOgImageQuery(
      new Request(
        new URL(
          `${routes.blogOgImage.href({ slug: "remix-v2" })}?title=Hello%20%F0%9F%91%8B&date=April%2011%2C%202026&authorName=Ada%20Lovelace&authorTitle=Engineer`,
          "http://localhost:3000",
        ),
      ),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.value.title).toBe("Hello");
    expect(result.value.displayDate).toBe("April 11, 2026");
    expect(result.value.authors).toHaveLength(1);
    expect(result.value.authors[0]).toEqual({
      name: "Ada Lovelace",
      title: "Engineer",
      imgSrc: "http://localhost:3000/authors/profile-ada-lovelace.png",
    });
  });
});
