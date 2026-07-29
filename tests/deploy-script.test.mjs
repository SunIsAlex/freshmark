import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("VPS deployment switches complete releases atomically", async () => {
  const scriptPath = new URL("../ops/freshmark-vps/deploy.sh", import.meta.url);
  const syntax = spawnSync("sh", ["-n", scriptPath.pathname], { encoding: "utf8" });
  assert.equal(syntax.status, 0, syntax.stderr);

  const script = await read("ops/freshmark-vps/deploy.sh");
  const nginx = await read("ops/freshmark-vps/nginx-site.conf");
  const service = await read("ops/freshmark-vps/freshmark-api.service");
  const build = await read("scripts/build.mjs");

  assert.match(script, /flock -n 9/);
  assert.match(script, /git -C "\$repository" archive "\$revision" \| tar -x -C "\$stage"/);
  assert.match(script, /mv -Tf -- "\$pending_link" "\$current_link"/);
  assert.match(script, /API health check failed; restoring the previous release/);
  assert.match(script, /npm ci --include=dev/);
  assert.match(script, /npm prune --omit=dev/);
  assert.match(nginx, /root \/var\/www\/freshmark\/current\/public;/);
  assert.match(service, /WorkingDirectory=\/var\/www\/freshmark\/current/);
  assert.match(service, /ExecStart=\/usr\/bin\/node \/var\/www\/freshmark\/current\/server\/server\.mjs/);
  assert.match(build, /process\.env\.FRESHMARK_IMAGE_CACHE_DIR/);
});
