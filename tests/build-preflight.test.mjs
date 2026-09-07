import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import test from "node:test";

test("missing PDF renderer fails before modifying build output", async () => {
  const root = new URL("../", import.meta.url);
  const output = new URL("public/", root);
  const snapshot = async () => {
    const names = await readdir(output).catch((error) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    return Promise.all(names.sort().map(async (name) => {
      const entry = await stat(new URL(name, output));
      return [name, entry.mtimeMs, entry.size];
    }));
  };
  const before = await snapshot();
  const result = spawnSync(process.execPath, [new URL("scripts/build.mjs", root).pathname], {
    cwd: root,
    env: { ...process.env, FRESHMARK_WEASYPRINT: new URL("missing-renderer-for-preflight-test", root).pathname },
    encoding: "utf8",
    timeout: 10000,
  });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /WeasyPrint was not found/);
  assert.deepEqual(await snapshot(), before);
});
