#!/usr/bin/env node
// Freshmark editor server: `npm run editor`. Serves a Typora-style Markdown editor and reads and
// writes posts in content/posts. Runs anywhere Node runs, including Termux on Android and Windows.
import http from "node:http";
import { promises as fs, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { summaryFromBody } from "../lib/markdown.mjs";
import { EditorError, createPost, createTranslation, imageTypes, listPosts, loadPost, resolveContentPath, saveAsset, savePost, vocabulary } from "../lib/editor-store.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const editorDir = path.join(root, "editor");
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : fallback;
};
const contentDir = path.resolve(root, option("--content", path.join("content", "posts")));
const host = option("--host", "127.0.0.1");
const port = Number(option("--port", "4321"));
const site = option("--site", "http://127.0.0.1:3000");
const loopbackNames = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

// A per-install token: needed for every API call, kept across restarts so an installed app keeps working.
const tokenFile = path.join(root, ".freshmark-cache", "editor-token");
const token = await fs.readFile(tokenFile, "utf8").then((value) => value.trim()).catch(async () => {
  const value = randomBytes(24).toString("base64url");
  await fs.mkdir(path.dirname(tokenFile), { recursive: true });
  await fs.writeFile(tokenFile, value, { mode: 0o600 });
  return value;
});
const tokenMatches = (value) => typeof value === "string" && value.length === token.length && timingSafeEqual(Buffer.from(value), Buffer.from(token));

let bundleCache = null;
async function sourcesChangedAt() {
  const files = [...(await fs.readdir(editorDir)).map((name) => path.join(editorDir, name)), path.join(root, "lib", "math-config.mjs")];
  const stats = await Promise.all(files.map((file) => fs.stat(file).catch(() => null)));
  return Math.max(...stats.filter(Boolean).map((stat) => stat.mtimeMs));
}
async function bundle() {
  const changedAt = await sourcesChangedAt();
  if (bundleCache && bundleCache.changedAt >= changedAt) return bundleCache;
  const result = await build({ entryPoints: [path.join(editorDir, "main.js")], bundle: true, format: "esm", minify: true, target: ["es2020"], write: false, legalComments: "none" });
  const katexCss = (await fs.readFile(path.join(root, "node_modules", "katex", "dist", "katex.min.css"), "utf8")).replaceAll("url(fonts/", "url(/assets/katex/fonts/").replaceAll("font-display:block", "font-display:swap");
  bundleCache = { changedAt, js: result.outputFiles[0].contents, css: `${katexCss}\n${await fs.readFile(path.join(editorDir, "editor.css"), "utf8")}` };
  return bundleCache;
}

const types = { ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/manifest+json", ...imageTypes };

function send(response, status, body, headers = {}) {
  response.writeHead(status, { "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", ...headers });
  response.end(body);
}
const json = (response, status, value) => send(response, status, JSON.stringify(value), { "content-type": "application/json; charset=utf-8" });

async function readBody(request, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw new EditorError(413, "Request body too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
const readJson = async (request) => {
  try {
    return JSON.parse((await readBody(request, 8 * 1024 * 1024)).toString("utf8") || "{}");
  } catch (error) {
    if (error instanceof EditorError) throw error;
    throw new EditorError(400, "Invalid JSON");
  }
};

function hostName(request) {
  const value = String(request.headers.host || "");
  return value.startsWith("[") ? value.slice(0, value.indexOf("]") + 1) : value.split(":")[0];
}
const fromLoopback = (request) => ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(request.socket.remoteAddress);
// Refuse foreign Host headers on loopback so a malicious site cannot use DNS rebinding to reach the editor.
const trustedLocal = (request) => fromLoopback(request) && loopbackNames.has(hostName(request));
const cookieToken = (request) => String(request.headers.cookie || "").match(/(?:^|;\s*)fm_editor=([^;]+)/)?.[1];

async function serveStatic(response, file, type) {
  const contents = await fs.readFile(file).catch(() => null);
  if (!contents) return send(response, 404, "Not found");
  send(response, 200, contents, { "content-type": type, "cache-control": "no-cache" });
}

async function handleApi(request, response, url) {
  if (!tokenMatches(request.headers["x-freshmark-token"])) throw new EditorError(401, "Missing or invalid editor token");
  const route = `${request.method} ${url.pathname}`;
  const file = url.searchParams.get("file");
  switch (route) {
    case "GET /api/posts": return json(response, 200, await listPosts(contentDir));
    case "GET /api/vocabulary": return json(response, 200, await vocabulary(contentDir));
    case "GET /api/post": return json(response, 200, await loadPost(contentDir, file));
    case "PUT /api/post": return json(response, 200, await savePost(contentDir, await readJson(request)));
    case "POST /api/post": return json(response, 201, await createPost(contentDir, { ...(await readJson(request)), templateFile: path.join(root, "templates", "post.md") }));
    case "POST /api/translation": return json(response, 201, await createTranslation(contentDir, (await readJson(request)).file));
    case "POST /api/summary": return json(response, 200, { summary: summaryFromBody(String((await readJson(request)).body || "").trim()) });
    case "POST /api/asset": return json(response, 201, await saveAsset(contentDir, file, url.searchParams.get("name"), await readBody(request, 20 * 1024 * 1024 + 1)));
    default: throw new EditorError(404, "Unknown API route");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://editor.local");
    if (url.pathname.startsWith("/api/")) return await handleApi(request, response, url);
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const allowed = trustedLocal(request) || tokenMatches(url.searchParams.get("token")) || tokenMatches(cookieToken(request));
      if (!allowed) return send(response, 401, "Open the editor with the URL printed in the terminal (it includes ?token=…).", { "content-type": "text/plain; charset=utf-8" });
      const html = (await fs.readFile(path.join(editorDir, "index.html"), "utf8")).replace("__FRESHMARK_EDITOR_CONFIG__", JSON.stringify({ token, site }).replaceAll("<", "\\u003c"));
      return send(response, 200, html, {
        "content-type": "text/html; charset=utf-8",
        "set-cookie": `fm_editor=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000`,
        "content-security-policy": "default-src 'self'; img-src 'self' data: blob: https: http:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'",
      });
    }
    if (url.pathname.startsWith("/content/")) {
      if (!trustedLocal(request) && !tokenMatches(cookieToken(request))) return send(response, 401, "Unauthorized");
      const relative = decodeURIComponent(url.pathname.slice("/content/".length));
      const extension = path.extname(relative).toLowerCase();
      return await serveStatic(response, resolveContentPath(contentDir, relative, { extensions: Object.keys(imageTypes) }), imageTypes[extension]);
    }
    if (url.pathname === "/assets/editor.js") return send(response, 200, (await bundle()).js, { "content-type": types[".js"], "cache-control": "no-cache" });
    if (url.pathname === "/assets/editor.css") return send(response, 200, (await bundle()).css, { "content-type": types[".css"], "cache-control": "no-cache" });
    if (url.pathname === "/assets/fonts/anthropic-sans-variable.woff2") return await serveStatic(response, path.join(root, "theme", "fonts", "anthropic-sans-variable.woff2"), types[".woff2"]);
    if (url.pathname.startsWith("/assets/katex/fonts/")) {
      const name = path.basename(url.pathname);
      return /^[\w-]+\.woff2$/.test(name) ? await serveStatic(response, path.join(root, "node_modules", "katex", "dist", "fonts", name), types[".woff2"]) : send(response, 404, "Not found");
    }
    if (url.pathname === "/icon.svg") return await serveStatic(response, path.join(root, "theme", "favicon.svg"), types[".svg"]);
    if (/^\/icons\/[\w-]+\.png$/.test(url.pathname)) return await serveStatic(response, path.join(root, "theme", "icons", path.basename(url.pathname)), types[".png"]);
    if (url.pathname === "/sw.js") return await serveStatic(response, path.join(editorDir, "sw.js"), types[".js"]);
    if (url.pathname === "/manifest.webmanifest") {
      return send(response, 200, JSON.stringify({
        name: "Freshmark Editor", short_name: "Freshmark", description: "Write Freshmark posts with live LaTeX preview.",
        start_url: "/", scope: "/", display: "standalone", background_color: "#f0eee6", theme_color: "#f0eee6",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" }, { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }, { src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
      }), { "content-type": types[".webmanifest"] });
    }
    send(response, 404, "Not found");
  } catch (error) {
    if (error instanceof EditorError) return json(response, error.status, { error: error.message, ...(error.currentHash ? { currentHash: error.currentHash } : {}) });
    if (error.code === "ENOENT") return json(response, 404, { error: "Not found" });
    console.error(error);
    json(response, 500, { error: error.message });
  }
});

function openBrowser(url) {
  const commands = { win32: ["cmd", ["/c", "start", "", url]], darwin: ["open", [url]], android: ["termux-open-url", [url]] };
  const [command, commandArgs] = commands[process.platform] || ["xdg-open", [url]];
  try { spawn(command, commandArgs, { stdio: "ignore", detached: true }).on("error", () => {}).unref(); } catch {}
}

await bundle();
server.listen(port, host, () => {
  const local = `http://${loopbackNames.has(host) || host === "0.0.0.0" || host === "::" ? "127.0.0.1" : host}:${port}/`;
  console.log(`Freshmark editor: ${local}`);
  if (!loopbackNames.has(host)) {
    const addresses = Object.values(os.networkInterfaces()).flat().filter((entry) => entry && entry.family === "IPv4" && !entry.internal).map((entry) => entry.address);
    for (const address of host === "0.0.0.0" ? addresses : [host]) console.log(`  On your network: http://${address}:${port}/?token=${token}`);
    console.log("  Keep this token private: it allows editing your posts.");
  }
  if (!existsSync(path.join(root, "public", "index.html"))) console.log(`  Tip: run "npm run dev" for the site preview at ${site}.`);
  if (args.includes("--open")) openBrowser(local);
});
