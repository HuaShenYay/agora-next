// ====================
// 核心数据类型（精简版：仅书库/上传/阅读所需）
// ====================

export type BookFormat = "pdf" | "epub" | "txt" | "markdown";

export interface Book {
  id: string;
  title: string;
  titleOriginal: string;
  author: string;
  description: string;
  shortDescription?: string;
  coverUrl?: string;
  format: BookFormat;
  language: string;
  categories: string[];
  tags: string[];
  chapterCount: number;
  uploaderId: string;
  forkCount: number;
  prCount: number;
  mergedPrCount: number;
  status: "active" | "archived";
  classificationStatus: "pending" | "processing" | "done" | "failed";
  /** 提取后的 Markdown 全文（数据库只存这个） */
  contentMarkdown?: string;
  createdAt: string;
  updatedAt: string;
}

// 书籍列表摘要（用于列表展示）
export type BookSummary = Pick<
  Book,
  | "id"
  | "title"
  | "titleOriginal"
  | "author"
  | "language"
  | "format"
  | "categories"
  | "tags"
  | "chapterCount"
  | "forkCount"
  | "mergedPrCount"
  | "classificationStatus"
  | "status"
  | "createdAt"
>;
