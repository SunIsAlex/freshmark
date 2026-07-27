import { diffArrays } from "diff";

export function changedCurrentIndexes(previous, current) {
  const indexes = [];
  let currentIndex = 0;
  for (const change of diffArrays(previous, current)) {
    if (change.removed) continue;
    if (change.added) {
      for (let offset = 0; offset < change.value.length; offset += 1) {
        indexes.push(currentIndex + offset);
      }
    }
    currentIndex += change.value.length;
  }
  return indexes;
}
