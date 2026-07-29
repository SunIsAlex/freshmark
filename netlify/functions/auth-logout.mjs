import { getStore } from "../lib/store.mjs";
import { commentsAuthEnabled, commentsEnabled } from "../../lib/site-config.mjs";
import { clearSessionCookie, deleteSession } from "../lib/auth.mjs";
import { sameOrigin } from "../lib/comments.mjs";

const headers = { "cache-control": "no-store", "content-type": "application/json; charset=utf-8" };
const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { ...headers, ...extra },
});

export default async function handler(request) {
  if (!commentsEnabled() || !commentsAuthEnabled()) return json({ error: "not_found" }, 404);
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  try {
    const store = getStore({ name: "freshmark-auth", consistency: "strong" });
    await deleteSession(store, request);
    return json({ status: "signed_out" }, 200, { "set-cookie": clearSessionCookie() });
  } catch (error) {
    console.error("Freshmark logout failed", error);
    return json({ error: "unavailable" }, 503);
  }
}

export const config = {
  path: "/api/auth/logout",
  method: "POST",
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
