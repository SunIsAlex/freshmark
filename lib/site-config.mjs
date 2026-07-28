export function resolveBaseUrl(configBaseUrl, environment = process.env) {
  return environment.FRESHMARK_BASE_URL?.trim() || configBaseUrl;
}
