import { getStore } from "@netlify/blobs";
import { commentsAuthEnabled, commentsEnabled } from "../../lib/site-config.mjs";
import {
  accountKey,
  createRegistration,
  registrationKey,
  validateRegistrationInput,
} from "../lib/auth.mjs";
import { sameOrigin } from "../lib/comments.mjs";
import { sendRegistrationVerification } from "../lib/mailer.mjs";

const headers = { "cache-control": "no-store", "content-type": "application/json; charset=utf-8" };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });

export default async function handler(request) {
  if (!commentsEnabled() || !commentsAuthEnabled()) return json({ error: "not_found" }, 404);
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (Number(request.headers.get("content-length") || 0) > 4_096) return json({ error: "invalid" }, 413);
  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: "invalid" }, 400);
  }
  const validated = validateRegistrationInput(input);
  if (!validated.ok) return json({ error: validated.error }, 400);
  try {
    const store = getStore({ name: "freshmark-auth", consistency: "strong" });
    const existing = await store.get(accountKey(validated.value.email), { consistency: "strong", type: "json" });
    if (existing) return json({ error: "account_exists" }, 409);
    const registration = await createRegistration(validated.value);
    await store.setJSON(registrationKey(registration.id), registration.record, { onlyIfNew: true });
    try {
      await sendRegistrationVerification({
        email: validated.value.email,
        code: registration.code,
        locale: input?.locale === "en" ? "en" : "zh",
      });
    } catch (error) {
      await store.delete(registrationKey(registration.id));
      throw error;
    }
    return json({
      status: "verification_required",
      registration: {
        id: registration.id,
        expiresAt: registration.record.verification.expiresAt,
      },
    }, 202);
  } catch (error) {
    console.error("Freshmark registration failed", error);
    return json({ error: error?.code || "unavailable" }, 503);
  }
}

export const config = {
  path: "/api/auth/register",
  method: "POST",
  rateLimit: { windowLimit: 5, windowSize: 3600, aggregateBy: ["ip", "domain"] },
};
