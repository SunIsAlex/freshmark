import assert from "node:assert/strict";
import test from "node:test";
import { createRequestCache } from "../lib/request-cache.mjs";

test("prefetch and navigation share the same in-flight request", async () => {
  const cache = createRequestCache();
  let requests = 0;
  const load = async () => { requests += 1; return { html: "article" }; };
  const first = cache.get("article", load);
  const second = cache.get("article", load);
  assert.equal(first, second);
  assert.deepEqual(await first, { html: "article" });
  await cache.get("article", load);
  assert.equal(requests, 1);
});

test("failed downloads can be retried", async () => {
  const cache = createRequestCache();
  await assert.rejects(cache.get("index", () => { throw new Error("offline"); }), /offline/);
  assert.equal(cache.has("index"), false);
  assert.equal(await cache.get("index", () => "recovered"), "recovered");
});

test("page retention is bounded and recently visited pages stay cached", async () => {
  const cache = createRequestCache(2);
  await cache.get("a", () => "a");
  await cache.get("b", () => "b");
  await cache.get("a", () => assert.fail("must reuse a"));
  await cache.get("c", () => "c");
  assert.equal(cache.has("a"), true);
  assert.equal(cache.has("b"), false);
  assert.equal(cache.has("c"), true);
});
