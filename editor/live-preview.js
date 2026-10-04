// Typora-style live preview: Markdown syntax is hidden and rendered in place, except on the
// lines or spans the cursor is touching, where the source reappears for editing.
import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView, WidgetType } from "@codemirror/view";
import { ensureSyntaxTree, syntaxTree } from "@codemirror/language";
import { mathSource, renderMath } from "./math.js";

export const setSourceMode = StateEffect.define();
export const sourceMode = StateField.define({
  create: () => false,
  update: (value, transaction) => transaction.effects.reduce((current, effect) => (effect.is(setSourceMode) ? effect.value : current), value),
});

// Source is only revealed around the cursor while the editor has focus, as in Typora.
const setFocused = StateEffect.define();
const focused = StateField.define({
  create: () => false,
  update: (value, transaction) => transaction.effects.reduce((current, effect) => (effect.is(setFocused) ? effect.value : current), value),
});
const focusTracking = EditorView.focusChangeEffect.of((_, focusing) => setFocused.of(focusing));

// Resolves image paths relative to the open post; replaced by the app when a file opens.
export const imageResolver = { resolve: (src) => src };

const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

// Minimal inline renderer for table cells: math, code, strong, emphasis, links.
export function renderInline(text) {
  const parts = [];
  const pattern = /(\$\$[^$]+\$\$|\$[^$\n]+\$|\\\(.+?\\\)|`[^`]+`)/g;
  let cursor = 0;
  for (const match of String(text).matchAll(pattern)) {
    parts.push(formatText(text.slice(cursor, match.index)));
    const token = match[0];
    if (token.startsWith("`")) parts.push(`<code>${escapeHtml(token.slice(1, -1))}</code>`);
    else {
      const { source, display } = mathSource(token);
      parts.push(renderMath(source, display));
    }
    cursor = match.index + token.length;
  }
  parts.push(formatText(text.slice(cursor)));
  return parts.join("");
}

function formatText(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, '<a href="$2">$1</a>');
}

class MathWidget extends WidgetType {
  constructor(source, display, block = false) {
    super();
    this.source = source;
    this.display = display;
    this.block = block;
  }
  eq(other) { return other.source === this.source && other.display === this.display && other.block === this.block; }
  toDOM(view) {
    const element = document.createElement(this.block ? "div" : "span");
    element.className = this.block ? "cm-math-block" : this.display ? "cm-math-display" : "cm-math-inline";
    element.innerHTML = renderMath(this.source, this.display);
    element.addEventListener("mousedown", (event) => {
      event.preventDefault();
      const position = view.posAtDOM(element);
      view.dispatch({ selection: { anchor: Math.min(position + (this.block ? 3 : 1), view.state.doc.length) } });
      view.focus();
    });
    return element;
  }
  ignoreEvent() { return false; }
}

// Live preview shown next to math source while the cursor is inside it.
class MathPeekWidget extends WidgetType {
  constructor(source, display, block) {
    super();
    this.source = source;
    this.display = display;
    this.block = block;
  }
  eq(other) { return other.source === this.source && other.display === this.display && other.block === this.block; }
  toDOM() {
    const element = document.createElement(this.block ? "div" : "span");
    element.className = this.block ? "cm-math-peek-block" : "cm-math-peek";
    element.setAttribute("aria-hidden", "true");
    const inner = document.createElement("span");
    inner.innerHTML = renderMath(this.source, this.display || this.block);
    element.append(inner);
    return element;
  }
  ignoreEvent() { return true; }
}

class ImageWidget extends WidgetType {
  constructor(src, alt) {
    super();
    this.src = src;
    this.alt = alt;
  }
  eq(other) { return other.src === this.src && other.alt === this.alt; }
  toDOM() {
    const figure = document.createElement("span");
    figure.className = "cm-image";
    const image = document.createElement("img");
    image.src = imageResolver.resolve(this.src);
    image.alt = this.alt;
    image.loading = "lazy";
    image.addEventListener("error", () => figure.classList.add("cm-image-missing"), { once: true });
    figure.append(image);
    if (this.alt) {
      const caption = document.createElement("span");
      caption.className = "cm-image-caption";
      caption.textContent = this.alt;
      figure.append(caption);
    }
    return figure;
  }
  ignoreEvent() { return false; }
}

class BulletWidget extends WidgetType {
  eq() { return true; }
  toDOM() {
    const element = document.createElement("span");
    element.className = "cm-bullet";
    element.textContent = "•";
    return element;
  }
}

class CheckboxWidget extends WidgetType {
  constructor(checked) {
    super();
    this.checked = checked;
  }
  eq(other) { return other.checked === this.checked; }
  toDOM(view) {
    const box = document.createElement("input");
    box.type = "checkbox";
    box.className = "cm-task";
    box.checked = this.checked;
    box.addEventListener("mousedown", (event) => {
      event.preventDefault();
      const position = view.posAtDOM(box);
      const text = view.state.sliceDoc(position, position + 3);
      if (/^\[[ xX]\]$/.test(text)) view.dispatch({ changes: { from: position + 1, to: position + 2, insert: this.checked ? " " : "x" } });
    });
    return box;
  }
  ignoreEvent() { return false; }
}

class RuleWidget extends WidgetType {
  eq() { return true; }
  toDOM() {
    const element = document.createElement("span");
    element.className = "cm-rule";
    return element;
  }
}

class TableWidget extends WidgetType {
  constructor(source) {
    super();
    this.source = source;
  }
  eq(other) { return other.source === this.source; }
  toDOM(view) {
    const wrapper = document.createElement("div");
    wrapper.className = "cm-table";
    const split = (line) => line.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((cell) => cell.trim());
    const [head, align, ...rows] = this.source.split("\n");
    const aligns = split(align || "").map((cell) => (/^:-+:$/.test(cell) ? "center" : /-+:$/.test(cell) ? "right" : "left"));
    const cells = (line, tag) => split(line).map((cell, index) => `<${tag} style="text-align:${aligns[index] || "left"}">${renderInline(cell)}</${tag}>`).join("");
    wrapper.innerHTML = `<table><thead><tr>${cells(head, "th")}</tr></thead><tbody>${rows.map((row) => `<tr>${cells(row, "td")}</tr>`).join("")}</tbody></table>`;
    wrapper.addEventListener("mousedown", (event) => {
      if (event.target.closest("a")) return;
      event.preventDefault();
      view.dispatch({ selection: { anchor: view.posAtDOM(wrapper) } });
      view.focus();
    });
    return wrapper;
  }
  ignoreEvent() { return false; }
}

const hidden = Decoration.replace({});
const line = (className) => Decoration.line({ class: className });
const mark = (className) => Decoration.mark({ class: className });

function decorate(state) {
  if (state.field(sourceMode)) return Decoration.none;
  const ranges = [];
  const doc = state.doc;
  const selection = state.field(focused) ? state.selection.ranges : [];
  const touches = (from, to) => selection.some((range) => range.from <= to && range.to >= from);
  const lineSpan = (from, to) => [doc.lineAt(from).from, doc.lineAt(to).to];
  const touchesLines = (from, to) => touches(...lineSpan(from, to));
  const add = (from, to, decoration) => ranges.push(decoration.range(from, to));
  const eachLine = (from, to, decoration) => {
    for (let position = doc.lineAt(from).from; position <= to;) {
      const current = doc.lineAt(position);
      add(current.from, current.from, decoration);
      position = current.to + 1;
    }
  };
  const tree = ensureSyntaxTree(state, doc.length, 150) || syntaxTree(state);
  tree.iterate({
    enter(node) {
      const { from, to, name } = node;
      const heading = name.match(/^ATXHeading(\d)$/);
      if (heading) {
        add(doc.lineAt(from).from, doc.lineAt(from).from, line(`cm-h cm-h${heading[1]}`));
        if (!touchesLines(from, to)) {
          const headerMark = node.node.getChild("HeaderMark");
          if (headerMark) add(headerMark.from, Math.min(headerMark.to + 1, to), hidden);
        }
        return;
      }
      switch (name) {
        case "Emphasis": case "StrongEmphasis": case "Strikethrough": case "InlineCode": {
          add(from, to, mark({ Emphasis: "cm-em", StrongEmphasis: "cm-strong", Strikethrough: "cm-strike", InlineCode: "cm-code" }[name]));
          if (!touches(from, to)) for (const child of node.node.getChildren(name === "InlineCode" ? "CodeMark" : name === "Strikethrough" ? "StrikethroughMark" : "EmphasisMark")) add(child.from, child.to, hidden);
          return;
        }
        case "Link": {
          const marks = node.node.getChildren("LinkMark");
          if (marks.length < 2) return;
          add(marks[0].to, marks[1].from, mark("cm-link"));
          if (!touches(from, to)) {
            add(from, marks[0].to, hidden);
            add(marks[1].from, to, hidden);
          }
          return false;
        }
        case "Image": {
          const text = doc.sliceString(from, to);
          const parsed = text.match(/^!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)$/);
          if (!parsed) return false;
          if (touches(from, to)) {
            add(from, to, mark("cm-image-source"));
            add(to, to, Decoration.widget({ widget: new ImageWidget(parsed[2], parsed[1]), side: 1 }));
          } else add(from, to, Decoration.replace({ widget: new ImageWidget(parsed[2], parsed[1]) }));
          return false;
        }
        case "InlineMath": {
          const text = doc.sliceString(from, to);
          const current = doc.lineAt(from);
          const alone = current.text.trim() === text.trim();
          const { source, display } = mathSource(text);
          const asDisplay = display || alone;
          if (touches(from, to)) {
            add(from, from, Decoration.widget({ widget: new MathPeekWidget(source, asDisplay, false), side: -1 }));
            add(from, to, mark("cm-math-source"));
          } else add(from, to, Decoration.replace({ widget: new MathWidget(source, asDisplay) }));
          return false;
        }
        case "BlockMath": {
          const [start, end] = lineSpan(from, to);
          const { source } = mathSource(doc.sliceString(from, to));
          if (touches(start, end)) {
            eachLine(start, end, line("cm-math-source-line"));
            add(end, end, Decoration.widget({ widget: new MathPeekWidget(source, true, true), side: 1, block: true }));
          } else add(start, end, Decoration.replace({ widget: new MathWidget(source, true, true), block: true }));
          return false;
        }
        case "Blockquote": {
          eachLine(from, to, line("cm-quote"));
          return;
        }
        case "QuoteMark": {
          if (!touchesLines(from, to)) add(from, Math.min(to + (doc.sliceString(to, to + 1) === " " ? 1 : 0), doc.lineAt(from).to), hidden);
          return;
        }
        case "ListMark": {
          const list = node.node.parent?.parent;
          if (list?.name === "BulletList" && !touchesLines(from, to) && !node.node.parent.getChild("Task")) add(from, to, Decoration.replace({ widget: new BulletWidget() }));
          else add(from, to, mark("cm-list-mark"));
          return;
        }
        case "TaskMarker": {
          if (!touchesLines(from, to)) {
            const listMark = node.node.parent?.parent?.getChild("ListMark");
            if (listMark) add(listMark.from, Math.min(listMark.to + 1, from), hidden);
            add(from, to, Decoration.replace({ widget: new CheckboxWidget(/x/i.test(doc.sliceString(from, to))) }));
          }
          return;
        }
        case "HorizontalRule": {
          if (!touchesLines(from, to)) add(from, to, Decoration.replace({ widget: new RuleWidget() }));
          return;
        }
        case "FencedCode": {
          const [start, end] = lineSpan(from, to);
          eachLine(start, end, line("cm-codeblock"));
          add(start, start, line("cm-codeblock cm-codeblock-first"));
          add(doc.lineAt(end).from, doc.lineAt(end).from, line("cm-codeblock cm-codeblock-last"));
          return;
        }
        case "CodeMark": case "CodeInfo": {
          add(from, to, mark("cm-fence"));
          return;
        }
        case "Table": {
          const [start, end] = lineSpan(from, to);
          if (touches(start, end)) eachLine(start, end, line("cm-table-source"));
          else add(start, end, Decoration.replace({ widget: new TableWidget(doc.sliceString(start, end)), block: true }));
          return false;
        }
        case "HTMLTag": case "Comment": case "HTMLBlock": {
          add(from, to, mark("cm-html"));
          return;
        }
        case "URL": case "Autolink": {
          add(from, to, mark("cm-url"));
          return;
        }
        default:
      }
    },
  });
  return Decoration.set(ranges, true);
}

export const livePreview = StateField.define({
  create: decorate,
  update(value, transaction) {
    const treeChanged = syntaxTree(transaction.state) !== syntaxTree(transaction.startState);
    if (transaction.docChanged || transaction.selection || treeChanged || transaction.effects.some((effect) => effect.is(setSourceMode) || effect.is(setFocused))) return decorate(transaction.state);
    return value;
  },
  provide: (field) => EditorView.decorations.from(field),
});

export const livePreviewExtension = [focused, focusTracking, livePreview];

export function headings(state) {
  const result = [];
  syntaxTree(state).iterate({
    enter(node) {
      const level = node.name.match(/^ATXHeading(\d)$/)?.[1];
      if (!level) return node.name === "Document" || node.name === "Blockquote" ? undefined : false;
      result.push({ level: Number(level), from: node.from, text: state.sliceDoc(node.from, node.to).replace(/^#+\s*/, "").replace(/\s*#+\s*$/, "") });
      return false;
    },
  });
  return result;
}
