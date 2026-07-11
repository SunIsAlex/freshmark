import MarkdownIt from "markdown-it";

const escapeHtml = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const slugify = (value) => String(value).toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-").replace(/-+/g, "-");

export function parseFrontmatter(source, file = "Markdown source") {
  const match = source.replaceAll("\r\n", "\n").match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: expected frontmatter between --- lines`);
  const data = {};
  let listKey = null;
  for (const line of match[1].split("\n")) {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && listKey) {
      data[listKey].push(listItem[1].trim().replace(/^['"]|['"]$/g, ""));
      continue;
    }
    const property = line.match(/^([^\s#:][^:]*):\s*(.*)$/);
    if (!property) continue;
    const [, key, rawValue] = property;
    let value = rawValue.trim();
    if (value.startsWith("[") && value.endsWith("]")) value = value.slice(1, -1).split(",").map((item) => item.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
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
  return excerpt
    .replace(/<!--[\s\S]*?-->|<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[#*`>_~]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
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

export function renderMarkdown(markdown) {
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
  const defaultImage = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, index, options, env, self) => {
    tokens[index].attrSet("loading", "lazy");
    tokens[index].attrSet("decoding", "async");
    return defaultImage(tokens, index, options, env, self);
  };

  const { protectedMarkdown, math } = protectMath(markdown);
  let html = md.render(protectedMarkdown);
  html = html.replace(/FRESHMARKMATH(\d+)END/g, (_, index) => {
    const expression = math[Number(index)];
    return `${expression.display ? "\\[" : "\\("}${escapeHtml(expression.source)}${expression.display ? "\\]" : "\\)"}`;
  });
  return { html: html.trim(), headings };
}
