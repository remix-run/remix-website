import {
  unstable_MiddlewareFunction as Middleware,
  redirect,
} from "react-router";
import semver from "semver";

const redirectOldDocs: Middleware = ({ request }) => {
  const { pathname } = new URL(request.url);
  if (pathname === "/docs") {
    throw redirect(`https://v2.remix.run/docs`);
  }

  const [lang, ref, ...path] = pathname.split("/").slice(2);
  if (lang === "en") {
    // Redirect specific versions to GitHub docs at the corresponding tag
    const version = semver.clean(ref);
    if (version !== null) {
      // We switched from `v.x.y.z` to `remix@x.y.z` GitHub tags starting at v1.6.5
      const tag = semver.lte(version, "1.6.4")
        ? `v${version}`
        : `remix@${version}`;

      const markdownDoc = path.length > 0 ? path.join("/") + ".md" : "";
      throw redirect(
        `https://github.com/remix-run/remix/tree/${encodeURIComponent(tag)}/docs/${markdownDoc}`,
      );
    }

    // /docs/en/<branch>/* -> v2.remix.run/docs/*
    if (ref === "main" || ref === "dev") {
      throw redirect(`https://v2.remix.run/docs/${path.join("/")}`);
    }

    // Fallback: /docs/en/* -> v2.remix.run/docs/*
    throw redirect(`https://v2.remix.run/docs/${ref}/${path}`);
  }
};

export const unstable_middleware: Array<Middleware> = [redirectOldDocs];
