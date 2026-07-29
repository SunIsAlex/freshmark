import { getStore } from "@netlify/blobs";
import { commentsEmailVerificationEnabled, commentsEnabled } from "../../lib/site-config.mjs";
import {
  normalizeArticlePath,
  sameOrigin,
  updateCommentThread,
  verifyCommentInThread,
} from "../lib/comments.mjs";

const headers = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
};
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });

export default async function handler(request) {
  if (!commentsEnabled() || !commentsEmailVerificationEnabled()) return json({ error: "not_found" }, 404);
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (Number(request.headers.get("content-length") || 0) > 2_048) return json({ error: "invalid" }, 413);

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: "invalid" }, 400);
  }
  const path = normalizeArticlePath(input?.path);
  const id = typeof input?.id === "string" ? input.id : "";
  const code = typeof input?.code === "string" ? input.code.trim() : "";
  if (!path || !/^[0-9a-f-]{36}$/i.test(id) || !/^\d{6}$/.test(code)) {
    return json({ error: "invalid" }, 400);
  }

  try {
    const store = getStore({ name: "freshmark-comments", consistency: "strong" });
    const result = await updateCommentThread(
      store,
      path,
      (thread) => verifyCommentInThread(thread, id, code),
    );
    if (result.status === "expired") return json({ error: "expired" }, 410);
    if (result.status === "attempts_exceeded") return json({ error: "attempts_exceeded" }, 429);
    if (result.status === "invalid") return json({ error: "invalid_code" }, 400);
    return json({
      status: result.status === "approved" ? "published" : "pending",
      comment: result.status === "approved" ? result.comment : undefined,
    });
  } catch (error) {
    console.error("Freshmark comment verification failed", error);
    return json({ error: "unavailable" }, 503);
  }
}

export const config = {
  path: "/api/comments/verify",
  method: "POST",
  rateLimit: {
    windowLimit: 10,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
