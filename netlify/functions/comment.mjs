import { getStore } from "@netlify/blobs";
import {
  commentsAuthEnabled,
  commentsEnabled,
  commentsModerated,
} from "../../lib/site-config.mjs";
import { readSession } from "../lib/auth.mjs";
import {
  addCommentToThread,
  commentInputForAuthor,
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
  const authEnabled = commentsAuthEnabled();
  if (Boolean(input?.a) !== authEnabled) {
    return json({ error: "configuration_mismatch" }, 503);
  }
  try {
    let author = { name: input?.name, email: input?.email };
    if (authEnabled) {
      const authStore = getStore({ name: "freshmark-auth", consistency: "strong" });
      const session = await readSession(authStore, request);
      if (!session) return json({ error: "authentication_required" }, 401);
      author = session.account;
    }
    const validated = validateCommentInput(commentInputForAuthor(input, author), { emailRequired: authEnabled });
    if (!validated.ok) return json({ error: validated.error }, 400);
    if (validated.value.website) return json({ status: "pending" }, 202);

    const store = getStore({ name: "freshmark-comments", consistency: "strong" });
    const moderated = commentsModerated();
    const comment = createComment(validated.value, { moderated });
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
    const status = error?.code === "thread_full" ? 409 : error?.code === "rate_limited" ? 429 : 503;
    return json({ error: error?.code || "unavailable" }, status);
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
