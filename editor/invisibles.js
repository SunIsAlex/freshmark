// Formatting marks, like Word's ¶ button: line breaks show as ¶, spaces as ·, tabs as →, and
// full-width or no-break spaces and invisible Unicode controls get their own markers.
import { Compartment, RangeSetBuilder } from "@codemirror/state";
import { Decoration, MatchDecorator, ViewPlugin, WidgetType, highlightSpecialChars, highlightWhitespace } from "@codemirror/view";

class LineBreakWidget extends WidgetType {
  eq() { return true; }
  toDOM() {
    const mark = document.createElement("span");
    mark.className = "cm-eol";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "¶";
    return mark;
  }
}
const lineBreak = Decoration.widget({ widget: new LineBreakWidget(), side: 1 });

function lineBreaks(view) {
  const builder = new RangeSetBuilder();
  const { doc } = view.state;
  let last = -1; // visible ranges split by widgets can share a line
  for (const { from, to } of view.visibleRanges) {
    for (let position = from; position <= to;) {
      const line = doc.lineAt(position);
      if (line.to < doc.length && line.to > last) builder.add(line.to, line.to, lineBreak);
      last = line.to;
      position = line.to + 1;
    }
  }
  return builder.finish();
}

const lineBreakMarks = ViewPlugin.fromClass(class {
  constructor(view) { this.decorations = lineBreaks(view); }
  update(update) { if (update.docChanged || update.viewportChanged) this.decorations = lineBreaks(update.view); }
}, { decorations: (plugin) => plugin.decorations });

const wideSpaces = new MatchDecorator({
  regexp: /[　  ]/g,
  decoration: (match) => Decoration.mark({ class: match[0] === "　" ? "cm-ws-ideographic" : "cm-ws-nbsp" }),
});
const wideSpaceMarks = ViewPlugin.fromClass(class {
  constructor(view) { this.decorations = wideSpaces.createDeco(view); }
  update(update) { this.decorations = wideSpaces.updateDeco(update, this.decorations); }
}, { decorations: (plugin) => plugin.decorations });

const invisibleExtensions = [lineBreakMarks, highlightWhitespace(), wideSpaceMarks, highlightSpecialChars()];
const compartment = new Compartment();

export const invisibles = (enabled) => compartment.of(enabled ? invisibleExtensions : []);
export const setInvisibles = (view, enabled) => view.dispatch({ effects: compartment.reconfigure(enabled ? invisibleExtensions : []) });
