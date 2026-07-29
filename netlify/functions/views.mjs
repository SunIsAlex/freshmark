import { getStore } from "@netlify/blobs";
import { netlifyFunctionsEnabled } from "../../lib/site-config.mjs";

const responseHeaders = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
};

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: responseHeaders,
});

export function normalizeViewPath(value) {
  if (typeof value !== "string" || value.length > 512 || !value.startsWith("/")) return null;
  try {
    const url = new URL(value, "https://freshmark.invalid");
    if (url.origin !== "https://freshmark.invalid") return null;
    return url.pathname.replace(/\/{2,}/g, "/");
  } catch {
    return null;
  }
}

export async function incrementCounter(store, key, { retries = 16 } = {}) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const entry = await store.getWithMetadata(key, { consistency: "strong", type: "json" });
    const current = Number.isSafeInteger(entry?.data?.count) && entry.data.count >= 0 ? entry.data.count : 0;
    const options = entry ? { onlyIfMatch: entry.etag } : { onlyIfNew: true };
    const result = await store.setJSON(key, { count: current + 1 }, options);
    if (result.modified) return current + 1;
    await new Promise((resolve) => setTimeout(resolve, Math.min(40, 2 ** attempt) + Math.random() * 8));
  }
  throw new Error(`Could not update view counter: ${key}`);
}

export default async function handler(request) {
  if (!netlifyFunctionsEnabled()) return json({ error: "Not found" }, 404);
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const path = normalizeViewPath(input?.path);
  if (!path || typeof input?.article !== "boolean") return json({ error: "Invalid view" }, 400);

  try {
    const store = getStore({ name: "freshmark-view-counts", consistency: "strong" });
    const sitePromise = incrementCounter(store, "site");
    const articlePromise = input.article
      ? incrementCounter(store, `article:${Buffer.from(path).toString("base64url")}`)
      : Promise.resolve(null);
    const [siteViews, articleViews] = await Promise.all([sitePromise, articlePromise]);
    return json({ siteViews, articleViews });
  } catch (error) {
    console.error("Freshmark view counter failed", error);
    return json({ error: "View counter unavailable" }, 503);
  }
}
