import { getStore } from "../lib/store.mjs";
import { commentsEnabled } from "../../lib/site-config.mjs";
import { normalizeArticlePath, pageApprovedComments, readCommentThread, sameOrigin } from "../lib/comments.mjs";

const headers = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
};
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });

export default async function handler(request) {
  if (!commentsEnabled()) return json({ error: "not_found" }, 404);
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const url = new URL(request.url);
  const path = normalizeArticlePath(url.searchParams.get("path"));
  if (!path) return json({ error: "invalid" }, 400);

  try {
    const store = getStore({ name: "freshmark-comments", consistency: "strong" });
    const thread = await readCommentThread(store, path);
    return json(pageApprovedComments(thread, url.searchParams.get("cursor")));
  } catch (error) {
    console.error("Freshmark comments read failed", error);
    return json({ error: "unavailable" }, 503);
  }
}

export const config = {
  path: "/api/comments",
  method: "GET",
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
