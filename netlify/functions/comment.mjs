import { getStore } from "@netlify/blobs";
import {
  commentsEmailVerificationEnabled,
  commentsEnabled,
  commentsModerated,
} from "../../lib/site-config.mjs";
import {
  addCommentToThread,
  createComment,
  createEmailVerification,
  removeCommentFromThread,
  sameOrigin,
  updateCommentThread,
  validateCommentInput,
} from "../lib/comments.mjs";
import { sendCommentVerification } from "../lib/mailer.mjs";

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
  const emailVerificationEnabled = commentsEmailVerificationEnabled();
  if (Boolean(input?.v) !== emailVerificationEnabled) {
    return json({ error: "configuration_mismatch" }, 503);
  }
  const validated = validateCommentInput(input, { emailRequired: emailVerificationEnabled });
  if (!validated.ok) return json({ error: validated.error }, 400);
  if (validated.value.website) return json({ status: "pending" }, 202);

  const moderated = commentsModerated();
  const verification = emailVerificationEnabled ? createEmailVerification() : null;
  const comment = createComment(validated.value, {
    moderated,
    emailVerification: verification?.record,
  });
  try {
    const store = getStore({ name: "freshmark-comments", consistency: "strong" });
    await updateCommentThread(store, validated.value.path, (thread) => addCommentToThread(thread, comment));
    if (verification) {
      try {
        await sendCommentVerification({
          email: validated.value.email,
          code: verification.code,
          locale: validated.value.path.startsWith("/en/") ? "en" : "zh",
        });
      } catch (error) {
        try {
          await updateCommentThread(
            store,
            validated.value.path,
            (thread) => removeCommentFromThread(thread, comment.id),
          );
        } catch (cleanupError) {
          console.error("Freshmark unverified comment cleanup failed", cleanupError);
        }
        throw error;
      }
      return json({
        status: "verification_required",
        verification: {
          id: comment.id,
          expiresAt: verification.record.expiresAt,
        },
      }, 202);
    }
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
