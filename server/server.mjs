import { createServer } from "node:http";
import { mkdir } from "node:fs/promises";
import { createFileStoreFactory } from "./file-store.mjs";
import { setStoreFactory } from "../netlify/lib/store.mjs";
import views from "../netlify/functions/views.mjs";
import comments from "../netlify/functions/comments.mjs";
import submitComment from "../netlify/functions/comment.mjs";
import commentAdmin from "../netlify/functions/comment-admin.mjs";
import register from "../netlify/functions/auth-register.mjs";
import verifyRegistration from "../netlify/functions/auth-register-verify.mjs";
import login from "../netlify/functions/auth-login.mjs";
import logout from "../netlify/functions/auth-logout.mjs";
import session from "../netlify/functions/auth-session.mjs";

const host = process.env.FRESHMARK_API_HOST || "127.0.0.1";
const port = Number(process.env.FRESHMARK_API_PORT || 8790);
const dataDirectory = process.env.FRESHMARK_DATA_DIR || "/var/lib/freshmark-api";
const maxBodySize = 64 * 1024;

process.umask(0o077);
await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
setStoreFactory(createFileStoreFactory(dataDirectory));

const routes = new Map([
  ["/api/views", views],
  ["/.netlify/functions/views", views],
  ["/api/comments", comments],
  ["/api/comments/submit", submitComment],
  ["/api/comments/admin", commentAdmin],
  ["/api/auth/register", register],
  ["/api/auth/register/verify", verifyRegistration],
  ["/api/auth/login", login],
  ["/api/auth/logout", logout],
  ["/api/auth/session", session],
]);

const json = (response, status, body) => {
  response.writeHead(status, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(body));
};

async function requestBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodySize) {
      const error = new Error("Request body is too large");
      error.code = "body_too_large";
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function webRequest(request) {
  const forwarded = request.headers["x-forwarded-proto"];
  const protocol = String(Array.isArray(forwarded) ? forwarded[0] : forwarded || "http").split(",")[0].trim();
  const origin = `${protocol}://${request.headers.host || "localhost"}`;
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) headers.append(name, item);
    }
  }
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await requestBody(request);
  return new Request(new URL(request.url || "/", origin), {
    method: request.method,
    headers,
    body,
  });
}

async function sendWebResponse(response, result) {
  const headers = {};
  for (const [name, value] of result.headers) headers[name] = value;
  response.writeHead(result.status, headers);
  if (!result.body) return response.end();
  response.end(Buffer.from(await result.arrayBuffer()));
}

const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url || "/", "http://localhost").pathname;
    if (path === "/api/health") return json(response, 200, { status: "ok" });
    const handler = routes.get(path);
    if (!handler) return json(response, 404, { error: "not_found" });
    await sendWebResponse(response, await handler(await webRequest(request)));
  } catch (error) {
    if (error?.code === "body_too_large") return json(response, 413, { error: "invalid" });
    console.error("Freshmark API request failed", error);
    if (!response.headersSent) return json(response, 500, { error: "unavailable" });
    response.destroy();
  }
});

server.requestTimeout = 15_000;
server.headersTimeout = 5_000;
server.keepAliveTimeout = 5_000;
server.listen(port, host, () => {
  const address = server.address();
  console.log(`Freshmark API listening on http://${host}:${typeof address === "object" ? address.port : port}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
