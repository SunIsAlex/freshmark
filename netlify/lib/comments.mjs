import { randomBytes, randomInt, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

export const COMMENT_PAGE_SIZE = 20;
export const MAX_COMMENTS_PER_ARTICLE = 500;

export function normalizeArticlePath(value) {
  if (typeof value !== "string" || value.length > 512 || !value.startsWith("/")) return null;
  try {
    const url = new URL(value, "https://freshmark.invalid");
    if (url.origin !== "https://freshmark.invalid" || !url.pathname.endsWith("/")) return null;
    const path = url.pathname.replace(/\/{2,}/g, "/");
    return /^\/(?:[a-z]{2}\/)?posts\/.+\/$/.test(path) ? path : null;
  } catch {
    return null;
  }
}

const cleanSingleLine = (value) => String(value || "")
  .replace(/[\u0000-\u001f\u007f]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const cleanBody = (value) => String(value || "")
  .replace(/\r\n?/g, "\n")
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
  .replace(/[ \t]+\n/g, "\n")
  .replace(/\n{4,}/g, "\n\n\n")
  .trim();

export function validateCommentInput(input, { emailRequired = false } = {}) {
  const path = normalizeArticlePath(input?.path);
  const name = cleanSingleLine(input?.name);
  const email = cleanSingleLine(input?.email).toLowerCase();
  const body = cleanBody(input?.body);
  const website = cleanSingleLine(input?.website);
  const validEmail = (!email && !emailRequired) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email);
  if (
    !path
    || Array.from(name).length < 1
    || Array.from(name).length > 40
    || email.length > 254
    || !validEmail
    || Array.from(body).length < 2
    || Array.from(body).length > 2000
  ) return { ok: false, error: "invalid" };
  return { ok: true, value: { path, name, email, body, website } };
}

export function createEmailVerification({ now = new Date() } = {}) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const salt = randomBytes(16).toString("base64url");
  return {
    code,
    record: {
      salt,
      digest: scryptSync(code, salt, 32).toString("base64url"),
      expiresAt: new Date(now.getTime() + 10 * 60_000).toISOString(),
      attempts: 0,
    },
  };
}

export function createComment(input, {
  moderated = false,
  now = new Date(),
  emailVerification = null,
} = {}) {
  const comment = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    body: input.body,
    createdAt: now.toISOString(),
    status: emailVerification ? "verifying" : moderated ? "pending" : "approved",
  };
  if (emailVerification) {
    comment.afterVerificationStatus = moderated ? "pending" : "approved";
    comment.verification = emailVerification;
  }
  return comment;
}

export function publicComment(comment) {
  return {
    id: comment.id,
    name: comment.name,
    body: comment.body,
    createdAt: comment.createdAt,
  };
}

export function pageApprovedComments(thread, cursorValue, limit = COMMENT_PAGE_SIZE) {
  const approved = (Array.isArray(thread?.comments) ? thread.comments : [])
    .filter((comment) => comment?.status === "approved")
    .sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)));
  const parsedCursor = cursorValue === null || cursorValue === undefined || cursorValue === ""
    ? approved.length
    : Number(cursorValue);
  const end = Number.isSafeInteger(parsedCursor) && parsedCursor >= 0
    ? Math.min(parsedCursor, approved.length)
    : approved.length;
  const start = Math.max(0, end - limit);
  return {
    comments: approved.slice(start, end).map(publicComment),
    count: approved.length,
    nextCursor: start > 0 ? String(start) : null,
  };
}

export const commentThreadKey = (path) => `thread:${Buffer.from(path).toString("base64url")}`;

export async function readCommentThread(store, path) {
  return await store.get(commentThreadKey(path), { consistency: "strong", type: "json" })
    || { version: 1, comments: [] };
}

export async function updateCommentThread(store, path, update, { retries = 16 } = {}) {
  const key = commentThreadKey(path);
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const entry = await store.getWithMetadata(key, { consistency: "strong", type: "json" });
    const thread = entry?.data && Array.isArray(entry.data.comments)
      ? entry.data
      : { version: 1, comments: [] };
    const updated = update({ ...thread, comments: [...thread.comments] });
    const options = entry ? { onlyIfMatch: entry.etag } : { onlyIfNew: true };
    const result = await store.setJSON(key, updated.thread, options);
    if (result.modified) return updated.result;
    await new Promise((resolve) => setTimeout(resolve, Math.min(40, 2 ** attempt) + Math.random() * 8));
  }
  throw new Error(`Could not update comment thread: ${path}`);
}

export function pruneExpiredVerifications(thread, { now = new Date() } = {}) {
  const nowValue = now.getTime();
  thread.comments = thread.comments.filter((comment) => (
    comment?.status !== "verifying"
    || (Number.isFinite(new Date(comment.verification?.expiresAt).getTime())
      && new Date(comment.verification.expiresAt).getTime() > nowValue)
  ));
  return thread;
}

export function addCommentToThread(thread, comment, { now = new Date() } = {}) {
  pruneExpiredVerifications(thread, { now });
  if (thread.comments.length >= MAX_COMMENTS_PER_ARTICLE) {
    const error = new Error("Comment thread is full");
    error.code = "thread_full";
    throw error;
  }
  thread.comments.push(comment);
  return { thread, result: comment };
}

export function moderateCommentInThread(thread, id, action) {
  const index = thread.comments.findIndex((comment) => comment.id === id);
  if (index < 0) return { thread, result: null };
  if (action === "approve") thread.comments[index] = { ...thread.comments[index], status: "approved" };
  else if (action === "delete") thread.comments.splice(index, 1);
  else return { thread, result: null };
  return { thread, result: action === "delete" ? { id } : thread.comments[index] };
}

export function removeCommentFromThread(thread, id) {
  const index = thread.comments.findIndex((comment) => comment.id === id);
  if (index < 0) return { thread, result: null };
  thread.comments.splice(index, 1);
  return { thread, result: { id } };
}

export function verifyCommentInThread(thread, id, code, { now = new Date() } = {}) {
  const index = thread.comments.findIndex((comment) => comment.id === id && comment.status === "verifying");
  if (index < 0) return { thread, result: { status: "invalid" } };
  const comment = thread.comments[index];
  const verification = comment.verification;
  if (!verification || new Date(verification.expiresAt).getTime() <= now.getTime()) {
    thread.comments.splice(index, 1);
    return { thread, result: { status: "expired" } };
  }
  if (verification.attempts >= 5) {
    thread.comments.splice(index, 1);
    return { thread, result: { status: "attempts_exceeded" } };
  }
  const supplied = scryptSync(String(code), verification.salt, 32);
  const expected = Buffer.from(verification.digest, "base64url");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    comment.verification = { ...verification, attempts: verification.attempts + 1 };
    if (comment.verification.attempts >= 5) {
      thread.comments.splice(index, 1);
      return { thread, result: { status: "attempts_exceeded" } };
    }
    thread.comments[index] = comment;
    return { thread, result: { status: "invalid" } };
  }
  const verified = { ...comment, status: comment.afterVerificationStatus || "approved" };
  delete verified.afterVerificationStatus;
  delete verified.verification;
  thread.comments[index] = verified;
  return { thread, result: { status: verified.status, comment: publicComment(verified) } };
}

export function authorized(request, expectedToken) {
  if (!expectedToken) return false;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const left = Buffer.from(supplied);
  const right = Buffer.from(expectedToken);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
