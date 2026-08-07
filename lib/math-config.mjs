export const mathMacros = {
  "\\degree": "^{\\circ}",
  "\\R": "\\mathbb{R}",
  "\\N": "\\mathbb{N}",
  "\\Z": "\\mathbb{Z}",
  "\\E": "\\mathrm{e}",
  "\\C": "\\mathrm{C}",
  "\\Hoffmann": "\\operatorname{Hoffmann}",
};

export const katexOptions = {
  macros: mathMacros,
  output: "htmlAndMathml",
  strict: "ignore",
  throwOnError: false,
  trust: false,
};
