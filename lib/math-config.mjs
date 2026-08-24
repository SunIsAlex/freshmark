export const mathMacros = {
  "\\degree": "^{\\circ}",
  "\\R": "\\mathbb{R}",
  "\\N": "\\mathbb{N}",
  "\\Z": "\\mathbb{Z}",
  "\\E": "\\mathrm{e}",
  "\\C": "\\mathrm{C}",
  "\\Hoffmann": "\\operatorname{Hoffmann}",
  "\\max": "{max}",
  "\\min": "{min}",
  "\\argmax": "{argmax}",
};

export const katexOptions = {
  macros: mathMacros,
  output: "htmlAndMathml",
  strict: "ignore",
  throwOnError: false,
  trust: false,
};
