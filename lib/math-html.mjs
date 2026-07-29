import katex from "katex";
import "katex/contrib/mhchem";
import { katexOptions } from "./math-config.mjs";

const rendered = new Map();

const escapeAttribute = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

export function renderMathHtml(source, { display = false, output = katexOptions.output } = {}) {
  const key = `${display ? "display" : "inline"}\0${output}\0${source}`;
  if (!rendered.has(key)) {
    const className = display ? "math-expression math-display" : "math-expression math-inline";
    const html = katex.renderToString(source, { ...katexOptions, displayMode: display, output });
    rendered.set(key, `<span class="${className}" aria-label="${escapeAttribute(source)}">${html}</span>`);
  }
  return rendered.get(key);
}
