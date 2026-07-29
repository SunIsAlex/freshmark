export function resolveBaseUrl(configBaseUrl, environment = process.env) {
  return environment.FRESHMARK_BASE_URL?.trim() || configBaseUrl;
}

export function netlifyFunctionsEnabled(environment = process.env) {
  return /^(?:1|true|yes|on)$/i.test(environment.FRESHMARK_NETLIFY_FUNCTIONS?.trim() || "");
}

export function commentsEnabled(environment = process.env) {
  return /^(?:1|true|yes|on)$/i.test(environment.FRESHMARK_COMMENTS?.trim() || "");
}

export function commentsModerated(environment = process.env) {
  return /^(?:1|true|yes|on)$/i.test(environment.FRESHMARK_COMMENTS_MODERATED?.trim() || "");
}

export function commentsAuthEnabled(environment = process.env) {
  const value = environment.FRESHMARK_COMMENTS_AUTH ?? environment.FRESHMARK_COMMENTS_EMAIL_VERIFICATION;
  return /^(?:1|true|yes|on)$/i.test(String(value || "").trim());
}
