import { getStore } from "@netlify/blobs";
import { commentsAuthEnabled, commentsEnabled } from "../../lib/site-config.mjs";
import {
  authenticateAccount,
  createSession,
  publicAccount,
  sessionCookie,
  validateLoginInput,
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
  const validated = validateLoginInput(input);
  if (!validated.ok) return json({ error: "invalid" }, 400);
  try {
    const store = getStore({ name: "freshmark-auth", consistency: "strong" });
    const account = await authenticateAccount(store, validated.value.email, validated.value.password);
    if (!account) return json({ error: "invalid_credentials" }, 401);
    const session = await createSession(store, account);
    return json(
      { status: "authenticated", user: publicAccount(account) },
      200,
      { "set-cookie": sessionCookie(session) },
    );
  } catch (error) {
    console.error("Freshmark login failed", error);
    return json({ error: "unavailable" }, 503);
  }
}

export const config = {
  path: "/api/auth/login",
  method: "POST",
  rateLimit: { windowLimit: 10, windowSize: 300, aggregateBy: ["ip", "domain"] },
};
