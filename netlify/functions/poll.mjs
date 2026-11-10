import { createHash } from "node:crypto";
import { getStore } from "../lib/store.mjs";
import { pollsEnabled } from "../../lib/site-config.mjs";

const responseHeaders = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
};

const json = (body, status = 200, extraHeaders = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { ...responseHeaders, ...extraHeaders },
});

export function pollStorageKey(id) {
  const digest = createHash("sha256").update(String(id)).digest("base64url");
  return `poll:${digest}`;
}

export function computeVoterHash(pollId, voterToken) {
  if (!voterToken) return null;
  return createHash("sha256").update(`${pollId}:${voterToken}`).digest("hex").slice(0, 32);
}

export function calculatePercentages(counts, total) {
  if (!total || total <= 0) return counts.map(() => 0);
  return counts.map((count) => Math.round((count / total) * 100));
}

function parseCookie(header, name) {
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default async function handler(request) {
  if (!pollsEnabled()) return json({ error: "not_found" }, 404);

  const url = new URL(request.url, "http://localhost");
  const store = getStore({ name: "freshmark-polls", consistency: "strong" });

  if (request.method === "GET") {
    const id = url.searchParams.get("id");
    if (!id || id.length > 128) return json({ error: "invalid_id" }, 400);

    const voterToken = url.searchParams.get("voter") || parseCookie(request.headers.get("cookie"), "fm_voter");
    const voterHash = computeVoterHash(id, voterToken);

    try {
      const entry = await store.get(pollStorageKey(id));
      const totalVotes = Number.isSafeInteger(entry?.totalVotes) ? entry.totalVotes : 0;
      const counts = Array.isArray(entry?.counts) ? entry.counts : [];
      const votedOption = voterHash && entry?.voters?.[voterHash] !== undefined ? entry.voters[voterHash] : null;
      const hasVoted = votedOption !== null;

      if (hasVoted) {
        return json({
          id,
          totalVotes,
          counts,
          percentages: calculatePercentages(counts, totalVotes),
          hasVoted: true,
          votedOption,
        });
      }

      // If voter has NOT voted yet, hide counts & percentages for blind test integrity
      return json({
        id,
        totalVotes,
        hasVoted: false,
      });
    } catch (error) {
      console.error("Freshmark poll stats failed", error);
      return json({ error: "unavailable" }, 503);
    }
  }

  if (request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "invalid_json" }, 400);
    }

    const id = typeof body?.id === "string" ? body.id.trim() : "";
    const path = typeof body?.path === "string" ? body.path.trim() : "";
    const optionIndex = Number.isInteger(body?.optionIndex) && body.optionIndex >= 0 ? body.optionIndex : -1;
    const voterToken = (typeof body?.voterToken === "string" && body.voterToken.length >= 8 && body.voterToken.length <= 128)
      ? body.voterToken
      : parseCookie(request.headers.get("cookie"), "fm_voter");

    if (!id || id.length > 128 || optionIndex < 0 || optionIndex > 64 || !voterToken) {
      return json({ error: "invalid_input" }, 400);
    }

    const voterHash = computeVoterHash(id, voterToken);
    const key = pollStorageKey(id);

    try {
      for (let attempt = 0; attempt < 16; attempt += 1) {
        const entry = await store.getWithMetadata(key);
        const data = entry?.data || {
          id,
          path,
          totalVotes: 0,
          counts: [],
          voters: {},
        };

        // Check if voter already voted
        if (data.voters && data.voters[voterHash] !== undefined) {
          const currentTotal = data.totalVotes || 0;
          return json({
            ok: false,
            error: "already_voted",
            totalVotes: currentTotal,
            counts: data.counts,
            percentages: calculatePercentages(data.counts, currentTotal),
            votedOption: data.voters[voterHash],
          });
        }

        // Record vote
        while (data.counts.length <= optionIndex) data.counts.push(0);
        data.counts[optionIndex] = (data.counts[optionIndex] || 0) + 1;
        data.totalVotes = (data.totalVotes || 0) + 1;
        data.voters = { ...(data.voters || {}), [voterHash]: optionIndex };
        data.updatedAt = Date.now();

        const options = entry ? { onlyIfMatch: entry.etag } : { onlyIfNew: true };
        const result = await store.setJSON(key, data, options);
        if (result.modified) {
          const percentages = calculatePercentages(data.counts, data.totalVotes);
          return json({
            ok: true,
            totalVotes: data.totalVotes,
            counts: data.counts,
            percentages,
            votedOption: optionIndex,
          }, 200, {
            "set-cookie": `fm_voter=${encodeURIComponent(voterToken)}; Path=/; Max-Age=31536000; SameSite=Lax`,
          });
        }

        // Retry on conflict
        await new Promise((resolve) => setTimeout(resolve, Math.min(40, 2 ** attempt) + Math.random() * 8));
      }

      return json({ error: "conflict_retry_exhausted" }, 409);
    } catch (error) {
      console.error("Freshmark vote failed", error);
      return json({ error: "unavailable" }, 503);
    }
  }

  return json({ error: "method_not_allowed" }, 405);
}

export const config = {
  path: "/api/poll",
};
