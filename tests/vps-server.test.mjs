import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { request } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

test("mailer rejects oversized UTF-8 streams before the client finishes sending", { timeout: 10000 }, async (context) => {
  const child = spawn(process.execPath, [new URL("../ops/freshmark-mailer/server.mjs", import.meta.url).pathname], {
    env: { ...process.env, MAILER_PORT: "0", MAILER_TOKEN: "local-test-token" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  context.after(async () => {
    if (child.exitCode === null) {
      const exited = once(child, "exit");
      child.kill("SIGKILL");
      await exited;
    }
  });
  let output = "";
  const port = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code) => reject(new Error(`Mailer exited: ${code}`)));
    child.stdout.on("data", (chunk) => {
      output += chunk;
      const match = output.match(/127\.0\.0\.1:(\d+)/);
      if (match) resolve(Number(match[1]));
    });
  });
  const status = await new Promise((resolve, reject) => {
    const req = request({
      hostname: "127.0.0.1", port, path: "/api/mail/comment-code", method: "POST",
      headers: { authorization: "Bearer local-test-token", "transfer-encoding": "chunked" },
    }, (response) => {
      response.resume();
      response.on("end", () => { resolve(response.statusCode); req.destroy(); });
      response.on("error", reject);
    });
    req.on("error", reject);
    context.after(() => req.destroy());
    // Under 4096 characters but over 4096 bytes; deliberately leave it open.
    req.write("中".repeat(1400));
  });
  assert.equal(status, 413);
  assert.equal(child.exitCode, null);
});

test("VPS API returns 413 for oversized streamed bodies and stays healthy", { timeout: 10000 }, async (context) => {
  const directory = await mkdtemp(path.join(tmpdir(), "freshmark-api-test-"));
  const child = spawn(process.execPath, [new URL("../server/server.mjs", import.meta.url).pathname], {
    env: { ...process.env, FRESHMARK_API_HOST: "127.0.0.1", FRESHMARK_API_PORT: "0", FRESHMARK_DATA_DIR: directory, FRESHMARK_NETLIFY_FUNCTIONS: "true" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  context.after(async () => {
    if (child.exitCode === null) {
      const exited = once(child, "exit");
      child.kill("SIGKILL");
      await exited;
    }
    await rm(directory, { recursive: true, force: true });
  });
  let output = "";
  const port = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code) => reject(new Error(`API exited: ${code}`)));
    child.stdout.on("data", (chunk) => {
      output += chunk;
      const match = output.match(/127\.0\.0\.1:(\d+)/);
      if (match) resolve(Number(match[1]));
    });
  });
  const result = await new Promise((resolve, reject) => {
    const req = request({ hostname: "127.0.0.1", port, path: "/api/views", method: "POST", headers: { "transfer-encoding": "chunked" } }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ status: response.statusCode, body }));
      response.on("error", reject);
    });
    req.on("error", reject);
    req.end(Buffer.alloc(65 * 1024, "x"));
  });
  assert.equal(result.status, 413);
  assert.deepEqual(JSON.parse(result.body), { error: "invalid" });
  const health = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(health.status, 200);
  const view = await fetch(`http://127.0.0.1:${port}/api/views`, {
    method: "POST", body: JSON.stringify({ path: "/", article: false }),
  });
  assert.deepEqual(await view.json(), { siteViews: 1, articleViews: null });
});
