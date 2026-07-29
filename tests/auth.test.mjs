import assert from "node:assert/strict";
import test from "node:test";
import {
  accountKey,
  authenticateAccount,
  clearSessionCookie,
  consumeRegistration,
  createRegistration,
  createSession,
  normalizeEmail,
  publicAccount,
  readSession,
  registrationKey,
  sessionCookie,
  sessionKey,
  validateLoginInput,
  validateRegistrationInput,
  verifyRegistrationRecord,
} from "../netlify/lib/auth.mjs";
import { config as registerConfig } from "../netlify/functions/auth-register.mjs";
import { config as verifyConfig } from "../netlify/functions/auth-register-verify.mjs";
import { config as loginConfig } from "../netlify/functions/auth-login.mjs";
import { config as sessionConfig } from "../netlify/functions/auth-session.mjs";
import { config as logoutConfig } from "../netlify/functions/auth-logout.mjs";

function memoryStore() {
  const records = new Map();
  let version = 0;
  return {
    records,
    async get(key) {
      return records.get(key)?.data || null;
    },
    async getWithMetadata(key) {
      const entry = records.get(key);
      return entry ? { data: entry.data, etag: entry.etag } : null;
    },
    async setJSON(key, data, options = {}) {
      const current = records.get(key);
      if (options.onlyIfNew && current) return { modified: false };
      if (options.onlyIfMatch && current?.etag !== options.onlyIfMatch) return { modified: false };
      const etag = `"v${++version}"`;
      records.set(key, { data, etag });
      return { modified: true, etag };
    },
    async delete(key) {
      records.delete(key);
    },
  };
}

test("account input is normalized and passwords have bounded requirements", () => {
  assert.equal(normalizeEmail(" ALEX@Example.com "), "alex@example.com");
  assert.deepEqual(validateRegistrationInput({
    name: "  Alex ",
    email: " ALEX@Example.com ",
    password: "correct horse",
  }), {
    ok: true,
    value: { name: "Alex", email: "alex@example.com", password: "correct horse" },
  });
  assert.equal(validateRegistrationInput({ name: "Alex", email: "bad", password: "12345678" }).ok, false);
  assert.equal(validateRegistrationInput({ name: "Alex", email: "a@example.com", password: "short" }).ok, false);
  assert.equal(validateLoginInput({ email: "a@example.com", password: "" }).ok, false);
  assert.match(accountKey("alex@example.com"), /^account:[A-Za-z0-9_-]{43}$/);
  assert.equal(accountKey(" ALEX@Example.com "), accountKey("alex@example.com"));
});

test("registration codes expire, limit attempts, and never store plaintext passwords", async () => {
  const now = new Date("2026-07-29T10:00:00Z");
  const registration = await createRegistration({
    name: "Alex",
    email: "alex@example.com",
    password: "correct horse",
  }, { now });
  assert.match(registration.id, /^[0-9a-f-]{36}$/);
  assert.match(registration.code, /^\d{6}$/);
  assert.equal(JSON.stringify(registration.record).includes("correct horse"), false);
  assert.equal(JSON.stringify(registration.record).includes(registration.code), false);

  const badCode = registration.code === "000000" ? "000001" : "000000";
  const invalid = await verifyRegistrationRecord(registration.record, badCode, { now });
  assert.equal(invalid.status, "invalid");
  assert.equal(invalid.record.verification.attempts, 1);
  const verified = await verifyRegistrationRecord(registration.record, registration.code, { now });
  assert.equal(verified.status, "verified");
  assert.deepEqual(publicAccount(verified.account), { name: "Alex", email: "alex@example.com" });
  const expired = await verifyRegistrationRecord(registration.record, registration.code, {
    now: new Date(now.getTime() + 10 * 60_000),
  });
  assert.equal(expired.status, "expired");
});

test("verified registration creates one account that can authenticate", async () => {
  const store = memoryStore();
  const registration = await createRegistration({
    name: "Alex",
    email: "alex@example.com",
    password: "correct horse",
  });
  await store.setJSON(registrationKey(registration.id), registration.record);
  const result = await consumeRegistration(store, registration.id, registration.code);
  assert.equal(result.status, "verified");
  assert.equal(store.records.has(registrationKey(registration.id)), false);
  assert.equal((await authenticateAccount(store, "ALEX@example.com", "wrong password")), null);
  const account = await authenticateAccount(store, "alex@example.com", "correct horse");
  assert.equal(account.name, "Alex");
});

test("sessions use opaque cookies and expire server-side", async () => {
  const store = memoryStore();
  const now = new Date("2026-07-29T10:00:00Z");
  const account = {
    version: 1,
    name: "Alex",
    email: "alex@example.com",
    password: {},
    createdAt: now.toISOString(),
    verifiedAt: now.toISOString(),
  };
  await store.setJSON(accountKey(account.email), account);
  const session = await createSession(store, account, { now });
  const cookie = sessionCookie(session);
  assert.match(cookie, /^freshmark_session=[A-Za-z0-9_-]{43};/);
  assert.match(cookie, /HttpOnly; Secure; SameSite=Lax/);
  assert.equal(cookie.includes(account.email), false);
  assert.equal(store.records.has(sessionKey(session.token)), true);

  const request = new Request("https://example.com/api/auth/session", {
    headers: { cookie: cookie.split(";")[0] },
  });
  const active = await readSession(store, request, { now });
  assert.equal(active.account.email, account.email);
  const expired = await readSession(store, request, {
    now: new Date(session.expiresAt.getTime() + 1),
  });
  assert.equal(expired, null);
  assert.match(clearSessionCookie(), /Max-Age=0; HttpOnly; Secure; SameSite=Lax/);
});

test("auth functions expose separately rate-limited routes", () => {
  assert.equal(registerConfig.path, "/api/auth/register");
  assert.equal(registerConfig.rateLimit.windowLimit, 5);
  assert.equal(verifyConfig.path, "/api/auth/register/verify");
  assert.equal(loginConfig.path, "/api/auth/login");
  assert.equal(loginConfig.rateLimit.windowLimit, 10);
  assert.equal(sessionConfig.path, "/api/auth/session");
  assert.equal(logoutConfig.path, "/api/auth/logout");
});
