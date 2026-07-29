import { createServer } from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";

const host = "127.0.0.1";
const port = 8788;
const token = process.env.MAILER_TOKEN || "";
const sender = "Freshmark <noreply@sunisalex.org>";
const envelopeSender = "bounce@mailer.sunisalex.org";
const attempts = new Map();

function json(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

function authorized(request) {
  const supplied = request.headers.authorization?.replace(/^Bearer\s+/i, "") || "";
  const left = Buffer.from(supplied);
  const right = Buffer.from(token);
  return token && left.length === right.length && timingSafeEqual(left, right);
}

function allowedRecipient(email) {
  const now = Date.now();
  const recent = (attempts.get(email) || []).filter((value) => now - value < 3_600_000);
  if (recent.length >= 5) return false;
  recent.push(now);
  attempts.set(email, recent);
  if (attempts.size > 1000) {
    for (const [key, values] of attempts) {
      if (!values.some((value) => now - value < 3_600_000)) attempts.delete(key);
    }
  }
  return true;
}

function encodedSubject(value) {
  return `=?UTF-8?B?${Buffer.from(value).toString("base64")}?=`;
}

function sendCode({ to, code, locale, purpose }) {
  const english = locale === "en";
  const registration = purpose === "registration";
  const subject = registration
    ? english ? "Verify your Freshmark account" : "验证你的 Freshmark 账号"
    : english ? "Your Freshmark comment verification code" : "Freshmark 评论验证码";
  const body = registration
    ? english
      ? [
        "You are creating an account on freshmark.sunisalex.org.",
        "",
        `Verification code: ${code}`,
        "",
        "It expires in 10 minutes. If this was not you, ignore this email.",
        "",
        "— Freshmark · freshmark.sunisalex.org",
      ].join("\n")
      : [
        "你正在注册 freshmark.sunisalex.org 的评论账号。",
        "",
        `验证码：${code}`,
        "",
        "验证码将在 10 分钟后失效。如非本人操作，请忽略此邮件。",
        "",
        "— Freshmark · freshmark.sunisalex.org",
      ].join("\n")
    : english
    ? [
      "You are verifying your email for a comment on freshmark.sunisalex.org.",
      "",
      `Verification code: ${code}`,
      "",
      "It expires in 10 minutes and can only be used for the comment you just submitted.",
      "If this was not you, ignore this email.",
      "",
      "— Freshmark · freshmark.sunisalex.org",
    ].join("\n")
    : [
      "你正在验证提交到 freshmark.sunisalex.org 评论区的邮箱。",
      "",
      `验证码：${code}`,
      "",
      "验证码将在 10 分钟后失效，仅可用于刚才提交的评论。",
      "如非本人操作，请忽略此邮件。",
      "",
      "— Freshmark · freshmark.sunisalex.org",
    ].join("\n");
  const message = [
    `From: ${sender}`,
    `To: <${to}>`,
    "Reply-To: me@sunisalex.org",
    `Subject: ${encodedSubject(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${randomUUID()}@sunisalex.org>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "Auto-Submitted: auto-generated",
    "X-Auto-Response-Suppress: All",
    "",
    body,
    "",
  ].join("\r\n");
  return new Promise((resolve, reject) => {
    const child = spawn("/usr/sbin/sendmail", ["-i", "-f", envelopeSender, "--", to], {
      stdio: ["pipe", "ignore", "pipe"],
    });
    let error = "";
    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("sendmail timed out"));
    }, 10_000);
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => { error = `${error}${chunk}`.slice(-2000); });
    child.on("error", (spawnError) => {
      clearTimeout(timeout);
      reject(spawnError);
    });
    child.on("close", (status) => {
      clearTimeout(timeout);
      if (status === 0) resolve();
      else reject(new Error(error || `sendmail exited ${status}`));
    });
    child.stdin.end(message);
  });
}

if (!token) throw new Error("MAILER_TOKEN is required");

const server = createServer((request, response) => {
  if (request.method !== "POST" || request.url !== "/api/mail/comment-code") {
    return json(response, 404, { error: "not_found" });
  }
  if (!authorized(request)) return json(response, 404, { error: "not_found" });
  if (Number(request.headers["content-length"] || 0) > 4096) {
    return json(response, 413, { error: "invalid" });
  }
  let raw = "";
  let tooLarge = false;
  request.setEncoding("utf8");
  request.on("data", (chunk) => {
    raw += chunk;
    if (raw.length > 4096) tooLarge = true;
  });
  request.on("end", async () => {
    if (tooLarge) return json(response, 413, { error: "invalid" });
    try {
      const input = JSON.parse(raw);
      const to = String(input?.to || "").trim().toLowerCase();
      const code = String(input?.code || "").trim();
      const purpose = input?.purpose === "registration" ? "registration" : "comment";
      const validEmail = to.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u.test(to);
      if (!validEmail || !/^\d{6}$/.test(code)) return json(response, 400, { error: "invalid" });
      if (!allowedRecipient(to)) return json(response, 429, { error: "rate_limited" });
      await sendCode({ to, code, locale: input?.locale, purpose });
      return json(response, 202, { status: "queued" });
    } catch (error) {
      console.error("Mailer request failed", error?.message || error);
      if (!response.headersSent) json(response, 503, { error: "unavailable" });
    }
  });
});
server.requestTimeout = 12_000;
server.headersTimeout = 5_000;
server.listen(port, host, () => console.log(`Freshmark mailer listening on ${host}:${port}`));
