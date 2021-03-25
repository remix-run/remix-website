import { Octokit } from "@octokit/core";
import { promises as fs } from "fs";
import path from "path";
import parseAttributes from "gray-matter";
import { processMarkdown } from "@ryanflorence/md";
import { LoaderFunction, redirect, Request } from "@remix-run/core";
import * as semver from "semver";
import { config } from "../utils/firebase.server";
import LRU from "lru-cache";

let GITHUB_TOKEN = config.github.token;
let octokit = new Octokit({ auth: GITHUB_TOKEN });
let api = "https://api.github.com/repos";

let where = process.env.NODE_ENV === "production" ? "remote" : "local";
// let where = "local";
// let where = "remote";

let maxAge = where === "local" ? 100 : 3.6e6; // 1 hour

let menuCache = new LRU<string, MenuDir>({ maxAge });
let versionsCache = new LRU<string, VersionHead[]>({ maxAge });
let docCache = new LRU<string, Doc>({ maxAge });

export interface MenuDir {
  type: "dir";
  name: string;
  path: string;
  title: string;
  files: MenuFile[];
  dirs?: MenuDir[];
  hasIndex: boolean;
  attributes: { [key: string]: string };
}

export interface MenuFile {
  type: "file";
  /**
   * The file name on disk, with extension
   */
  name: string;

  /**
   * The url path in the UI
   */
  path: string;
  title: string;
  attributes: { [key: string]: string };
}

export type MenuItem = MenuDir | MenuFile;

interface File {
  type: string;
  name: string;
  path: string;
}

export type Doc = {
  html: string;
  title: string;
  attributes: { [key: string]: string };
};

export type Config = {
  /**
   * The owner of the repo containing the docs
   */
  owner: string;
  /**
   * The repo name containing the docs.
   */
  repo: string;

  /**
   * The path of the docs in the repo on GitHub
   */
  remotePath: string;

  /**
   * Local path of files during development
   */
  localPath: string;

  /**
   * Semver range of versions you want to show up in the versions dropdown
   */
  versions: string;
};

export interface VersionHead {
  /**
   * like v2 or v0.4
   */
  head: string;

  /**
   * The full version like v2.1.1
   */
  version: string;

  /**
   * So we know to fetch from the ref or not
   */
  isLatest: boolean;
}

export async function getMenu(
  config: Config,
  version: VersionHead
): Promise<MenuDir> {
  let cached = menuCache.get(version.head);
  if (cached) {
    return cached;
  }
  let dirName = where === "remote" ? config.remotePath : config.localPath;
  let menu = await getContentsRecursively(
    config,
    dirName,
    "root",
    dirName,
    version
  );
  menuCache.set(version.head, menu);
  return menu;
}

export async function getDoc(
  config: Config,
  slug: string,
  version: VersionHead
): Promise<Doc | null> {
  let cacheKey = `${slug}${version.head}`;
  let cached = docCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let fileContents =
    where === "remote"
      ? await getDocRemote(config, slug, version)
      : await getDocLocal(config, slug);

  if (!fileContents) return null;

  let { data, content } = parseAttributes(fileContents);
  let html = (await processMarkdown(content)).toString();
  let doc: Doc = { attributes: data, html, title: data.title || slug };
  docCache.set(cacheKey, doc);
  return doc;
}

async function getDocRemote(
  config: Config,
  filePath: string,
  version: VersionHead
): Promise<string> {
  let dirName = path.join(config.remotePath, filePath);
  let ext = `.md`;

  let fileName = dirName + ext;
  let indexName = path.join(dirName, "index") + ext;
  let notFoundFileName = path.join(config.remotePath, "404") + ext;

  try {
    return await getFileRemote(config, fileName, version);
  } catch (error) {
    try {
      return await getFileRemote(config, indexName, version);
    } catch (error) {
      try {
        return await getFileRemote(config, notFoundFileName, version);
      } catch (error) {
        // seriously, come on...
        throw new Error("Doc not found, also, the 404 doc was not found.");
      }
    }
  }
}

async function getDocLocal(config: Config, filePath: string): Promise<string> {
  let dirName = path.join(config.localPath, filePath);
  let ext = `.md`;

  let fileName = dirName + ext;
  let indexName = path.join(dirName, "index") + ext;
  let notFoundFileName = path.join(config.localPath, "404") + ext;

  let actualFileWeWant;

  try {
    // if it's a folder
    await fs.access(dirName);
    actualFileWeWant = indexName;
  } catch (e) {
    actualFileWeWant = fileName;
  }

  try {
    // see if we have the file
    await fs.access(actualFileWeWant);
  } catch (error) {
    // 404 doc
    actualFileWeWant = notFoundFileName;
    try {
      fs.access(actualFileWeWant);
    } catch (error) {
      // seriously, come on...
      throw new Error("Doc not found, also, the 404 doc was not found.");
    }
  }

  let file = await fs.readFile(actualFileWeWant);
  return file.toString();
}

// TODO: make this return a list of File[]
async function getContentsRemote(
  config: Config,
  slug: string,
  version: VersionHead
) {
  let href = `${api}/${config.owner}/${config.repo}/contents/${slug}`;
  if (!version.isLatest) {
    href += `?ref=${version.version}`;
  }

  let res = await fetch(href, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      accept: "application/json",
    },
  });
  if (res.status !== 200) {
    throw new Error("Failed to fetch remote contents");
  }

  return (await res.json()) as File[];
}

async function getContentsLocal(config: Config, slug: string): Promise<File[]> {
  let dirDiskPath = path.join(process.cwd(), slug);
  let dir = await fs.readdir(dirDiskPath);

  return Promise.all(
    dir.map(async (fileName) => {
      let fileDiskPath = path.join(dirDiskPath, fileName);
      let isDir = (await fs.stat(fileDiskPath)).isDirectory();
      let emulatedRemotePath = `${slug}/${fileName}`;
      return {
        type: isDir ? "dir" : "file",
        name: fileName,
        path: emulatedRemotePath,
      };
    })
  );
}

async function getAttributes(
  config: Config,
  diskPath: string,
  version: VersionHead
) {
  let contents =
    where === "remote"
      ? await getFileRemote(config, diskPath, version)
      : await getFileLocal(config, diskPath);
  let { data, content } = parseAttributes(contents);
  return { attributes: data, content };
}

async function getFileLocal(config: Config, fileName: string) {
  let docsRoot = path.join(process.cwd(), config.localPath);
  let resolvedPath = path.join(docsRoot, fileName);
  return fs.readFile(resolvedPath);
}

async function getFileRemote(
  config: Config,
  slug: string,
  version: VersionHead
) {
  let href = `${api}/${config.owner}/${config.repo}/contents/${slug}`;
  if (!version.isLatest) {
    href += `?ref=${version.version}`;
  }

  let res = await fetch(href, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      accept: "application/json",
    },
  });

  if (res.status !== 200) {
    throw new Error(`Failed to fetch remote file ${slug}`);
  }

  let data = await res.json();
  return Buffer.from(data.content, "base64").toString("ascii");
}

// TODO: need to get the "root route path" into these links
async function getContentsRecursively(
  config: Config,
  dirPath: string,
  dirName: string,
  rootName: string,
  version: VersionHead
): Promise<MenuDir> {
  let contents =
    where === "remote"
      ? await getContentsRemote(config, dirPath, version)
      : await getContentsLocal(config, dirPath);

  if (!Array.isArray(contents)) {
    throw new Error(
      `You need to have some folders inside of ${dirPath} to make a menu`
    );
  }

  let files = contents.filter(
    (file) =>
      file.type === "file" &&
      // is markdown
      file.name.match(/\.md$/) &&
      // not 404
      !file.name.match(/^404\.md$/)
  );

  let hasIndexFile = !!contents.find((file) => file.name === `index.md`);
  let { attributes, content } = hasIndexFile
    ? await getAttributes(config, path.join(dirPath, `index.md`), version)
    : { attributes: {}, content: "" };

  let hasIndex = content.trim() !== "";
  let ext = `.md`;

  let dir: MenuDir = {
    type: "dir",
    name: dirName,
    path: `/${version.head}${dirPath.replace(rootName, "")}`,
    hasIndex,
    attributes,
    title: attributes.title || dirName,
    files: (
      await Promise.all(
        files
          .filter((file) => file.name !== `index${ext}`)
          .map(
            async (file): Promise<MenuFile> => {
              let { attributes } = await getAttributes(
                config,
                file.path,
                version
              );
              let linkPath = file.path
                .replace(rootName, "")
                .slice(0, -ext.length);
              return {
                name: file.name,
                path: `/${version.head}${linkPath}`,
                type: "file",
                attributes,
                title: attributes.title || path.basename(linkPath),
              };
            }
          )
      )
    ).sort(sortByAttributes),
  };

  let dirs = contents.filter((file) => file.type === "dir");
  if (dirs.length) {
    dir.dirs = (
      await Promise.all(
        dirs.map((dir) =>
          getContentsRecursively(config, dir.path, dir.name, rootName, version)
        )
      )
    )
      // get rid of directories with no files
      .filter((dir) => dir.files.length)
      .sort(sortByAttributes);
  }

  return dir;
}

function sortByAttributes(a: MenuItem, b: MenuItem) {
  if (a.attributes.order && !b.attributes.order) return -1;
  if (a.attributes.order && b.attributes.order) {
    return (
      parseInt(a.attributes.order || "0") - parseInt(b.attributes.order || "0")
    );
  }

  if (a.attributes.published && b.attributes.published) {
    return (
      new Date(b.attributes.published).getTime() -
      new Date(a.attributes.published).getTime()
    );
  }

  return a.title.localeCompare(b.title);
}

export function getCacheControl(urlStr: string) {
  let url = new URL(urlStr);
  let forceLatest = url.searchParams.has("latest");
  return forceLatest
    ? "no-cache"
    : "public, max-age=60, s-maxage=60, stale-while-revalidate=2592000";
}

/**
 * Adds trailing slashes so relative markdown links resolve correctly in the browser
 */
export function addTrailingSlash(request: Request) {
  return (fn: () => ReturnType<LoaderFunction>) => {
    let url = new URL(request.url);
    if (
      // not a fetch request
      !url.searchParams.has("_data") &&
      // doesn't have a trailing slash
      !url.pathname.endsWith("/")
    ) {
      return redirect(request.url + "/", { status: 308 });
    }
    return fn();
  };
}

export async function getVersions(config: Config): Promise<VersionHead[]> {
  let cached = versionsCache.get("default");
  if (cached) {
    return cached;
  }
  let res: any = await octokit.request(
    "GET /repos/{owner}/{repo}/git/refs/tags",
    {
      owner: config.owner,
      repo: config.repo,
    }
  );

  let tags: string[] = res.data
    .map((tag: any) => tag.ref.replace(/^refs\/tags\//, ""))
    .filter((tag: string) => semver.satisfies(tag, config.versions));

  let versions = transformVersionsToLatest(tags);
  versionsCache.set("default", versions);
  return versions;
}

// Takes a list of semver tags and returns just the top of each major(ish)
// version in reverse order (latest first)
export function transformVersionsToLatest(tags: string[]) {
  let sorted = semver.sort(tags);
  let heads = new Map<string, string>();

  for (let tag of sorted) {
    let info = semver.coerce(tag)!;
    if (info.major > 0) {
      // 1.x.x
      heads.set(`v${info.major}`, info.version);
    } else if (info.minor > 0) {
      // 0.1.x
      heads.set(`v0.${info.minor}`, info.version);
    } else {
      // 0.0.1
      heads.set(`v0.0.${info.patch}`, info.version);
    }
  }

  let versions: VersionHead[] = [];

  for (let [head, version] of heads) {
    versions.unshift({ head: head, version: version, isLatest: false });
  }

  versions[0].isLatest = true;

  return versions;
}

export function getVersion(head: string, versions: VersionHead[]) {
  return versions.find((v) => v.head === head);
}
