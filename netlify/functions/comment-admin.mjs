import { getStore } from "../lib/store.mjs";
import {
  authorized,
  moderateCommentInThread,
  normalizeArticlePath,
  readCommentThread,
  updateCommentThread,
} from "../lib/comments.mjs";

const headers = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
};
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });

export default async function handler(request) {
  if (!authorized(request, process.env.FRESHMARK_COMMENTS_ADMIN_TOKEN)) {
    return json({ error: "not_found" }, 404);
  }
  const store = getStore({ name: "freshmark-comments", consistency: "strong" });
  if (request.method === "GET") {
    const path = normalizeArticlePath(new URL(request.url).searchParams.get("path"));
    if (!path) return json({ error: "invalid" }, 400);
    const thread = await readCommentThread(store, path);
    return json({
      comments: thread.comments.filter((comment) => comment.status === "pending"),
    });
  }
  if (request.method !== "PATCH") return json({ error: "method_not_allowed" }, 405);

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: "invalid" }, 400);
  }
  const path = normalizeArticlePath(input?.path);
  if (!path || typeof input?.id !== "string" || !["approve", "delete"].includes(input?.action)) {
    return json({ error: "invalid" }, 400);
  }
  const result = await updateCommentThread(
    store,
    path,
    (thread) => moderateCommentInThread(thread, input.id, input.action),
  );
  return result ? json({ status: input.action, comment: result }) : json({ error: "not_found" }, 404);
}

export const config = {
  path: "/api/comments/admin",
  method: ["GET", "PATCH"],
};
