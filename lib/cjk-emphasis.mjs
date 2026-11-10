import MarkdownIt from "markdown-it";
import { isWhiteSpace, isPunctCharCode, isMdAsciiPunct } from "markdown-it/lib/common/utils.mjs";

function isCJK(code) {
  if (!code) return false;
  return (
    (code >= 0x4E00 && code <= 0x9FFF) ||   // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4DBF) ||   // CJK Extension A
    (code >= 0x20000 && code <= 0x2A6DF) || // CJK Extension B
    (code >= 0x2A700 && code <= 0x2B73F) || // CJK Extension C
    (code >= 0x2B740 && code <= 0x2B81F) || // CJK Extension D
    (code >= 0x2B820 && code <= 0x2CEAF) || // CJK Extension E
    (code >= 0xF900 && code <= 0xFAFF) ||   // CJK Compatibility
    (code >= 0x3040 && code <= 0x309F) ||   // Hiragana
    (code >= 0x30A0 && code <= 0x30FF) ||   // Katakana
    (code >= 0xAC00 && code <= 0xD7AF)      // Hangul
  );
}

export function patchCjkEmphasis() {
  const StateProto = new MarkdownIt().inline.State.prototype;
  if (StateProto._cjkEmphasisPatched) return;
  StateProto._cjkEmphasisPatched = true;

  const origScanDelims = StateProto.scanDelims;
  StateProto.scanDelims = function scanDelimsCJK(start, canSplitWord) {
    const res = origScanDelims.call(this, start, canSplitWord);
    const marker = this.src.charCodeAt(start);
    if (marker !== 0x2A && marker !== 0x5F) return res;

    let lastChar = start > 0 ? this.src.codePointAt(start - 1) : 0x20;
    let nextPos = start + res.length;
    let nextChar = nextPos < this.posMax ? this.src.codePointAt(nextPos) : 0x20;

    const isLastCJK = isCJK(lastChar);
    const isNextCJK = isCJK(nextChar);

    if (isLastCJK || isNextCJK) {
      const isLastPunct = isMdAsciiPunct(lastChar) || isPunctCharCode(lastChar);
      const isNextPunct = isMdAsciiPunct(nextChar) || isPunctCharCode(nextChar);
      const isLastWhite = isWhiteSpace(lastChar);
      const isNextWhite = isWhiteSpace(nextChar);

      const left_flanking = !isNextWhite && (!isNextPunct || isLastWhite || isLastPunct || isLastCJK);
      const right_flanking = !isLastWhite && (!isLastPunct || isNextWhite || isNextPunct || isNextCJK);

      const can_open = left_flanking && (canSplitWord || !right_flanking || isLastPunct || isLastCJK);
      const can_close = right_flanking && (canSplitWord || !left_flanking || isNextPunct || isNextCJK);

      return { can_open, can_close, length: res.length };
    }

    return res;
  };
}

patchCjkEmphasis();
