const strings = {
  zh: {
    files: "文章", outline: "大纲", filter: "筛选文章…", newPost: "新文章", noOutline: "正文中还没有标题",
    title: "标题", titlePlaceholder: "无标题", properties: "属性", date: "日期", language: "语言", subject: "学科", categories: "分类", tags: "标签",
    addTag: "添加…", summary: "摘要", summaryAuto: "自动", summaryAutoHint: "根据正文自动生成，与网站规则一致；编辑后即改为手动摘要。",
    featured: "精选", draft: "草稿", published: "已发布", status: "状态", translation: "译文", openTranslation: "打开译文", createTranslation: "创建{lang}版本",
    extraFields: "另保留 {count} 个其他字段", saved: "已保存", saving: "正在保存…", unsaved: "未保存", offline: "无法连接编辑器服务，内容已暂存在本机",
    conflict: "此文件已在外部修改。", reload: "重新载入", overwrite: "覆盖", words: "{count} 字", openOnSite: "在网站中打开",
    openOnSiteHint: "需运行 npm run dev；草稿需设置 FRESHMARK_DRAFTS=true", sourceMode: "源代码模式", livePreview: "实时预览",
    theme: "切换明暗", menu: "文章列表", create: "创建", cancel: "取消", slug: "网址名", slugHint: "小写字母、数字和连字符",
    issue_title: "缺少标题", issue_date: "日期格式应为 YYYY-MM-DD", issue_lang: "不支持的语言", issue_summaryLength: "摘要较长，卡片中会被截断", issue_emptyBody: "正文为空",
    uploadFailed: "图片上传失败", recovered: "已恢复本机暂存的未保存内容", chooseFile: "从左侧选择文章，或新建一篇。", localeName_zh: "中文", localeName_en: "英文",
    bold: "粗体", italic: "斜体", heading: "标题", code: "代码", inlineMath: "行内公式", blockMath: "公式块", list: "列表", quote: "引用", link: "链接", image: "图片", undo: "撤销", redo: "重做",
  },
  en: {
    files: "Posts", outline: "Outline", filter: "Filter posts…", newPost: "New post", noOutline: "No headings yet",
    title: "Title", titlePlaceholder: "Untitled", properties: "Properties", date: "Date", language: "Language", subject: "Subject", categories: "Categories", tags: "Tags",
    addTag: "Add…", summary: "Summary", summaryAuto: "Auto", summaryAutoHint: "Generated from the body with the site's own rules; editing it switches to a manual summary.",
    featured: "Featured", draft: "Draft", published: "Published", status: "Status", translation: "Translation", openTranslation: "Open translation", createTranslation: "Create {lang} version",
    extraFields: "{count} other fields preserved", saved: "Saved", saving: "Saving…", unsaved: "Unsaved", offline: "Editor server unreachable; changes are kept on this device",
    conflict: "This file changed on disk.", reload: "Reload", overwrite: "Overwrite", words: "{count} words", openOnSite: "Open on site",
    openOnSiteHint: "Needs npm run dev; drafts need FRESHMARK_DRAFTS=true", sourceMode: "Source mode", livePreview: "Live preview",
    theme: "Toggle dark mode", menu: "Posts", create: "Create", cancel: "Cancel", slug: "Slug", slugHint: "Lowercase letters, numbers and hyphens",
    issue_title: "Title is missing", issue_date: "Date should be YYYY-MM-DD", issue_lang: "Unsupported language", issue_summaryLength: "Long summary; cards will truncate it", issue_emptyBody: "Body is empty",
    uploadFailed: "Image upload failed", recovered: "Recovered unsaved changes from this device", chooseFile: "Pick a post on the left, or start a new one.", localeName_zh: "Chinese", localeName_en: "English",
    bold: "Bold", italic: "Italic", heading: "Heading", code: "Code", inlineMath: "Inline math", blockMath: "Math block", list: "List", quote: "Quote", link: "Link", image: "Image", undo: "Undo", redo: "Redo",
  },
};

export const uiLocale = navigator.language?.toLowerCase().startsWith("zh") ? "zh" : "en";
export const t = (key, values = {}) => String(strings[uiLocale][key] ?? strings.en[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
