export function searchableLatexText(source) {
  let text = String(source || "").replace(/%[^\n]*/g, " ");
  const greekCommand = /\\(alpha|beta|gamma|delta|epsilon|varepsilon|zeta|eta|theta|vartheta|iota|kappa|lambda|mu|nu|xi|omicron|pi|varpi|rho|varrho|sigma|varsigma|tau|upsilon|phi|varphi|chi|psi|omega)(?![A-Za-z])/gi;
  const namedOperatorCommand = /\\(arg|arccos|arcsin|arctan|cos|cosh|cot|coth|csc|det|exp|gcd|inf|ker|lg|lim|liminf|limsup|ln|log|max|min|sec|sin|sinh|sup|tan|tanh)(?![A-Za-z])/gi;
  let previous;
  do {
    previous = text;
    text = text.replace(/\\(?:text|textrm|textsf|texttt|mathrm|mathbf|mathit|mathsf|mathtt|operatorname)\s*\{([^{}]*)\}/g, " $1 ");
  } while (text !== previous);
  return text
    .replace(/\\+(?:begin|end)\s*\{[^{}\r\n]+\}/g, " ")
    .replace(greekCommand, "$1")
    .replace(namedOperatorCommand, "$1")
    .replace(/\\[A-Za-z]+|\\./g, " ")
    .replace(/[{}[\]_^&]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
