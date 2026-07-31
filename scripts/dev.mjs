import { createServer } from "node:http";
import { promises as fs, watch } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "public");
const args = process.argv.slice(2);
const valueFor = (name, fallback) => {
  const equal = args.find((arg) => arg.startsWith(`${name}=`));
  if (equal) return equal.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const host = valueFor("--host", "127.0.0.1");
const port = Number(valueFor("--port", "3000"));
const shouldWatch = !args.includes("--no-watch");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function build(buildArgs = []) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", "build.mjs"), ...buildArgs], { cwd: root, stdio: "inherit" });
  if (result.status !== 0) console.error("Build failed; keeping the last successful preview.");
}

build();
if (shouldWatch) {
  let timer;
  let rebuildAll = false;
  const changedPosts = new Set();
  const flush = () => {
    timer = undefined;
    if (rebuildAll) build();
    else for (const post of [...changedPosts].sort()) build(["--post", post]);
    rebuildAll = false;
    changedPosts.clear();
  };
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(flush, 80);
  };
  const scheduleFullBuild = () => {
    rebuildAll = true;
    changedPosts.clear();
    schedule();
  };
  const schedulePostBuild = (post) => {
    if (!rebuildAll) changedPosts.add(post);
    schedule();
  };
  const articleSourcesIn = (directory) => fs.readdir(directory, { withFileTypes: true })
    .then((entries) => entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => path.join(directory, entry.name)), () => []);
  const contentChanged = async (_eventType, filename) => {
    if (!filename) return scheduleFullBuild();
    const changed = path.resolve(root, "content", "posts", String(filename));
    if (!changed.startsWith(`${path.join(root, "content", "posts")}${path.sep}`)) return scheduleFullBuild();
    if (path.extname(changed).toLowerCase() === ".md") {
      const exists = await fs.stat(changed).then((entry) => entry.isFile(), () => false);
      if (!exists) return scheduleFullBuild();
      const articleSources = await articleSourcesIn(path.dirname(changed));
      for (const post of articleSources) schedulePostBuild(post);
      return;
    }
    const articleDirectory = path.dirname(changed);
    const articleSources = await articleSourcesIn(articleDirectory);
    if (!articleSources.length) return scheduleFullBuild();
    for (const post of articleSources) schedulePostBuild(post);
  };
  watch(path.join(root, "content", "posts"), { recursive: true }, (...event) => {
    contentChanged(...event).catch(scheduleFullBuild);
  });
  for (const target of [path.join(root, "theme"), path.join(root, "lib")]) watch(target, { recursive: true }, scheduleFullBuild);
  watch(path.join(root, "site.config.mjs"), scheduleFullBuild);
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    let relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (!relative || relative.endsWith("/")) relative += "index.html";
    let file = path.resolve(output, relative);
    if (!file.startsWith(`${output}${path.sep}`)) throw new Error("Invalid path");
    try { if ((await fs.stat(file)).isDirectory()) file = path.join(file, "index.html"); }
    catch { if (!path.extname(file)) file = path.join(file, "index.html"); }
    const data = await fs.readFile(file);
    response.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    response.end(data);
  } catch {
    const fallback = await fs.readFile(path.join(output, "404.html"));
    response.writeHead(404, { "content-type": "text/html; charset=utf-8" }); response.end(fallback);
  }
}).listen(port, host, () => console.log(`Freshmark preview: http://${host}:${port}`));
