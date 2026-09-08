// Run against a built public/ tree served locally and a local ChromeDriver.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const driver = process.env.WEBDRIVER_URL || "http://127.0.0.1:9517";
const origin = process.env.PREVIEW_URL || "http://127.0.0.1:8767";
const artifacts = new URL("../.freshmark-cache/ui/", import.meta.url);
async function call(route, body, method = "POST") {
  const response = await fetch(`${driver}${route}`, {
    method, headers: { "content-type": "application/json" },
    ...(method !== "GET" ? { body: JSON.stringify(body || {}) } : {}),
  });
  const { value } = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(value));
  return value;
}
const session = await call("/session", { capabilities: { alwaysMatch: {
  browserName: "chrome",
  "goog:chromeOptions": { args: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"], ...(process.env.CHROME_BINARY ? { binary: process.env.CHROME_BINARY } : {}) },
} } });
const base = `/session/${session.sessionId}`;
const execute = (script, args = []) => call(`${base}/execute/sync`, { script, args });
const pause = () => new Promise((resolve) => setTimeout(resolve, 700));
const results = [];
await mkdir(artifacts, { recursive: true });
try {
  for (const locale of ["", "/en"]) {
    await call(`${base}/url`, { url: `${origin}${locale}/` });
    const article = await execute("return document.querySelector('[data-post-card]').getAttribute('href')");
    for (const width of [360, 390, 768, 1440]) {
      // CDP viewport emulation avoids desktop window minimum widths.
      await call(`${base}/goog/cdp/execute`, { cmd: "Emulation.setDeviceMetricsOverride", params: { width, height: 1000, deviceScaleFactor: 1, mobile: false } });
      for (const route of [`${locale}/`, article]) {
        await call(`${base}/url`, { url: `${origin}${route}` });
        await pause();
        for (const theme of ["light", "dark"]) {
          await execute("document.documentElement.dataset.theme=arguments[0]", [theme]);
          await pause();
          const layout = await execute("return {width:innerWidth,scroll:document.documentElement.scrollWidth,title:document.title,background:getComputedStyle(document.body).backgroundColor,prose:document.querySelector('.prose')?getComputedStyle(document.querySelector('.prose')).fontSize:null}");
          assert.ok(layout.scroll <= layout.width + 1, `Overflow: ${route} ${width} ${JSON.stringify(layout)}`);
          const name = `${locale ? "en" : "zh"}-${route === `${locale}/` ? "home" : "article"}-${width}-${theme}`;
          results.push({ name, ...layout });
          if ([390, 1440].includes(width)) {
            const png = await call(`${base}/screenshot`, undefined, "GET");
            await writeFile(new URL(`${name}.png`, artifacts), Buffer.from(png, "base64"));
          }
        }
      }
    }
  }
  await call(`${base}/url`, { url: `${origin}/` });
  await pause();
  await execute("window.testTrigger=document.querySelector('[data-search-open]');testTrigger.focus();testTrigger.click()");
  await pause();
  assert.equal(await execute("return document.activeElement===document.querySelector('[data-search-input]') && document.querySelector('.site-shell').inert"), true);
  await call(`${base}/actions`, { actions: [{ type: "key", id: "keyboard", actions: [{ type: "keyDown", value: "\uE008" }, { type: "keyDown", value: "\uE004" }, { type: "keyUp", value: "\uE004" }, { type: "keyUp", value: "\uE008" }] }] });
  assert.equal(await execute("return document.activeElement===Array.from(document.querySelectorAll('[data-search-modal] a[href], [data-search-modal] button, [data-search-modal] input')).at(-1)"), true);
  await call(`${base}/actions`, { actions: [{ type: "key", id: "keyboard", actions: [{ type: "keyDown", value: "\uE00C" }, { type: "keyUp", value: "\uE00C" }] }] });
  assert.equal(await execute("return document.querySelector('[data-search-modal]').hidden && !document.querySelector('.site-shell').inert && document.activeElement===testTrigger"), true);
  await execute("testTrigger.click(); const input=document.querySelector('[data-search-input]'); input.value='__freshmark_no_matching_article__'; input.dispatchEvent(new Event('input',{bubbles:true}))");
  await pause();
  assert.equal(await execute("return document.querySelectorAll('.search-result').length"), 0);
  await execute("document.querySelector('[data-search-close]').click(); const button=document.querySelector('[data-tag]:not([data-tag=__all__])'); button.click(); window.testSubject=button.dataset.tag");
  assert.equal(await execute("return [...document.querySelectorAll('[data-post-card]')].filter(card=>!card.hidden).every(card=>card.dataset.tags.split('|').includes(testSubject))"), true);
  const beforeNavigation = await execute("return performance.timeOrigin");
  await execute("document.querySelector('[data-tag=__all__]').click();document.querySelector('[data-post-card]').click()");
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await execute("return Boolean(document.querySelector('.prose'))")) break;
    await pause();
  }
  assert.equal(await execute("return Boolean(document.querySelector('.prose'))"), true);
  assert.equal(await execute("return performance.timeOrigin"), beforeNavigation, "Article navigation must use the SPA");
  await call(`${base}/goog/cdp/execute`, { cmd: "Emulation.setDeviceMetricsOverride", params: { width: 390, height: 1000, deviceScaleFactor: 1, mobile: false } });
  await execute("document.querySelector('[data-toc-toggle]').click()");
  assert.equal(await execute("return document.querySelector('[data-toc-toggle]').getAttribute('aria-expanded')"), "true");
  for (const route of ["/about/", "/404.html"]) {
    await call(`${base}/url`, { url: `${origin}${route}` });
    assert.equal(await execute("return document.documentElement.scrollWidth<=innerWidth+1 && Boolean(document.querySelector('main h1'))"), true);
  }
  await call(`${base}/goog/cdp/execute`, { cmd: "Emulation.setScriptExecutionDisabled", params: { value: true } });
  await call(`${base}/url`, { url: `${origin}/` });
  await call(`${base}/goog/cdp/execute`, { cmd: "Emulation.setScriptExecutionDisabled", params: { value: false } });
  assert.equal(await execute("return Boolean(document.querySelector('main h1')) && document.querySelectorAll('[data-post-card]').length>0"), true);
  await writeFile(new URL("results.json", artifacts), JSON.stringify(results, null, 2));
  console.log(`Passed ${results.length} viewport/theme/page checks, search keyboard, filtering, SPA, mobile TOC, about/404 and no-JS checks. Screenshots: ${artifacts.pathname}`);
} finally {
  await call(base, {}, "DELETE");
}
