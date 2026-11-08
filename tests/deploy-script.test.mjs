import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");
const findSh = () => {
  if (process.platform !== "win32") return "sh";
  for (const candidate of ["sh", "C:\\Git\\bin\\sh.exe", "C:\\Git\\usr\\bin\\sh.exe", "C:\\Program Files\\Git\\bin\\sh.exe"]) {
    try {
      if (candidate === "sh" || existsSync(candidate)) {
        const res = spawnSync(candidate, ["-c", "exit 0"]);
        if (res.status === 0) return candidate;
      }
    } catch {}
  }
  return "sh";
};
const shCommand = findSh();

test("VPS deployment switches complete releases atomically", async () => {
  const scriptPath = new URL("../ops/freshmark-vps/deploy.sh", import.meta.url);
  const syntax = spawnSync(shCommand, ["-n", fileURLToPath(scriptPath)], { encoding: "utf8" });
  assert.equal(syntax.status, 0, syntax.stderr);

  const script = await read("ops/freshmark-vps/deploy.sh");
  const nginx = await read("ops/freshmark-vps/nginx-site.conf");
  const service = await read("ops/freshmark-vps/freshmark-api.service");
  const build = await read("scripts/build.mjs");

  assert.match(script, /flock -n 9/);
  assert.match(script, /git -C "\$repository" archive "\$revision" \| tar -x -C "\$stage"/);
  assert.match(script, /mv -Tf -- "\$pending_link" "\$current_link"/);
  assert.match(script, /API health check failed; restoring the previous release/);
  assert.doesNotMatch(script, /--show-error "\$api_health_url"/);
  assert.match(script, /npm ci --include=dev/);
  assert.match(script, /NPM_CONFIG_CACHE="\$npm_cache_dir"/);
  assert.match(script, /NPM_CONFIG_UPDATE_NOTIFIER=false/);
  assert.match(script, /npm prune --omit=dev/);
  assert.match(nginx, /root \/var\/www\/freshmark\/current\/public;/);
  assert.match(service, /WorkingDirectory=\/var\/www\/freshmark\/current/);
  assert.match(service, /ExecStart=\/usr\/bin\/node \/var\/www\/freshmark\/current\/server\/server\.mjs/);
  assert.match(build, /process\.env\.FRESHMARK_IMAGE_CACHE_DIR/);
});

test("deployment health checks bound each request and stop after 20 failures", async () => {
  const script = await read("ops/freshmark-vps/deploy.sh");
  const waitFunction = script.match(/^wait_for_api\(\) \{\n[\s\S]*?^\}/m)?.[0];
  assert.ok(waitFunction);
  const result = spawnSync(shCommand, [], {
    encoding: "utf8",
    timeout: 5000,
    input: `
${waitFunction}
api_health_url=http://127.0.0.1:8790/api/health
calls=0
curl() {
  case "$*" in
    *"--connect-timeout 2 --max-time 3"*) ;;
    *) exit 99 ;;
  esac
  calls=$((calls + 1))
  return 1
}
sleep() { :; }
if wait_for_api; then exit 98; fi
[ "$calls" -eq 20 ] || exit 97
curl() { return 0; }
wait_for_api
`,
  });
  assert.equal(result.status, 0, result.stderr);
});
