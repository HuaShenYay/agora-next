// ====================
// 学科分类体系（三大门类 + 子分类）
// ====================

export interface CategoryItem {
  id: string;
  name: string;
  emoji: string;
  children?: { id: string; name: string }[];
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "humanities",
    name: "人文艺术",
    emoji: "🎭",
    children: [
      { id: "philosophy", name: "哲学" },
      { id: "history", name: "历史" },
      { id: "literature", name: "文学" },
      { id: "linguistics", name: "语言学" },
      { id: "art", name: "艺术" },
      { id: "religion", name: "宗教" },
    ],
  },
  {
    id: "social-science",
    name: "社会科学",
    emoji: "🏛️",
    children: [
      { id: "sociology", name: "社会学" },
      { id: "economics", name: "经济学" },
      { id: "psychology", name: "心理学" },
      { id: "law", name: "法学" },
      { id: "education", name: "教育学" },
      { id: "political-science", name: "政治学" },
      { id: "anthropology", name: "人类学" },
    ],
  },
  {
    id: "natural-science",
    name: "自然科学",
    emoji: "🔬",
    children: [
      { id: "mathematics", name: "数学" },
      { id: "physics", name: "物理学" },
      { id: "chemistry", name: "化学" },
      { id: "biology", name: "生物学" },
      { id: "cs", name: "计算机" },
      { id: "earth-science", name: "地球科学" },
      { id: "medicine", name: "医学" },
    ],
  },
] as const;

// 扁平查找表：子分类 id → { name, parent }
export const SUB_CATEGORY_MAP: Record<string, { name: string; parent: string; parentName: string }> = {};
for (const cat of DEFAULT_CATEGORIES) {
  if (cat.children) {
    for (const sub of cat.children) {
      SUB_CATEGORY_MAP[sub.id] = { name: sub.name, parent: cat.id, parentName: cat.name };
    }
  } else {
    SUB_CATEGORY_MAP[cat.id] = { name: cat.name, parent: cat.id, parentName: cat.name };
  }
}

// 兼容旧代码的扁平 categoryMap：id → name
export const FLAT_CATEGORY_MAP: Record<string, string> = {};
for (const cat of DEFAULT_CATEGORIES) {
  FLAT_CATEGORY_MAP[cat.id] = cat.name;
  if (cat.children) {
    for (const sub of cat.children) {
      FLAT_CATEGORY_MAP[sub.id] = sub.name;
    }
  }
}

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
