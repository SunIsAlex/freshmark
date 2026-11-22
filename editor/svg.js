// Inline <svg> support for the editor: a Lezer Markdown extension (SvgBlock + InlineSvg)
// and a sanitized Shadow DOM renderer so inline diagrams preview live while preserving
// currentColor/theme inheritance and isolating <style>/id references.
import { tags } from "@lezer/highlight";

const SVG_NS = "http://www.w3.org/2000/svg";
const OPEN_ANGLE = 60;
const SVG_OPEN_RE = /^<svg(?=[\s/>]|$)/i;
const SVG_CLOSE_RE = /^<\/svg\s*>/i;

const BLOCKED_TAGS = new Set([
  "script", "foreignobject", "iframe", "object", "embed", "audio", "video", "canvas",
  "link", "meta", "base", "form", "input", "button", "textarea", "select",
  "applet", "frame", "frameset", "portal", "handler", "listener",
]);
const ANIMATION_TAGS = new Set(["animate", "animatemotion", "animatetransform", "set"]);
const URL_ATTRS = new Set(["href", "xlink:href", "src", "action", "formaction"]);
const PAINT_URL_ATTRS = new Set(["fill", "stroke", "clip-path", "mask", "filter", "marker-start", "marker-mid", "marker-end"]);

const BLOCK_SHADOW_CSS = ":host{display:block;text-align:center}svg{display:block;margin:0 auto!important}svg[viewBox][width]{max-width:100%;height:auto}svg[viewBox]:not([width]){max-width:100%;max-height:70vh}";
const INLINE_SHADOW_CSS = ":host{display:inline-flex;align-items:center;vertical-align:-0.15em;max-width:100%}svg{display:block}svg[viewBox][width]{max-width:100%;height:auto}svg[viewBox]:not([width]):not([height]){height:1.15em;width:auto}";

function createScanState() {
  return { depth: 0, inComment: false, inCdata: false, inOpenTag: false, quote: "" };
}

export function advanceSvgScan(text, startIndex, state) {
  let i = startIndex;
  while (i < text.length) {
    if (state.inComment) {
      const end = text.indexOf("-->", i);
      if (end < 0) return null;
      state.inComment = false;
      i = end + 3;
      continue;
    }
    if (state.inCdata) {
      const end = text.indexOf("]]>", i);
      if (end < 0) return null;
      state.inCdata = false;
      i = end + 3;
      continue;
    }
    if (state.inOpenTag) {
      while (i < text.length) {
        const ch = text[i];
        if (state.quote) {
          if (ch === state.quote) state.quote = "";
          i += 1;
          continue;
        }
        if (ch === '"' || ch === "'") {
          state.quote = ch;
          i += 1;
          continue;
        }
        if (ch === ">") {
          state.inOpenTag = false;
          const selfClosing = i > startIndex && text[i - 1] === "/";
          if (selfClosing) {
            if (state.depth === 0) return { end: i + 1, closeFrom: i - 1 };
          } else {
            state.depth += 1;
          }
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    const lt = text.indexOf("<", i);
    if (lt < 0) return null;
    i = lt;
    if (text.startsWith("<!--", i)) {
      state.inComment = true;
      i += 4;
      continue;
    }
    if (text.startsWith("<![CDATA[", i)) {
      state.inCdata = true;
      i += 9;
      continue;
    }
    const rest = text.slice(i);
    if (SVG_OPEN_RE.test(rest)) {
      state.inOpenTag = true;
      i += 4;
      continue;
    }
    const closeMatch = rest.match(SVG_CLOSE_RE);
    if (closeMatch) {
      state.depth -= 1;
      if (state.depth <= 0) return { end: i + closeMatch[0].length, closeFrom: i };
      i += closeMatch[0].length;
      continue;
    }
    i += 1;
  }
  return null;
}

export const svgSyntax = {
  defineNodes: [
    { name: "InlineSvg", style: tags.special(tags.content) },
    { name: "SvgBlock", block: true, style: tags.special(tags.content) },
    { name: "SvgClose", style: tags.processingInstruction },
  ],
  parseInline: [{
    name: "InlineSvg",
    before: "HTMLTag",
    parse(cx, next, pos) {
      if (next !== OPEN_ANGLE) return -1;
      const slice = cx.slice(pos, cx.end);
      if (!SVG_OPEN_RE.test(slice)) return -1;
      const closed = advanceSvgScan(slice, 0, createScanState());
      if (!closed) return -1;
      const end = pos + closed.end;
      const closeFrom = pos + closed.closeFrom;
      return cx.addElement(cx.elt("InlineSvg", pos, end, [cx.elt("SvgClose", closeFrom, end)]));
    },
  }],
  parseBlock: [{
    name: "SvgBlock",
    before: "HTMLBlock",
    endLeaf(_cx, line) {
      const rest = line.text.slice(line.pos);
      if (!SVG_OPEN_RE.test(rest)) return false;
      const closed = advanceSvgScan(line.text, line.pos, createScanState());
      return !closed || !line.text.slice(closed.end).trim();
    },
    parse(cx, line) {
      const rest = line.text.slice(line.pos);
      if (!SVG_OPEN_RE.test(rest)) return false;
      const start = cx.lineStart + line.pos;
      const scanState = createScanState();
      let closed = advanceSvgScan(line.text, line.pos, scanState);
      if (closed) {
        if (line.text.slice(closed.end).trim()) return false;
        const end = cx.lineStart + closed.end;
        const closeFrom = cx.lineStart + closed.closeFrom;
        cx.nextLine();
        cx.addElement(cx.elt("SvgBlock", start, end, [cx.elt("SvgClose", closeFrom, end)]));
        return true;
      }
      while (cx.nextLine()) {
        if (line.depth < cx.stack.length) break;
        closed = advanceSvgScan(line.text, line.basePos, scanState);
        if (closed) {
          const end = cx.lineStart + closed.end;
          const closeFrom = cx.lineStart + closed.closeFrom;
          cx.nextLine();
          cx.addElement(cx.elt("SvgBlock", start, end, [cx.elt("SvgClose", closeFrom, end)]));
          return true;
        }
      }
      cx.addElement(cx.elt("SvgBlock", start, cx.prevLineEnd()));
      return true;
    },
  }],
};

export function svgSource(text, inBlockquote = false) {
  const value = String(text ?? "");
  return (inBlockquote ? value.replace(/^[ \t]*>[ \t]?/gm, "") : value).trim();
}

export function isSafeSvgUrl(value, { fragmentOnly = false, allowImageData = false } = {}) {
  const cleaned = String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (fragmentOnly) return cleaned.startsWith("#");
  if (!cleaned || cleaned.startsWith("#")) return true;
  if (/^(?:javascript|vbscript):/i.test(cleaned)) return false;
  if (/^data:/i.test(cleaned)) {
    return allowImageData && /^data:image\/(?:png|jpe?g|gif|webp|avif)(?:;base64)?,/i.test(cleaned);
  }
  if (/^https?:/i.test(cleaned)) return true;
  if (!allowImageData && /^mailto:/i.test(cleaned)) return true;
  return !/^[^/?#]*:/.test(cleaned);
}

export function sanitizeSvgStyle(cssText) {
  return String(cssText ?? "")
    .replace(/@import\b[^;]*(?:;|$)/gi, "")
    .replace(/\bexpression\s*\([^;]*(?=;|$)/gi, "")
    .replace(/(?:-moz-binding|behavior)\s*:[^;]*(?:;|$)/gi, "")
    .replace(/\b(?:javascript|vbscript)\s*:/gi, "")
    .replace(/url\s*\(\s*(?:'([^']*)'|"([^"]*)"|([^)]*))\s*\)/gi, (_, single, double, bare) => {
      const raw = (single ?? double ?? bare ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim();
      return /^#[^\s"'()\\]+$/.test(raw) ? `url(${raw})` : "none";
    });
}

function removeAttr(element, attr) {
  if (attr.namespaceURI && typeof element.removeAttributeNS === "function") {
    element.removeAttributeNS(attr.namespaceURI, attr.localName || attr.name);
  } else {
    element.removeAttribute(attr.name);
  }
}

function sanitizeAttributes(element, tag) {
  for (const attr of [...(element.attributes || [])]) {
    const name = attr.name.toLowerCase();
    if (name.startsWith("on")) {
      removeAttr(element, attr);
      continue;
    }
    if (name === "style") {
      element.setAttribute(attr.name, sanitizeSvgStyle(attr.value));
      continue;
    }
    if (URL_ATTRS.has(name)) {
      const policy = tag === "use"
        ? { fragmentOnly: true }
        : tag === "image" || tag === "feimage"
          ? { allowImageData: true }
          : tag === "a"
            ? { fragmentOnly: false, allowImageData: false }
            : { fragmentOnly: true };
      if (!isSafeSvgUrl(attr.value, policy)) removeAttr(element, attr);
      continue;
    }
    if (PAINT_URL_ATTRS.has(name) && /url\s*\(/i.test(attr.value)) {
      element.setAttribute(attr.name, sanitizeSvgStyle(attr.value));
    }
  }
}

export function sanitizeSvgElement(root) {
  if (!root || root.nodeType !== 1) return;
  const rootTag = (root.localName || root.tagName || "").toLowerCase();
  sanitizeAttributes(root, rootTag);

  const walk = (parent) => {
    for (const child of [...(parent.childNodes || [])]) {
      if (child.nodeType !== 1) continue;
      const tag = (child.localName || child.tagName || "").toLowerCase();
      if ((child.namespaceURI && child.namespaceURI !== SVG_NS) || BLOCKED_TAGS.has(tag)) {
        parent.removeChild(child);
        continue;
      }
      if (ANIMATION_TAGS.has(tag)) {
        const targetAttr = child.getAttribute?.("attributeName") || "";
        if (/^\s*(?:on|href\b|xlink:href\b|src\b)/i.test(targetAttr)) {
          parent.removeChild(child);
          continue;
        }
        for (const key of ["from", "to", "values"]) {
          const val = child.getAttribute?.(key);
          if (val && /(?:javascript|vbscript)\s*:/i.test(val)) child.removeAttribute(key);
        }
      }
      if (tag === "style") {
        child.textContent = sanitizeSvgStyle(child.textContent || "");
      }
      sanitizeAttributes(child, tag);
      walk(child);
    }
  };
  walk(root);
}

export function mountSvg(host, source, { inline = false } = {}) {
  const parsed = new DOMParser().parseFromString(String(source ?? ""), "text/html");
  const svg = parsed.body?.querySelector("svg");
  if (!svg) {
    const error = document.createElement("span");
    error.className = "svg-error";
    error.textContent = "Invalid SVG";
    host.replaceChildren(error);
    return;
  }
  sanitizeSvgElement(svg);
  const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = inline ? INLINE_SHADOW_CSS : BLOCK_SHADOW_CSS;
  shadow.replaceChildren(style, document.importNode(svg, true));
}
