const MAILER_TIMEOUT_MS = 8_000;

export async function sendRegistrationVerification({ email, code, locale }, environment = process.env) {
  const endpoint = environment.FRESHMARK_MAILER_ENDPOINT?.trim();
  const token = environment.FRESHMARK_MAILER_TOKEN?.trim();
  if (!endpoint || !token) {
    const error = new Error("Comment mailer is not configured");
    error.code = "mailer_not_configured";
    throw error;
  }
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    const error = new Error("Comment mailer endpoint is invalid");
    error.code = "mailer_not_configured";
    throw error;
  }
  if (url.protocol !== "https:") {
    const error = new Error("Comment mailer endpoint must use HTTPS");
    error.code = "mailer_not_configured";
    throw error;
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ to: email, code, locale, purpose: "registration" }),
    signal: AbortSignal.timeout(MAILER_TIMEOUT_MS),
    redirect: "error",
  });
  if (!response.ok) {
    const error = new Error(`Comment mailer returned ${response.status}`);
    error.code = response.status === 429 ? "rate_limited" : "mailer_unavailable";
    throw error;
  }
}
