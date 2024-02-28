import { replaceRelativeLinks } from "../resources.server";

describe("replaceRelativeLinks", () => {
  it("should replace relative links with absolute links for images", () => {
    const input = `<img src="./relative">`;
    const repoUrl = "https://my-repo";
    const expected = `<img src="${repoUrl}/raw/main/relative">`;
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(expected);
  });

  it("should not replace relative links with absolute links for links", () => {
    const input = `<link src="./relative">`;
    const repoUrl = "https://my-repo";

    expect(replaceRelativeLinks(input, repoUrl)).toEqual(input);
  });

  it("should replace relative links with absolute links for multiple images", () => {
    const input = `<img src="./relative1"><img src="./relative2">`;
    const repoUrl = "https://my-repo";
    const expected = `<img src="${repoUrl}/raw/main/relative1"><img src="${repoUrl}/raw/main/relative2">`;
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(expected);
  });

  it("should replace relative links with absolute links for images with other attributes", () => {
    const input = `<img src="./relative" alt="alt text">`;
    const repoUrl = "https://my-repo";
    const expected = `<img src="${repoUrl}/raw/main/relative" alt="alt text">`;
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(expected);
  });

  it("should replace relative links with absolute links for images with other attributes and multiple images", () => {
    const input = `<img src="./relative" alt="alt text"><img src="./relative2" alt="alt text2">`;
    const repoUrl = "https://my-repo";
    const expected = `<img src="${repoUrl}/raw/main/relative" alt="alt text"><img src="${repoUrl}/raw/main/relative2" alt="alt text2">`;
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(expected);
  });

  it("should replace relative links with absolute links for images with other attributes and multiple images and other tags", () => {
    const input = `<img src="./relative" alt="alt text"><img src="./relative2" alt="alt text2"><link src="./relative">`;
    const repoUrl = "https://my-repo";
    const expected = `<img src="${repoUrl}/raw/main/relative" alt="alt text"><img src="${repoUrl}/raw/main/relative2" alt="alt text2"><link src="./relative">`;
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(expected);
  });

  it("should not replace relative links with absolute links for images with absolute links", () => {
    const input = `<img src="https://absolute">`;
    const repoUrl = "https://my-repo";
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(input);
  });

  it("should not replace relative links with absolute links for images with absolute links and replace with relative links properly", () => {
    const input = `<img src="https://absolute"><img src="./relative">`;
    const repoUrl = "https://my-repo";
    const expected = `<img src="https://absolute"><img src="${repoUrl}/raw/main/relative">`;
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(expected);
  });

  it("should not replace relative links that are not in the src attribute", () => {
    const input = `<img alt="./relative">`;
    const repoUrl = "https://my-repo";
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(input);
  });

  it("should not replace relative links that are not in the img tag", () => {
    const input = `you can find it here ./relative`;
    const repoUrl = "https://my-repo";
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(input);
  });
});
