import { getStore } from "../lib/store.mjs";
import { commentsAuthEnabled, commentsEnabled } from "../../lib/site-config.mjs";
import {
  consumeRegistration,
  createSession,
  publicAccount,
  sessionCookie,
} from "../lib/auth.mjs";
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
  if (Number(request.headers.get("content-length") || 0) > 2_048) return json({ error: "invalid" }, 413);
  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: "invalid" }, 400);
  }
  const id = typeof input?.id === "string" ? input.id : "";
  const code = typeof input?.code === "string" ? input.code.trim() : "";
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^\d{6}$/.test(code)) return json({ error: "invalid" }, 400);
  try {
    const store = getStore({ name: "freshmark-auth", consistency: "strong" });
    const result = await consumeRegistration(store, id, code);
    if (result.status === "expired") return json({ error: "expired" }, 410);
    if (result.status === "attempts_exceeded") return json({ error: "attempts_exceeded" }, 429);
    if (result.status === "account_exists") return json({ error: "account_exists" }, 409);
    if (result.status !== "verified") return json({ error: "invalid_code" }, 400);
    const session = await createSession(store, result.account);
    return json(
      { status: "registered", user: publicAccount(result.account) },
      201,
      { "set-cookie": sessionCookie(session) },
    );
  } catch (error) {
    console.error("Freshmark registration verification failed", error);
    return json({ error: "unavailable" }, 503);
  }
}

export const config = {
  path: "/api/auth/register/verify",
  method: "POST",
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
