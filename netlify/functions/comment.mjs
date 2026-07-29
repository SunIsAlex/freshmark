import { getStore } from "@netlify/blobs";
import { commentsEnabled, commentsModerated } from "../../lib/site-config.mjs";
import {
  addCommentToThread,
  createComment,
  sameOrigin,
  updateCommentThread,
  validateCommentInput,
} from "../lib/comments.mjs";

const headers = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
};
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });

export default async function handler(request) {
  if (!commentsEnabled()) return json({ error: "not_found" }, 404);
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (Number(request.headers.get("content-length") || 0) > 8_192) return json({ error: "invalid" }, 413);

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: "invalid" }, 400);
  }
  const validated = validateCommentInput(input);
  if (!validated.ok) return json({ error: validated.error }, 400);
  if (validated.value.website) return json({ status: "pending" }, 202);

  const moderated = commentsModerated();
  const comment = createComment(validated.value, { moderated });
  try {
    const store = getStore({ name: "freshmark-comments", consistency: "strong" });
    await updateCommentThread(store, validated.value.path, (thread) => addCommentToThread(thread, comment));
    return json({
      status: moderated ? "pending" : "published",
      comment: moderated ? undefined : {
        id: comment.id,
        name: comment.name,
        body: comment.body,
        createdAt: comment.createdAt,
      },
    }, moderated ? 202 : 201);
  } catch (error) {
    console.error("Freshmark comment submission failed", error);
    return json({ error: error?.code || "unavailable" }, error?.code === "thread_full" ? 409 : 503);
  }
}

export const config = {
  path: "/api/comments/submit",
  method: "POST",
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
