import katex from "katex";
import "katex/contrib/mhchem";

const macros = {
  "\\degree": "^{\\circ}",
  "\\R": "\\mathbb{R}",
  "\\N": "\\mathbb{N}",
  "\\Z": "\\mathbb{Z}",
  "\\E": "\\mathrm{e}",
  "\\Hoffmann": "\\operatorname{Hoffmann}",
};

export function renderMath(scope) {
  for (const formula of scope.querySelectorAll("[data-math-source]")) {
    katex.render(formula.dataset.mathSource, formula, {
      displayMode: formula.hasAttribute("data-math-display"),
      macros,
      output: "htmlAndMathml",
      strict: "ignore",
      throwOnError: false,
      trust: false,
    });
    formula.removeAttribute("data-math-display");
  }
}
