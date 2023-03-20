import invariant from "tiny-invariant";

invariant(process.env.RELEASE_PACKAGE, "RELEASE_PACKAGE is not set");
export const RELEASE_PACKAGE = process.env.RELEASE_PACKAGE;
