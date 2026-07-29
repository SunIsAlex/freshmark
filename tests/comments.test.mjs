import assert from "node:assert/strict";
import test from "node:test";
import {
  addCommentToThread,
  createComment,
  createEmailVerification,
  moderateCommentInThread,
  normalizeArticlePath,
  pageApprovedComments,
  pruneExpiredVerifications,
  publicComment,
  removeCommentFromThread,
  updateCommentThread,
  validateCommentInput,
  verifyCommentInThread,
} from "../netlify/lib/comments.mjs";
import commentHandler, { config as submitConfig } from "../netlify/functions/comment.mjs";
import { config as verifyConfig } from "../netlify/functions/comment-verify.mjs";
import commentsHandler, { config as listConfig } from "../netlify/functions/comments.mjs";
import adminHandler from "../netlify/functions/comment-admin.mjs";
import { sendCommentVerification } from "../netlify/lib/mailer.mjs";

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
  assert.equal(
    validateCommentInput(
      { path: "/posts/example/", name: "Alex", body: "Hello" },
      { emailRequired: true },
    ).ok,
    false,
  );
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

test("email verification codes expire, limit attempts, and publish without exposing email", () => {
  const now = new Date("2026-07-29T10:00:00Z");
  const verification = createEmailVerification({ now });
  assert.match(verification.code, /^\d{6}$/);
  const comment = createComment({
    name: "Alex",
    email: "alex@example.com",
    body: "Hello",
  }, { emailVerification: verification.record, now });
  assert.equal(comment.status, "verifying");

  let thread = { version: 1, comments: [comment] };
  const invalid = verifyCommentInThread(thread, comment.id, "000000" === verification.code ? "000001" : "000000", { now });
  assert.equal(invalid.result.status, "invalid");
  assert.equal(invalid.thread.comments[0].verification.attempts, 1);
  thread = invalid.thread;

  const verified = verifyCommentInThread(thread, comment.id, verification.code, { now });
  assert.equal(verified.result.status, "approved");
  assert.equal(verified.result.comment.name, "Alex");
  assert.equal("email" in verified.result.comment, false);
  assert.equal("verification" in verified.thread.comments[0], false);

  const expiredComment = createComment({
    name: "Alex",
    email: "alex@example.com",
    body: "Hello",
  }, { emailVerification: verification.record, now });
  const expired = verifyCommentInThread(
    { version: 1, comments: [expiredComment] },
    expiredComment.id,
    verification.code,
    { now: new Date(now.getTime() + 10 * 60_000) },
  );
  assert.equal(expired.result.status, "expired");
  assert.equal(expired.thread.comments.length, 0);
});

test("unverified comments can be removed after mail delivery failures", () => {
  const thread = { version: 1, comments: [{ id: "keep" }, { id: "remove" }] };
  const removed = removeCommentFromThread(thread, "remove");
  assert.deepEqual(removed.thread.comments.map(({ id }) => id), ["keep"]);
});

test("expired unverified comments are pruned before thread capacity is checked", () => {
  const now = new Date("2026-07-29T10:20:00Z");
  const thread = {
    version: 1,
    comments: [
      { id: "approved", status: "approved" },
      {
        id: "expired",
        status: "verifying",
        verification: { expiresAt: "2026-07-29T10:10:00Z" },
      },
      {
        id: "active",
        status: "verifying",
        verification: { expiresAt: "2026-07-29T10:30:00Z" },
      },
    ],
  };
  pruneExpiredVerifications(thread, { now });
  assert.deepEqual(thread.comments.map(({ id }) => id), ["approved", "active"]);
  const added = addCommentToThread(thread, { id: "new" }, { now });
  assert.deepEqual(added.thread.comments.map(({ id }) => id), ["approved", "active", "new"]);
});

test("mailer requires HTTPS and keeps its token in the authorization header", async () => {
  await assert.rejects(
    sendCommentVerification(
      { email: "alex@example.com", code: "123456", locale: "en" },
      { FRESHMARK_MAILER_ENDPOINT: "http://mailer.example/send", FRESHMARK_MAILER_TOKEN: "secret" },
    ),
    { code: "mailer_not_configured" },
  );
  const previousFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url.href, "https://mailer.example/send");
      assert.equal(options.headers.authorization, "Bearer secret");
      assert.equal(options.redirect, "error");
      assert.deepEqual(JSON.parse(options.body), {
        to: "alex@example.com",
        code: "123456",
        locale: "en",
      });
      return new Response(null, { status: 202 });
    };
    await sendCommentVerification(
      { email: "alex@example.com", code: "123456", locale: "en" },
      { FRESHMARK_MAILER_ENDPOINT: "https://mailer.example/send", FRESHMARK_MAILER_TOKEN: "secret" },
    );
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("comment functions reject invalid requests before accessing storage", async () => {
  const previous = process.env.FRESHMARK_COMMENTS;
  const previousVerification = process.env.FRESHMARK_COMMENTS_EMAIL_VERIFICATION;
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
    process.env.FRESHMARK_COMMENTS_EMAIL_VERIFICATION = "true";
    const mismatchedBuild = await commentHandler(new Request("https://example.com/api/comments/submit", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://example.com" },
      body: JSON.stringify({
        path: "/posts/example/",
        name: "Alex",
        email: "alex@example.com",
        body: "Hello",
        v: false,
      }),
    }));
    assert.equal(mismatchedBuild.status, 503);
  } finally {
    if (previous === undefined) delete process.env.FRESHMARK_COMMENTS;
    else process.env.FRESHMARK_COMMENTS = previous;
    if (previousVerification === undefined) delete process.env.FRESHMARK_COMMENTS_EMAIL_VERIFICATION;
    else process.env.FRESHMARK_COMMENTS_EMAIL_VERIFICATION = previousVerification;
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
  assert.equal(verifyConfig.path, "/api/comments/verify");
  assert.equal(verifyConfig.method, "POST");
  assert.equal(verifyConfig.rateLimit.windowLimit, 10);
});
