// Uses the same local preview and ChromeDriver setup as check-ui.mjs.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { readTokenRecords } from "../lib/token-stream.mjs";
import { TOKEN_MAGIC, encodeTokenRecord, joinBytes } from "../lib/token-binary.mjs";
const driver = process.env.WEBDRIVER_URL || "http://127.0.0.1:9517";
const origin = process.env.PREVIEW_URL || "http://127.0.0.1:8767";
async function call(route, body, method = "POST") {
  const response = await fetch(`${driver}${route}`, {
    method, headers: { "content-type": "application/json" },
    ...(method === "GET" ? {} : { body: JSON.stringify(body || {}) }),
  });
  const { value } = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(value));
  return value;
}
const session = await call("/session", { capabilities: { alwaysMatch: {
  browserName: "chrome", "goog:chromeOptions": {
    args: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"],
    ...(process.env.CHROME_BINARY ? { binary: process.env.CHROME_BINARY } : {}),
  },
} } });
const base = `/session/${session.sessionId}`;
const execute = (script, args = []) => call(`${base}/execute/sync`, { script, args });
const waitFor = async (script) => {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (await execute(`return Boolean(${script})`)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out: ${script}`);
};
const visit = (route) => call(`${base}/url`, { url: `${origin}${route}` });
const click = (route) => execute("const a=document.createElement('a');a.href=arguments[0];document.body.append(a);a.click();a.remove()", [route]);
const article = "/posts/chemistry/inorganic/manganese/";
const ready = () => waitFor("performance.getEntriesByType('resource').some(r=>/tokenizer-/.test(r.name))");
try {
  await call(`${base}/goog/cdp/execute`, { cmd: "Network.enable", params: {} });
  await call(`${base}/goog/cdp/execute`, { cmd: "Network.setBlockedURLs", params: { urls: ["*tokenizer-*.js"] } });
  await visit("/");
  await waitFor("history.state?.spa");
  await click(article);
  await waitFor("document.querySelector('.prose') && !document.querySelector('.site-shell[aria-busy]')");
  assert.equal(await execute("return document.querySelectorAll('[data-ai-token]').length"), 0, "Missing script preserves legacy SPA loading");
  await call(`${base}/goog/cdp/execute`, { cmd: "Network.setBlockedURLs", params: { urls: [] } });
  await visit(article);
  await ready();
  await execute("localStorage.removeItem('freshmark-ai-token-highlights')");
  assert.equal(await execute("return document.querySelectorAll('[data-ai-token]').length"), 0, "Initial article must keep ordinary HTML");
  await visit("/");
  await ready();
  const started = await execute("return performance.timeOrigin");
  await click(article);
  await waitFor("document.querySelector('[data-ai-token-article]') && !document.querySelector('.site-shell[aria-busy]')");
  assert.equal(await execute("return performance.timeOrigin"), started);
  assert.ok(await execute("return document.querySelectorAll('[data-ai-token]').length>20"));
  assert.equal(await execute("return document.querySelector('main').dataset.aiTokenizer"), "qwen3.5");
  assert.equal(await execute("return Boolean(document.querySelector('.content-diff-notice'))"), false, "Tokenizing an unchanged article must not report content changes");
  assert.equal(await execute("return document.querySelector('.ai-token-toggle').getAttribute('aria-pressed')"), "false");
  const text = await execute("return document.querySelector('.prose').textContent");
  await execute("document.querySelector('.ai-token-toggle').click()");
  assert.equal(await execute("return document.querySelector('main').classList.contains('ai-tokens-visible')"), true);
  assert.equal(await execute("return document.querySelector('.prose').textContent"), text, "Toggle must preserve copied text");
  for (const theme of ["light", "dark"]) {
    await execute("document.documentElement.dataset.theme=arguments[0]", [theme]);
    await call(`${base}/goog/cdp/execute`, { cmd: "Emulation.setDeviceMetricsOverride", params: { width: 390, height: 844, deviceScaleFactor: 1, mobile: true } });
    assert.equal(await execute("return document.documentElement.scrollWidth<=innerWidth+1"), true, `${theme} mobile overflow`);
    assert.equal(await execute("const spans=[...document.querySelectorAll('[data-ai-token]')];return getComputedStyle(spans[0]).backgroundColor!==getComputedStyle(spans[1]).backgroundColor"), true);
    const screenshots = new URL("../.freshmark-cache/ui/", import.meta.url);
    await mkdir(screenshots, { recursive: true });
    const png = await call(`${base}/screenshot`, undefined, "GET");
    await writeFile(new URL(`tokenizer-${theme}.png`, screenshots), Buffer.from(png, "base64"));
  }
  // Select a search phrase spanning at least two neighboring tokenizer spans.
  const phrase = await execute("const span=[...document.querySelectorAll('.prose p [data-ai-token]')].find(s=>s.nextSibling?.matches?.('[data-ai-token]')&&s.textContent.trim());return span.textContent+span.nextSibling.textContent");
  await click(`${article}?q=${encodeURIComponent(phrase.trim())}`);
  await waitFor("!document.querySelector('.site-shell[aria-busy]') && document.querySelector('[data-ai-token] mark[data-search-highlight]')");
  assert.equal(await execute("return document.querySelector('.ai-token-toggle').getAttribute('aria-pressed')"), "true", "Preference survives SPA navigation");
  await visit("/");
  await ready();
  // Prepare controlled streams from a real generated shell, then explicitly hold
  // their tail to verify visible progress, fallback and cancellation in the DOM.
  const fallbackStarted = await execute("return performance.timeOrigin");
  const fixtureRecords = readTokenRecords(await fetch(`${origin}${article}tokens.bin`));
  const { value: fixtureHeader } = await fixtureRecords.next();
  await fixtureRecords.return();
  const prefix = joinBytes([TOKEN_MAGIC, encodeTokenRecord(fixtureHeader), encodeTokenRecord({ type: "block", ops: [{ html: '<p id="stream-first" style="min-height:2400px">First streamed block</p>' }] })]);
  const ending = encodeTokenRecord({ type: "end", blocks: 1, tokens: 0, dictionarySize: 0 });
  await execute("window.tokenFixture=new Uint8Array(arguments[0]);window.tokenEnd=new Uint8Array(arguments[1])", [[...prefix], [...ending]]);
  await execute(`window.originalFetch=window.fetch;window.streamMode='hold';window.tokenCancelled=false;
    window.fetch=(url,options)=>{
      if(!String(url).includes('tokens.bin'))return originalFetch(url,options);
      if(streamMode==='404')return Promise.resolve(new Response('',{status:404}));
      return Promise.resolve(new Response(new ReadableStream({start(c){
        window.tokenController=c;c.enqueue(tokenFixture);


      },cancel(){window.tokenCancelled=true}})));
    };`);
  await click(article);
  await waitFor("document.querySelector('#stream-first') && document.querySelector('.prose[aria-busy]')");
  assert.equal(await execute("return document.querySelector('.prose').children.length"), 1, "First block appears before EOF");
  await execute("scrollTo({top:500,behavior:'instant'});document.querySelector('.ai-token-toggle').focus({preventScroll:true})");
  await waitFor("Math.abs(scrollY-500)<2");
  await execute("tokenController.enqueue(tokenEnd);tokenController.close()");
  await waitFor("!document.querySelector('.site-shell[aria-busy]')");
  assert.deepEqual(await execute("return {scroll:Math.round(scrollY),toggleFocused:document.activeElement.matches('.ai-token-toggle')}"), { scroll: 500, toggleFocused: true }, "Completion must not reset reading position or steal focus");
  await click("/");
  await waitFor("document.querySelector('[data-post-card]') && !document.querySelector('.site-shell[aria-busy]')");
  await click(article);
  await waitFor("document.querySelector('#stream-first') && document.querySelector('.prose[aria-busy]')");
  await execute("tokenController.close()");
  await waitFor("!document.querySelector('.site-shell[aria-busy]') && !document.querySelector('#stream-first') && document.querySelector('.prose p')");
  assert.equal(await execute("return performance.timeOrigin"), fallbackStarted, "Fallback stays within SPA navigation");
  assert.equal(await execute("return document.querySelectorAll('[data-ai-token]').length"), 0, "Truncation restores HTML");
  await click("/");
  await waitFor("document.querySelector('[data-post-card]') && !document.querySelector('.site-shell[aria-busy]')");
  await execute("window.streamMode='404'");
  await click(article);
  await waitFor("!document.querySelector('.site-shell[aria-busy]') && document.querySelector('.prose')");
  assert.equal(await execute("return document.querySelectorAll('[data-ai-token]').length"), 0, "Missing stream falls back to HTML");
  await click("/");
  await waitFor("document.querySelector('[data-post-card]') && !document.querySelector('.site-shell[aria-busy]')");
  await execute("window.streamMode='hold';window.tokenCancelled=false");
  await click(article);
  await waitFor("document.querySelector('#stream-first')");
  await click("/about/");
  await waitFor("location.pathname==='/about/' && !document.querySelector('.site-shell[aria-busy]')");
  assert.equal(await execute("return window.tokenCancelled && !document.querySelector('#stream-first')"), true, "Leaving cancels the old stream");
  await execute("window.fetch=originalFetch");
  await click("/posts/math/2026-math-olympiad-preliminary-a/");
  await waitFor("document.querySelector('main[data-ai-tokenizer=\"qwen3.5\"]') && !document.querySelector('.site-shell[aria-busy]')");
  assert.equal(await execute("return [...document.querySelectorAll('[data-ai-token=\"97332\"]')].some(s=>s.textContent==='有的' && s.nextSibling?.dataset?.aiToken==='144318' && s.nextSibling.textContent==='放矢')"), true, "Real article must display Qwen3.5's two tokens for 有的放矢");
  await visit("/en/");
  await ready();
  await click("/en/posts/chemistry/inorganic/manganese/");
  await waitFor("document.querySelector('.ai-token-toggle') && !document.querySelector('.site-shell[aria-busy]')");
  assert.equal(await execute("return document.querySelector('.ai-token-toggle').textContent"), "AI Tokenizer Beta");
  const englishStarted = await execute("return performance.timeOrigin");
  await call(`${base}/back`);
  await waitFor("location.pathname==='/en/' && !document.querySelector('.site-shell[aria-busy]')");
  await call(`${base}/forward`);
  await waitFor("document.querySelector('.ai-token-toggle') && !document.querySelector('.site-shell[aria-busy]')");
  assert.equal(await execute("return performance.timeOrigin"), englishStarted, "Back/forward preserves SPA navigation");
  console.log("Passed tokenizer UI: missing script, initial HTML, SPA streaming, toggle persistence, light/dark mobile, cross-token search, partial response, HTML fallback, cancellation, English locale and back/forward.");
} finally {
  await call(base, {}, "DELETE");
}
