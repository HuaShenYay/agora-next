// ====================
// 学科分类体系（预置）
// ====================

export const DEFAULT_CATEGORIES = [
  { id: "philosophy", name: "哲学" },
  { id: "history", name: "历史" },
  { id: "literature", name: "文学" },
  { id: "mathematics", name: "数学" },
  { id: "physics", name: "物理学" },
  { id: "cs", name: "计算机" },
  { id: "sociology", name: "社会学" },
  { id: "economics", name: "经济学" },
  { id: "psychology", name: "心理学" },
  { id: "linguistics", name: "语言学" },
  { id: "law", name: "法学" },
  { id: "education", name: "教育学" },
] as const;

// ====================
// 语言选项
// ====================

export const LANGUAGES = {
  "en": "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  "ja": "日本語",
  "ko": "한국어",
  "de": "Deutsch",
  "fr": "Français",
  "es": "Español",
  "pt": "Português",
  "ru": "Русский",
  "ar": "العربية",
  "la": "Latina",
  "grc": "Ἑλληνική (古)",
  "sa": "संस्कृतम्",
} as const;

// ====================
// 支持的文件格式
// ====================

export const SUPPORTED_FORMATS = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/markdown": "markdown",
  "application/epub+zip": "epub",
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
