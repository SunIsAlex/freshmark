// Subject folders under content/posts and their display labels per locale.
export const subjectLabels = {
  math: { zh: "数学", en: "Mathematics" },
  physics: { zh: "物理", en: "Physics" },
  chemistry: { zh: "化学", en: "Chemistry" },
  technology: { zh: "技术", en: "Technology" },
  android: { zh: "Android", en: "Android" },
  english: { zh: "英语", en: "English" },
};

export function subjectLabel(subject, locale = "zh") {
  const labels = subjectLabels[subject] || { zh: "笔记", en: "Notes" };
  return labels[locale] || labels.zh;
}
