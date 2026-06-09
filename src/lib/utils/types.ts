// ====================
// 核心数据类型
// ====================

export type UserRole = "admin" | "translator" | "viewer";

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

// ====================
// 学科分类
// ====================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  featured?: boolean;
  createdAt: string;
}

// ====================
// 书籍（原始上传）
// ====================

export type BookFormat = "pdf" | "epub" | "txt" | "markdown";
export type ClassificationStatus = "pending" | "processing" | "done" | "failed";

export interface AIClassification {
  primary: string;
  confidence: number;
  suggested: string[];
  tags: string[];
  summary: string;
}

export interface Book {
  id: string;
  title: string;
  titleOriginal: string;
  author: string;
  description: string;
  coverUrl?: string;
  format: BookFormat;
  language: string; // 源语言 "en", "de", "fr", "zh-CN"
  categories: string[]; // categoryId[]
  tags: string[];
  chapterCount: number;
  uploaderId: string;
  forkCount: number;
  prCount: number;
  mergedPrCount: number;
  status: "active" | "archived";
  classificationStatus: ClassificationStatus;
  aiClassification?: AIClassification;
  createdAt: string;
  updatedAt: string;
}

// ====================
// 章节
// ====================

export interface Chapter {
  id: string;
  bookId: string;
  index: number; // 章节序号，从 0 开始
  title: string;
  wordCount: number;
  startPage?: number;
  endPage?: number;
}

// ====================
// 翻译项目（Fork）
// ====================

export type TranslationStatus = "active" | "completed" | "abandoned";

export interface Translation {
  id: string;
  bookId: string;
  forkedBy: string; // userId
  targetLanguage: string; // "zh-CN", "en", etc.
  name: string;
  description: string;
  status: TranslationStatus;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

// ====================
// 翻译章节内容
// ====================

export type TranslationChapterStatus =
  | "draft"
  | "in_progress"
  | "completed"
  | "review";

export interface TranslationChapter {
  id: string;
  translationId: string;
  chapterId: string;
  chapterIndex: number;
  status: TranslationChapterStatus;
  lastEditorId: string;
  updatedAt: string;
}

// ====================
// Pull Request
// ====================

export type PRStatus =
  | "open"
  | "reviewing"
  | "merged"
  | "closed"
  | "rejected";

export interface ReviewComment {
  id: string;
  prId: string;
  authorId: string;
  chapterId: string;
  lineNumber?: number;
  content: string;
  createdAt: string;
}

export interface DiffHunk {
  chapterId: string;
  chapterIndex: number;
  chapterTitle: string;
  lines: DiffLine[];
}

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  value: string;
  lineNumber?: number;
}

export interface PullRequest {
  id: string;
  bookId: string;
  translationId: string;
  title: string;
  description: string;
  authorId: string;
  reviewerId?: string;
  chapterIds: string[];
  status: PRStatus;
  diffSnapshot: DiffHunk[];
  reviewComments: ReviewComment[];
  mergedAt?: string;
  mergedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ====================
// 书籍列表摘要（用于列表展示）
// ====================

export type BookSummary = Pick<
  Book,
  | "id"
  | "title"
  | "titleOriginal"
  | "author"
  | "language"
  | "categories"
  | "tags"
  | "chapterCount"
  | "forkCount"
  | "mergedPrCount"
  | "classificationStatus"
  | "aiClassification"
  | "status"
  | "createdAt"
>;
