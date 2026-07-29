import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createFileStoreFactory } from "../server/file-store.mjs";
import { incrementCounter } from "../netlify/functions/views.mjs";

test("VPS file store persists values and honors conditional writes", async (context) => {
  const root = await mkdtemp(path.join(tmpdir(), "freshmark-store-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const store = createFileStoreFactory(root)({ name: "freshmark-test" });
  const longKey = `thread:${"x".repeat(700)}`;

  assert.equal(await store.get(longKey), null);
  const created = await store.setJSON(longKey, { value: 1 }, { onlyIfNew: true });
  assert.equal(created.modified, true);
  assert.deepEqual(await store.get(longKey), { value: 1 });
  assert.equal((await store.setJSON(longKey, { value: 2 }, { onlyIfNew: true })).modified, false);

  const entry = await store.getWithMetadata(longKey);
  assert.equal((await store.setJSON(longKey, { value: 3 }, { onlyIfMatch: "\"wrong\"" })).modified, false);
  assert.equal((await store.setJSON(longKey, { value: 4 }, { onlyIfMatch: entry.etag })).modified, true);

  const reopened = createFileStoreFactory(root)({ name: "freshmark-test" });
  assert.deepEqual(await reopened.get(longKey), { value: 4 });
  await reopened.delete(longKey);
  assert.equal(await reopened.get(longKey), null);
});

test("VPS file store preserves concurrent counter increments", async (context) => {
  const root = await mkdtemp(path.join(tmpdir(), "freshmark-counter-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const store = createFileStoreFactory(root)({ name: "freshmark-counters" });
  const values = await Promise.all(Array.from({ length: 20 }, () => incrementCounter(store, "site", { retries: 32 })));
  assert.equal(new Set(values).size, 20);
  assert.deepEqual(await store.get("site"), { count: 20 });
});
