import assert from "node:assert/strict";
import test from "node:test";
import { incrementCounter, normalizeViewPath } from "../netlify/functions/views.mjs";

test("view paths accept local paths and discard query strings", () => {
  assert.equal(normalizeViewPath("/posts/example/?q=test"), "/posts/example/");
  assert.equal(normalizeViewPath("/posts///example/"), "/posts/example/");
  assert.equal(normalizeViewPath("//example.com/posts/example/"), null);
  assert.equal(normalizeViewPath("posts/example/"), null);
  assert.equal(normalizeViewPath("https://example.com/posts/example/"), null);
});

test("view counter retries conditional-write conflicts", async () => {
  let count = 4;
  let etag = '"v1"';
  let writes = 0;
  const store = {
    async getWithMetadata() {
      return { data: { count }, etag };
    },
    async setJSON(key, value, options) {
      assert.equal(key, "site");
      assert.equal(options.onlyIfMatch, etag);
      writes += 1;
      if (writes === 1) {
        count = 5;
        etag = '"v2"';
        return { modified: false };
      }
      count = value.count;
      etag = '"v3"';
      return { modified: true, etag };
    },
  };

  assert.equal(await incrementCounter(store, "site"), 6);
  assert.equal(writes, 2);
});

test("view counter creates a missing key conditionally", async () => {
  const store = {
    async getWithMetadata() {
      return null;
    },
    async setJSON(key, value, options) {
      assert.equal(key, "article:test");
      assert.deepEqual(value, { count: 1 });
      assert.deepEqual(options, { onlyIfNew: true });
      return { modified: true, etag: '"v1"' };
    },
  };
  assert.equal(await incrementCounter(store, "article:test"), 1);
});
