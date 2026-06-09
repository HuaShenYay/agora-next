// ====================
// 学科分类体系（预置）
// ====================

export const DEFAULT_CATEGORIES = [
  {
    id: "philosophy",
    name: "哲学",
    slug: "philosophy",
    description: "形而上学、认识论、伦理学、美学、逻辑学",
    icon: "brain",
    sortOrder: 1,
  },
  {
    id: "history",
    name: "历史",
    slug: "history",
    description: "古代史、近代史、思想史、科技史",
    icon: "scroll",
    sortOrder: 2,
  },
  {
    id: "literature",
    name: "文学",
    slug: "literature",
    description: "文学理论、比较文学、诗歌、戏剧",
    icon: "book",
    sortOrder: 3,
  },
  {
    id: "mathematics",
    name: "数学",
    slug: "mathematics",
    description: "纯数学、应用数学、统计学",
    icon: "sigma",
    sortOrder: 4,
  },
  {
    id: "physics",
    name: "物理学",
    slug: "physics",
    description: "理论物理、实验物理、天体物理",
    icon: "atom",
    sortOrder: 5,
  },
  {
    id: "cs",
    name: "计算机科学",
    slug: "computer-science",
    description: "算法、人工智能、系统",
    icon: "terminal",
    sortOrder: 6,
  },
  {
    id: "sociology",
    name: "社会学",
    slug: "sociology",
    description: "社会理论、人类学、政治学",
    icon: "people",
    sortOrder: 7,
  },
  {
    id: "economics",
    name: "经济学",
    slug: "economics",
    description: "微观、宏观、政治经济学",
    icon: "chart",
    sortOrder: 8,
  },
  {
    id: "psychology",
    name: "心理学",
    slug: "psychology",
    description: "认知、发展、临床",
    icon: "mind",
    sortOrder: 9,
  },
  {
    id: "linguistics",
    name: "语言学",
    slug: "linguistics",
    description: "理论语言学、应用语言学、翻译学",
    icon: "languages",
    sortOrder: 10,
  },
  {
    id: "law",
    name: "法学",
    slug: "law",
    description: "法理学、国际法、比较法",
    icon: "scale",
    sortOrder: 11,
  },
  {
    id: "education",
    name: "教育学",
    slug: "education",
    description: "教育理论、课程研究",
    icon: "graduation",
    sortOrder: 12,
  },
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

// ====================
// Supabase Storage 文件路径常量
// ====================

export const STORAGE_PATHS = {
  chapterFile: (bookId: string, index: number) =>
    `${bookId}/chapters/${String(index).padStart(3, "0")}.md`,
  translationChapterFile: (
    bookId: string,
    translationId: string,
    index: number,
  ) =>
    `${bookId}/translations/${translationId}/chapters/${
      String(index).padStart(3, "0")
    }.md`,
} as const;
