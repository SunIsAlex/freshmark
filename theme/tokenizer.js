import { openTokenStream } from "../lib/token-stream.mjs";
import { TOKEN_MIME } from "../lib/token-binary.mjs";

const preferenceKey = "freshmark-ai-token-highlights";
let enabled = false;
try { enabled = localStorage.getItem(preferenceKey) === "true"; } catch {}

export async function openPage(url, signal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener("abort", abort, { once: true });
  let timer;
  const touch = () => { clearTimeout(timer); timer = setTimeout(abort, 15000); };
  const cleanup = () => { clearTimeout(timer); signal.removeEventListener("abort", abort); controller.abort(); };
  try {
    signal.throwIfAborted();
    touch();
    const stream = await openTokenStream(await fetch(new URL("tokens.bin", url), {
      signal: controller.signal, headers: { accept: TOKEN_MIME }, cache: "no-cache",
    }), controller.signal);
    return {
      page: stream.page,
      async close() { cleanup(); await stream.close(); },
      async render(main, prepare) {
        const prose = main.querySelector(".prose");
        if (!prose || prose.childNodes.length) throw new Error("Invalid token article shell");
        main.dataset.aiTokenArticle = "";
        main.dataset.aiTokenizer = stream.tokenizer;
        prepareToggle(main, stream.tokenizer);
        prose.setAttribute("aria-busy", "true");
        try {
          await stream.consume(async (html) => {
            touch();
            signal.throwIfAborted();
            if (!main.isConnected) throw new Error("Token article detached");
            const block = document.createElement("div");
            block.innerHTML = html;
            await prepare(block);
            signal.throwIfAborted();
            if (!main.isConnected) throw new Error("Token article detached");
            prose.append(...block.childNodes);
            // Yield even when the entire response is already buffered by a CDN.
            await new Promise((resolve) => setTimeout(resolve, 0));
          });
        } finally {
          cleanup();
          prose.removeAttribute("aria-busy");
        }
      },
    };
  } catch (error) {
    cleanup();
    throw error;
  }
}

function prepareToggle(main, tokenizer) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "article-share ai-token-toggle";
  button.textContent = window.FRESHMARK?.messages?.aiTokenizer || "AI Tokenizer Beta";
  button.title = tokenizer === "qwen3.5" ? "Qwen3.5" : "o200k_base";
  const update = () => {
    main.classList.toggle("ai-tokens-visible", enabled);
    button.setAttribute("aria-pressed", String(enabled));
  };
  update();
  button.addEventListener("click", () => {
    enabled = !enabled;
    try { localStorage.setItem(preferenceKey, String(enabled)); } catch {}
    update();
  });
  main.querySelector(".article-meta")?.append(button);
}

// Search across consecutive token spans, preserving their boundaries and IDs.
export function highlightTokenText(scope, term, ignored) {
  const matches = [];
  const needle = term.toLowerCase();
  for (const first of scope.querySelectorAll("[data-ai-token]")) {
    if (first.previousSibling?.matches?.("[data-ai-token]") || first.closest(ignored)) continue;
    const spans = [];
    let current = first;
    while (current?.matches?.("[data-ai-token]")) {
      spans.push(current);
      current = current.nextSibling;
    }
    const text = spans.map((span) => span.textContent).join("");
    const normalized = text.toLowerCase();
    const ranges = [];
    for (let at = normalized.indexOf(needle); at >= 0; at = normalized.indexOf(needle, at + term.length)) ranges.push([at, at + term.length]);
    let offset = 0;
    for (const span of spans) {
      const value = span.textContent;
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      for (const [start, end] of ranges) {
        const left = Math.max(0, start - offset);
        const right = Math.min(value.length, end - offset);
        if (left >= right) continue;
        fragment.append(document.createTextNode(value.slice(cursor, left)));
        const mark = document.createElement("mark");
        mark.className = "search-highlight";
        mark.dataset.searchHighlight = "";
        mark.textContent = value.slice(left, right);
        fragment.append(mark);
        matches.push(mark);
        cursor = right;
      }
      if (cursor) {
        fragment.append(document.createTextNode(value.slice(cursor)));
        span.replaceChildren(fragment);
      }
      offset += value.length;
    }
  }
  return matches;
}
