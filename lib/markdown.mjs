import MarkdownIt from "markdown-it";
import { renderMathSvg } from "./math-svg.mjs";

const escapeHtml = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const slugify = (value) => String(value).toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-").replace(/-+/g, "-");

export function parseFrontmatter(source, file = "Markdown source") {
  const match = source.replaceAll("\r\n", "\n").match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: expected frontmatter between --- lines`);
  const data = {};
  let listKey = null;
  const lines = match[1].split("\n");
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && listKey) {
      data[listKey].push(listItem[1].trim().replace(/^['"]|['"]$/g, ""));
      continue;
    }
    const property = line.match(/^([^\s#:][^:]*):\s*(.*)$/);
    if (!property) continue;
    const [, key, rawValue] = property;
    let value = rawValue.trim();
    if ([">", "|"].includes(value)) {
      const folded = value === ">";
      const continuation = [];
      while (lineIndex + 1 < lines.length && /^\s+/.test(lines[lineIndex + 1])) {
        continuation.push(lines[lineIndex + 1].trim());
        lineIndex += 1;
      }
      value = continuation.join(folded ? " " : "\n");
    } else if (value.startsWith("[") && value.endsWith("]")) value = value.slice(1, -1).split(",").map((item) => item.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
    else if (value === "true" || value === "false") value = value === "true";
    else value = value.replace(/^['"]|['"]$/g, "");
    if (value === "" && ["tags", "categories"].includes(key)) {
      data[key] = [];
      listKey = key;
    } else {
      data[key] = value;
      listKey = null;
    }
  }
  return { data, body: match[2].trim() };
}

export function summaryFromBody(body) {
  const marker = body.indexOf("<!--more-->");
  const excerpt = marker >= 0 ? body.slice(0, marker) : body;
  const { protectedMarkdown, math } = protectMath(excerpt);
  const cleaned = protectedMarkdown
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/?(?:address|article|aside|blockquote|br|div|dl|dt|dd|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|thead|tfoot|tr|td|th|ul)\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[#*`>_~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  let cutoff = Math.min(180, cleaned.length);
  for (const match of cleaned.matchAll(/FRESHMARKMATH\d+END/g)) {
    const end = match.index + match[0].length;
    if (match.index < cutoff && end > cutoff) cutoff = end;
  }
  return cleaned.slice(0, cutoff).trimEnd().replace(/FRESHMARKMATH(\d+)END/g, (_, index) => {
    const expression = math[Number(index)];
    return `${expression.display ? "$$" : "$"}${expression.source}${expression.display ? "$$" : "$"}`;
  });
}

function protectMath(markdown) {
  const math = [];
  const token = (source, display) => `FRESHMARKMATH${math.push({ source: source.trim(), display }) - 1}END`;
  const processText = (text) => text
    .replace(/(\$[^$\n]+)\$\$(?=\S)/g, "$1$ $")
    .replace(/\$(\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\})\$/g, (_, source) => `$${source.replace(/\s*\n\s*/g, " ")}$`)
    .replace(/^\s*\$([^$\n]+)\$\s*$/gm, (_, source) => `$$${source}$$`)
    .split(/(`[^`\n]*`)/g)
    .map((part, index) => index % 2 ? part : part
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, source) => token(source, true))
      .replace(/\\\[([\s\S]+?)\\\]/g, (_, source) => token(source, true))
      .replace(/\\\((.+?)\\\)/g, (_, source) => token(source, false))
      .replace(/(?<!\\)\$([^$\n]+?)(?<!\\)\$/g, (_, source) => token(source, false)))
    .join("");
  const protectedMarkdown = markdown.split(/(```[\s\S]*?```)/g).map((part, index) => index % 2 ? part : processText(part)).join("");
  return { protectedMarkdown, math };
}

function renderMathSource(source, { display = false } = {}) {
  const className = display ? "math-expression math-display" : "math-expression math-inline";
  return `<span class="${className}" data-math-source="${escapeHtml(source)}"${display ? " data-math-display" : ""}></span>`;
}

async function replaceMathTokens(html, math, mathOutput) {
  const matches = [...html.matchAll(/FRESHMARKMATH(\d+)END/g)];
  if (!matches.length) return html;
  const replacements = await Promise.all(matches.map(async (match) => {
    const expression = math[Number(match[1])];
    if (mathOutput === "source") {
      return renderMathSource(expression.source, { display: expression.display });
    }
    return renderMathSvg(expression.source, { display: expression.display });
  }));
  let rendered = "";
  let cursor = 0;
  for (let index = 0; index < matches.length; index += 1) {
    rendered += html.slice(cursor, matches[index].index) + replacements[index];
    cursor = matches[index].index + matches[index][0].length;
  }
  return rendered + html.slice(cursor);
}

export async function renderSummary(markdown, { links = true, mathOutput = "svg" } = {}) {
  const md = new MarkdownIt({ html: false, linkify: true, typographer: false });
  if (!links) {
    md.renderer.rules.link_open = () => "";
    md.renderer.rules.link_close = () => "";
  }
  const { protectedMarkdown, math } = protectMath(String(markdown || ""));
  return (await replaceMathTokens(md.renderInline(protectedMarkdown), math, mathOutput)).trim();
}

export async function renderMarkdown(markdown, { mathOutput = "svg" } = {}) {
  const headings = [];
  const md = new MarkdownIt({ html: true, linkify: true, typographer: false });
  md.core.ruler.push("freshmark_headings", (state) => {
    const used = new Map();
    for (let index = 0; index < state.tokens.length; index += 1) {
      const opening = state.tokens[index];
      if (opening.type !== "heading_open") continue;
      const inline = state.tokens[index + 1];
      const protectedText = inline?.content || "";
      const text = protectedText.replace(/FRESHMARKMATH(\d+)END/g, (_, mathIndex) => {
        const expression = math[Number(mathIndex)];
        return `${expression.display ? "\\[" : "\\("}${expression.source}${expression.display ? "\\]" : "\\)"}`;
      });
      const idText = protectedText.replace(/FRESHMARKMATH\d+END/g, "");
      const base = slugify(idText) || "section";
      const count = used.get(base) || 0;
      used.set(base, count + 1);
      const id = count ? `${base}-${count + 1}` : base;
      opening.attrSet("id", id);
      headings.push({ id, text, level: Number(opening.tag.slice(1)) });
    }
  });
  md.core.ruler.push("freshmark_image_captions", (state) => {
    for (let index = 0; index < state.tokens.length - 2; index += 1) {
      const opening = state.tokens[index];
      const inline = state.tokens[index + 1];
      const closing = state.tokens[index + 2];
      if (opening.type !== "paragraph_open" || inline.type !== "inline" || closing.type !== "paragraph_close") continue;
      const children = (inline.children || []).filter((token) => token.type !== "text" || token.content.trim());
      if (children.length !== 1 || children[0].type !== "image") continue;
      const caption = children[0].attrGet("title");
      if (!caption) continue;
      opening.tag = "figure";
      opening.attrSet("class", "prose-figure");
      closing.tag = "figure";
      children[0].meta = { ...(children[0].meta || {}), caption };
    }
  });
  const defaultImage = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, index, options, env, self) => {
    tokens[index].attrSet("loading", "lazy");
    tokens[index].attrSet("decoding", "async");
    const image = defaultImage(tokens, index, options, env, self);
    const caption = tokens[index].meta?.caption;
    return caption ? `${image}<figcaption>${escapeHtml(caption)}</figcaption>` : image;
  };

  const { protectedMarkdown, math } = protectMath(markdown);
  let html = md.render(protectedMarkdown);
  html = await replaceMathTokens(html, math, mathOutput);
  await Promise.all(headings.map(async (heading) => {
    heading.html = await renderSummary(heading.text, { links: false, mathOutput });
  }));
  return { html: html.trim(), headings };
}
