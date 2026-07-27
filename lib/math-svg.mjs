import MathJax from "@mathjax/src";

const mathJax = await MathJax.init({
  loader: {
    load: ["input/tex", "output/svg", "[tex]/mhchem"],
  },
  tex: {
    packages: { "[+]": ["mhchem"] },
    macros: {
      degree: "^{\\circ}",
      R: "\\mathbb{R}",
      N: "\\mathbb{N}",
      Z: "\\mathbb{Z}",
      E: "\\mathrm{e}",
      Hoffmann: "\\operatorname{Hoffmann}",
    },
  },
  svg: {
    fontCache: "global",
    useXlink: false,
  },
});

const adaptor = mathJax.startup.adaptor;
const output = mathJax.startup.output;
const rendered = new Map();

const escapeAttribute = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

function compactSvg(svg) {
  return svg
    .replace(/\sdata-mml-node="[^"]*"/g, "")
    .replace(/\sdata-latex(?:-[\w-]+)?="[^"]*"/g, "")
    .replace(/\sdata-(?:c|mjx-[\w-]+)="[^"]*"/g, "")
    .replace(/\srole="img"/, "")
    .replace(/\sfocusable="false"/, "")
    .replace("<svg ", '<svg aria-hidden="true" focusable="false" ');
}

export async function renderMathSvg(source, { display = false } = {}) {
  const key = `${display ? "display" : "inline"}\0${source}`;
  if (!rendered.has(key)) {
    rendered.set(key, (async () => {
      const node = await mathJax.tex2svgPromise(source, {
        display,
        em: 16,
        ex: 8,
        containerWidth: 720,
      });
      const svg = adaptor.serializeXML(adaptor.tags(node, "svg")[0]);
      if (svg.includes('data-mml-node="merror"')) {
        throw new Error(`Could not render TeX as SVG: ${source}`);
      }
      const className = display ? "math-expression math-display" : "math-expression math-inline";
      return `<span class="${className}" role="img" aria-label="${escapeAttribute(source)}">${compactSvg(svg)}</span>`;
    })());
  }
  return rendered.get(key);
}

export function injectMathSvgDefinitions(html) {
  const ids = new Set([...html.matchAll(/\shref="#(MJX-[^"]+)"/g)].map((match) => match[1]));
  if (!ids.size) return html;
  const paths = [...ids].map((id) => {
    const path = output.fontCache.cache.get(id);
    if (path === undefined) throw new Error(`Missing MathJax SVG path definition: ${id}`);
    return `<path id="${escapeAttribute(id)}" d="${escapeAttribute(path)}"></path>`;
  }).join("");
  const definitions = `<svg class="math-svg-definitions" aria-hidden="true" width="0" height="0" focusable="false"><defs>${paths}</defs></svg>`;
  const articleHeader = /(<header\b[^>]*class="[^"]*\barticle-header\b[^"]*"[^>]*>[\s\S]*?<\/header>)/;
  if (articleHeader.test(html)) return html.replace(articleHeader, `$1${definitions}`);
  return html.replace("</main>", `${definitions}</main>`);
}

export async function closeMathSvgRenderer() {
  await mathJax.done();
}
