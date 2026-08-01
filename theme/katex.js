import katex from "katex";
import "katex/contrib/mhchem";
import { katexOptions } from "../lib/math-config.mjs";

export function renderMath(scope) {
  renderMathList(scope.querySelectorAll("[data-math-source]"));
}

export function renderMathList(formulas) {
  for (const formula of formulas) {
    if (formula.dataset.mathUpgraded) continue;
    const source = formula.dataset.mathSource;
    formula.setAttribute("aria-label", source);
    katex.render(source, formula, {
      ...katexOptions,
      displayMode: formula.hasAttribute("data-math-display"),
    });
    formula.dataset.mathUpgraded = "1";
    formula.removeAttribute("data-math-display");
  }
}
