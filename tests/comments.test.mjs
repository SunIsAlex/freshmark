import assert from "node:assert/strict";
import test from "node:test";
import {
  addCommentToThread,
  createComment,
  moderateCommentInThread,
  normalizeArticlePath,
  pageApprovedComments,
  publicComment,
  updateCommentThread,
  validateCommentInput,
} from "../netlify/lib/comments.mjs";
import commentHandler, { config as submitConfig } from "../netlify/functions/comment.mjs";
import commentsHandler, { config as listConfig } from "../netlify/functions/comments.mjs";
import adminHandler from "../netlify/functions/comment-admin.mjs";

test("comment paths are restricted to article routes", () => {
  assert.equal(normalizeArticlePath("/posts/example/"), "/posts/example/");
  assert.equal(normalizeArticlePath("/en/posts/example/"), "/en/posts/example/");
  assert.equal(normalizeArticlePath("/posts/a///b/"), "/posts/a/b/");
  assert.equal(normalizeArticlePath("/about/"), null);
  assert.equal(normalizeArticlePath("/posts/example"), null);
  assert.equal(normalizeArticlePath("https://example.com/posts/example/"), null);
});

test("comment input is normalized and validated", () => {
  const result = validateCommentInput({
    path: "/posts/example/",
    name: "  Alex\u0000  Smith ",
    email: " ALEX@Example.com ",
    body: "Hello  \r\n\r\n\r\n\r\nworld",
    website: "",
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    path: "/posts/example/",
    name: "Alex Smith",
    email: "alex@example.com",
    body: "Hello\n\n\nworld",
    website: "",
  });
  assert.equal(validateCommentInput({ path: "/posts/example/", name: "", body: "Hello" }).ok, false);
  assert.equal(validateCommentInput({ path: "/posts/example/", name: "Alex", email: "bad", body: "Hello" }).ok, false);
  assert.equal(validateCommentInput({ path: "/posts/example/", name: "Alex", body: "x".repeat(2001) }).ok, false);
});

test("public comments never expose email or moderation state", () => {
  const comment = createComment({
    name: "Alex",
    email: "alex@example.com",
    body: "Hello",
  }, { moderated: true, now: new Date("2026-07-29T10:00:00Z") });
  const visible = publicComment(comment);
  assert.equal(comment.status, "pending");
  assert.equal(comment.email, "alex@example.com");
  assert.deepEqual(Object.keys(visible).sort(), ["body", "createdAt", "id", "name"]);
});

test("comment pagination returns only approved comments from newest pages", () => {
  const comments = Array.from({ length: 25 }, (_, index) => ({
    id: String(index),
    name: `N${index}`,
    email: "",
    body: `B${index}`,
    createdAt: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(),
    status: index === 3 ? "pending" : "approved",
  }));
  const latest = pageApprovedComments({ comments }, null);
  assert.equal(latest.count, 24);
  assert.equal(latest.comments.length, 20);
  assert.equal(latest.comments.at(-1).id, "24");
  assert.equal(latest.nextCursor, "4");
  const older = pageApprovedComments({ comments }, latest.nextCursor);
  assert.deepEqual(older.comments.map(({ id }) => id), ["0", "1", "2", "4"]);
  assert.equal(older.nextCursor, null);
});

test("comment thread writes retry conflicts without losing concurrent comments", async () => {
  let data = { version: 1, comments: [{ id: "first" }] };
  let etag = '"v1"';
  let writes = 0;
  const store = {
    async getWithMetadata() {
      return { data, etag };
    },
    async setJSON(key, value, options) {
      assert.match(key, /^thread:/);
      assert.equal(options.onlyIfMatch, etag);
      writes += 1;
      if (writes === 1) {
        data = { version: 1, comments: [...data.comments, { id: "concurrent" }] };
        etag = '"v2"';
        return { modified: false };
      }
      data = value;
      return { modified: true, etag: '"v3"' };
    },
  };
  const added = { id: "mine" };
  await updateCommentThread(store, "/posts/example/", (thread) => addCommentToThread(thread, added));
  assert.deepEqual(data.comments.map(({ id }) => id), ["first", "concurrent", "mine"]);
  assert.equal(writes, 2);
});

test("moderation can approve or permanently delete a comment", () => {
  const thread = { version: 1, comments: [{ id: "a", status: "pending" }, { id: "b", status: "pending" }] };
  const approved = moderateCommentInThread(thread, "a", "approve");
  assert.equal(approved.result.status, "approved");
  const deleted = moderateCommentInThread(approved.thread, "b", "delete");
  assert.deepEqual(deleted.thread.comments.map(({ id }) => id), ["a"]);
});

test("comment functions reject invalid requests before accessing storage", async () => {
  const previous = process.env.FRESHMARK_COMMENTS;
  process.env.FRESHMARK_COMMENTS = "true";
  try {
    const invalidSubmission = await commentHandler(new Request("https://example.com/api/comments/submit", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://example.com" },
      body: JSON.stringify({ path: "/about/", name: "Alex", body: "Hello" }),
    }));
    assert.equal(invalidSubmission.status, 400);
    const crossOrigin = await commentHandler(new Request("https://example.com/api/comments/submit", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://evil.example" },
      body: JSON.stringify({ path: "/posts/example/", name: "Alex", body: "Hello" }),
    }));
    assert.equal(crossOrigin.status, 403);
    const invalidList = await commentsHandler(new Request("https://example.com/api/comments?path=/about/"));
    assert.equal(invalidList.status, 400);
    const hiddenAdmin = await adminHandler(new Request("https://example.com/api/comments/admin?path=/posts/example/"));
    assert.equal(hiddenAdmin.status, 404);
  } finally {
    if (previous === undefined) delete process.env.FRESHMARK_COMMENTS;
    else process.env.FRESHMARK_COMMENTS = previous;
  }
});

test("public comment endpoints declare separate platform rate limits", () => {
  assert.equal(listConfig.path, "/api/comments");
  assert.equal(listConfig.method, "GET");
  assert.equal(listConfig.rateLimit.windowLimit, 60);
  assert.equal(submitConfig.path, "/api/comments/submit");
  assert.equal(submitConfig.method, "POST");
  assert.equal(submitConfig.rateLimit.windowLimit, 5);
  assert.deepEqual(submitConfig.rateLimit.aggregateBy, ["ip", "domain"]);
});
