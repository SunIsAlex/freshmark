import { getStore } from "@netlify/blobs";
import { commentsAuthEnabled, commentsEnabled } from "../../lib/site-config.mjs";
import { publicAccount, readSession } from "../lib/auth.mjs";
import { sameOrigin } from "../lib/comments.mjs";

const headers = { "cache-control": "no-store", "content-type": "application/json; charset=utf-8" };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });

export default async function handler(request) {
  if (!commentsEnabled() || !commentsAuthEnabled()) return json({ error: "not_found" }, 404);
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  try {
    const store = getStore({ name: "freshmark-auth", consistency: "strong" });
    const session = await readSession(store, request);
    return json({ user: session ? publicAccount(session.account) : null });
  } catch (error) {
    console.error("Freshmark session read failed", error);
    return json({ error: "unavailable" }, 503);
  }
}

export const config = {
  path: "/api/auth/session",
  method: "GET",
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
