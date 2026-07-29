import {
  randomBytes,
  randomInt,
  randomUUID,
  scrypt,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);
const SESSION_COOKIE = "freshmark_session";
const SESSION_LIFETIME = 30 * 24 * 60 * 60_000;
const REGISTRATION_LIFETIME = 10 * 60_000;
const DUMMY_SALT = "freshmark-invalid-account";

const cleanLine = (value) => String(value || "")
  .replace(/[\u0000-\u001f\u007f]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

export const normalizeEmail = (value) => cleanLine(value).toLowerCase();
const digestKey = (value) => createHash("sha256").update(value).digest("base64url");
export const accountKey = (email) => `account:${digestKey(normalizeEmail(email))}`;
export const registrationKey = (id) => `registration:${id}`;
export const sessionKey = (token) => `session:${digestKey(token)}`;

async function deriveSecret(secret, salt) {
  return Buffer.from(await derive(secret, salt, 32));
}

export function validateRegistrationInput(input) {
  const name = cleanLine(input?.name);
  const email = normalizeEmail(input?.email);
  const password = String(input?.password || "");
  if (
    Array.from(name).length < 1
    || Array.from(name).length > 40
    || email.length > 254
    || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u.test(email)
    || password.length < 8
    || password.length > 128
  ) return { ok: false, error: "invalid" };
  return { ok: true, value: { name, email, password } };
}

export function validateLoginInput(input) {
  const email = normalizeEmail(input?.email);
  const password = String(input?.password || "");
  if (
    email.length > 254
    || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u.test(email)
    || password.length < 1
    || password.length > 128
  ) return { ok: false, error: "invalid" };
  return { ok: true, value: { email, password } };
}

export async function createRegistration(input, { now = new Date() } = {}) {
  const id = randomUUID();
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const passwordSalt = randomBytes(16).toString("base64url");
  const codeSalt = randomBytes(16).toString("base64url");
  const [passwordDigest, codeDigest] = await Promise.all([
    deriveSecret(input.password, passwordSalt),
    deriveSecret(code, codeSalt),
  ]);
  return {
    id,
    code,
    record: {
      version: 1,
      name: input.name,
      email: input.email,
      password: { salt: passwordSalt, digest: passwordDigest.toString("base64url") },
      verification: {
        salt: codeSalt,
        digest: codeDigest.toString("base64url"),
        attempts: 0,
        expiresAt: new Date(now.getTime() + REGISTRATION_LIFETIME).toISOString(),
      },
      createdAt: now.toISOString(),
    },
  };
}

async function matchesSecret(secret, record) {
  if (!record?.salt || !record?.digest) return false;
  const supplied = await deriveSecret(secret, record.salt);
  const expected = Buffer.from(record.digest, "base64url");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function verifyRegistrationRecord(record, code, { now = new Date() } = {}) {
  const verification = record?.verification;
  if (!verification || new Date(verification.expiresAt).getTime() <= now.getTime()) {
    return { status: "expired" };
  }
  if (verification.attempts >= 5) return { status: "attempts_exceeded" };
  if (!await matchesSecret(String(code), verification)) {
    const attempts = verification.attempts + 1;
    return {
      status: attempts >= 5 ? "attempts_exceeded" : "invalid",
      record: { ...record, verification: { ...verification, attempts } },
    };
  }
  return {
    status: "verified",
    account: {
      version: 1,
      name: record.name,
      email: record.email,
      password: record.password,
      createdAt: record.createdAt,
      verifiedAt: now.toISOString(),
    },
  };
}

export async function readAccount(store, email) {
  return await store.get(accountKey(email), { consistency: "strong", type: "json" });
}

export async function authenticateAccount(store, email, password) {
  const account = await readAccount(store, email);
  if (!account) {
    await deriveSecret(password, DUMMY_SALT);
    return null;
  }
  return await matchesSecret(password, account.password) ? account : null;
}

export async function consumeRegistration(store, id, code, { now = new Date(), retries = 8 } = {}) {
  const key = registrationKey(id);
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const entry = await store.getWithMetadata(key, { consistency: "strong", type: "json" });
    if (!entry?.data) return { status: "invalid" };
    const checked = await verifyRegistrationRecord(entry.data, code, { now });
    if (checked.status === "expired" || checked.status === "attempts_exceeded") {
      await store.delete(key);
      return checked;
    }
    if (checked.status === "invalid") {
      const saved = await store.setJSON(key, checked.record, { onlyIfMatch: entry.etag });
      if (saved.modified) return checked;
      continue;
    }
    const created = await store.setJSON(accountKey(checked.account.email), checked.account, { onlyIfNew: true });
    await store.delete(key);
    return created.modified ? { status: "verified", account: checked.account } : { status: "account_exists" };
  }
  throw new Error("Could not update registration");
}

export function publicAccount(account) {
  return { name: account.name, email: account.email };
}

export async function createSession(store, account, { now = new Date() } = {}) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + SESSION_LIFETIME);
  await store.setJSON(sessionKey(token), {
    version: 1,
    account: accountKey(account.email),
    expiresAt: expiresAt.toISOString(),
  });
  return { token, expiresAt };
}

function cookieValue(request) {
  const cookies = request.headers.get("cookie") || "";
  for (const part of cookies.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === SESSION_COOKIE) return value.join("=");
  }
  return "";
}

export async function readSession(store, request, { now = new Date() } = {}) {
  const token = cookieValue(request);
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const key = sessionKey(token);
  const session = await store.get(key, { consistency: "strong", type: "json" });
  if (!session || new Date(session.expiresAt).getTime() <= now.getTime()) {
    if (session) await store.delete(key);
    return null;
  }
  const account = await store.get(session.account, { consistency: "strong", type: "json" });
  return account ? { account, token } : null;
}

export async function deleteSession(store, request) {
  const token = cookieValue(request);
  if (/^[A-Za-z0-9_-]{43}$/.test(token)) await store.delete(sessionKey(token));
}

export const sessionCookie = ({ token, expiresAt }) => (
  `${SESSION_COOKIE}=${token}; Path=/; Expires=${expiresAt.toUTCString()}; HttpOnly; Secure; SameSite=Lax`
);
export const clearSessionCookie = () => (
  `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
);
