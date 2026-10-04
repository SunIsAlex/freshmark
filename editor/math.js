// Math support for the editor: a Lezer Markdown extension that mirrors Freshmark's delimiters
// (lib/markdown.mjs protectMath) and a cached KaTeX renderer using the site's macros.
import katex from "katex";
import { tags } from "@lezer/highlight";
import { katexOptions } from "../lib/math-config.mjs";

const DOLLAR = 36, BACKSLASH = 92, OPEN_PAREN = 40, OPEN_BRACKET = 91;

export const mathSyntax = {
  defineNodes: [
    { name: "InlineMath", style: tags.special(tags.content) },
    { name: "InlineMathMark", style: tags.processingInstruction },
    { name: "BlockMath", block: true, style: tags.special(tags.content) },
    { name: "BlockMathMark", style: tags.processingInstruction },
  ],
  parseInline: [{
    name: "InlineMath",
    before: "Escape",
    parse(cx, next, pos) {
      if (next === DOLLAR) {
        if (pos > cx.offset && cx.char(pos - 1) === BACKSLASH) return -1;
        const width = cx.char(pos + 1) === DOLLAR ? 2 : 1;
        for (let index = pos + width; index < cx.end; index += 1) {
          const char = cx.char(index);
          if (char === BACKSLASH) { index += 1; continue; }
          if (char !== DOLLAR || (width === 2 && cx.char(index + 1) !== DOLLAR)) continue;
          if (index === pos + width) return -1;
          return cx.addElement(cx.elt("InlineMath", pos, index + width, [cx.elt("InlineMathMark", pos, pos + width), cx.elt("InlineMathMark", index, index + width)]));
        }
        return -1;
      }
      if (next !== BACKSLASH) return -1;
      const kind = cx.char(pos + 1);
      if (kind !== OPEN_PAREN && kind !== OPEN_BRACKET) return -1;
      const close = cx.slice(pos, cx.end).indexOf(kind === OPEN_PAREN ? "\\)" : "\\]", 2);
      if (close < 0) return -1;
      const end = pos + close + 2;
      return cx.addElement(cx.elt("InlineMath", pos, end, [cx.elt("InlineMathMark", pos, pos + 2), cx.elt("InlineMathMark", end - 2, end)]));
    },
  }],
  parseBlock: [{
    name: "BlockMath",
    before: "FencedCode",
    parse(cx, line) {
      const text = line.text.slice(line.pos);
      const opener = text.startsWith("$$") ? "$$" : text.startsWith("\\[") ? "\\[" : /^\$\\begin\{/.test(text) ? "$" : "";
      if (!opener) return false;
      const closer = opener === "$$" ? /\$\$/ : opener === "\\[" ? /\\\]/ : /\\end\{[^}]+\}\s*\$/;
      const start = cx.lineStart + line.pos;
      const children = [cx.elt("BlockMathMark", start, start + opener.length)];
      const closeOn = (lineText, offset, lineStart) => {
        const match = lineText.slice(offset).match(closer);
        if (!match) return -1;
        const end = lineStart + offset + match.index + match[0].length;
        const markWidth = opener === "$" ? 1 : 2;
        children.push(cx.elt("BlockMathMark", end - markWidth, end));
        return end;
      };
      let end = closeOn(line.text, line.pos + opener.length, cx.lineStart);
      if (end >= 0) {
        if (line.text.slice(end - cx.lineStart).trim()) return false;
        cx.nextLine();
        cx.addElement(cx.elt("BlockMath", start, end, children));
        return true;
      }
      while (cx.nextLine()) {
        end = closeOn(line.text, 0, cx.lineStart);
        if (end >= 0) {
          cx.nextLine();
          cx.addElement(cx.elt("BlockMath", start, end, children));
          return true;
        }
      }
      cx.addElement(cx.elt("BlockMath", start, cx.prevLineEnd(), children));
      return true;
    },
  }],
};

export function mathSource(text) {
  const value = String(text).trim();
  if (value.startsWith("$$") && value.endsWith("$$") && value.length >= 4) return { source: value.slice(2, -2), display: true };
  if (value.startsWith("\\[") && value.endsWith("\\]")) return { source: value.slice(2, -2), display: true };
  if (value.startsWith("\\(") && value.endsWith("\\)")) return { source: value.slice(2, -2), display: false };
  if (value.startsWith("$") && value.endsWith("$") && value.length >= 2) return { source: value.slice(1, -1), display: /\\begin\{/.test(value) };
  return { source: value, display: false };
}

const cache = new Map();
export function renderMath(source, display) {
  const key = `${display ? "D" : "I"}${source}`;
  let html = cache.get(key);
  if (html === undefined) {
    try {
      html = katex.renderToString(source.trim() || "\\;", { ...katexOptions, displayMode: display, output: "html", throwOnError: true });
    } catch (error) {
      html = `<span class="math-error" title="${String(error.message).replace(/"/g, "&quot;")}">${source.replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[char])}</span>`;
    }
    if (cache.size > 600) cache.delete(cache.keys().next().value);
    cache.set(key, html);
  }
  return html;
}
