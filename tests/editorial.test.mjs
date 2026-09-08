import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import test from "node:test";
import CleanCSS from "clean-css";
import { build } from "esbuild";

test("paper laboratory stays within critical CSS and initial JS budgets", async () => {
  const root = new URL("../", import.meta.url);
  const css = (await Promise.all(["theme/critical.css", "theme/editorial.css"].map((file) => readFile(new URL(file, root), "utf8")))).join("\n");
  const minified = new CleanCSS({ level: 2 }).minify(css);
  assert.deepEqual(minified.errors, []);
  assert.ok(gzipSync(minified.styles).length < 5 * 1024, "Critical CSS must remain under 5KB gzip");
  const output = await build({ entryPoints: [new URL("theme/app.js", root).pathname], bundle: true, splitting: true, format: "esm", minify: true, write: false, outdir: new URL(".freshmark-cache/budget/", root).pathname });
  const entry = output.outputFiles.find((file) => file.path.endsWith("/app.js"));
  assert.ok(gzipSync(entry.contents).length <= 9776 * 1.1, "Initial JS must remain within 110% of the previous version");
});
