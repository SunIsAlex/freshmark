import katex from "katex";
import "katex/contrib/mhchem";
import { katexOptions } from "../lib/math-config.mjs";

export function renderMath(scope) {
  for (const formula of scope.querySelectorAll("[data-math-source]")) {
    const source = formula.dataset.mathSource;
    formula.setAttribute("aria-label", source);
    katex.render(source, formula, {
      ...katexOptions,
      displayMode: formula.hasAttribute("data-math-display"),
    });
    formula.removeAttribute("data-math-display");
  }
}
