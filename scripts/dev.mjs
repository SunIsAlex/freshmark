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
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml" };

function build() {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", "build.mjs")], { cwd: root, stdio: "inherit" });
  if (result.status !== 0) console.error("Build failed; keeping the last successful preview.");
}

build();
if (shouldWatch) {
  let timer;
  const rebuild = () => { clearTimeout(timer); timer = setTimeout(build, 80); };
  for (const target of [path.join(root, "content", "posts"), path.join(root, "theme"), path.join(root, "lib")]) watch(target, rebuild);
  watch(path.join(root, "site.config.mjs"), rebuild);
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
