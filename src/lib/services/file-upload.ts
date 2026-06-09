// ====================
// 文件上传服务
// 接收文件 → 解析 → 转MD → 存PostgreSQL+Storage
// ====================

import { parseFile, detectFormat, validateFile } from "@/lib/services/file-parser";
import { saveBook } from "@/lib/db/books";
import { saveChapterMeta, saveChapterContent } from "@/lib/db/chapters";
import type { Book, Chapter } from "@/lib/utils/types";

export interface UploadResult {
  book: Book;
  chapters: Chapter[];
}

export async function processUpload(
  fileData: Uint8Array,
  filename: string,
  mimeType: string,
  metadata: {
    title: string;
    titleOriginal?: string;
    author: string;
    description?: string;
    language: string;
    uploaderId: string;
  },
): Promise<UploadResult> {
  const format = detectFormat(mimeType, filename);

  // 验证文件
  validateFile(fileData, format);

  // 解析文件
  const parseResult = await parseFile(fileData, format);

  if (parseResult.chapters.length === 0) {
    throw new Error("未能从文件中解析出任何章节");
  }

  // 创建书籍 ID
  const bookId = crypto.randomUUID();
  const now = new Date().toISOString();

  // 构建章节元数据
  const chapters: Chapter[] = parseResult.chapters.map((ch) => ({
    id: `${bookId}-ch-${ch.index}`,
    bookId,
    index: ch.index,
    title: ch.title,
    wordCount: ch.wordCount,
  }));

  // 构建书籍元数据
  const book: Book = {
    id: bookId,
    title: metadata.title,
    titleOriginal: metadata.titleOriginal ?? metadata.title,
    author: metadata.author,
    description: metadata.description ?? "",
    format,
    language: metadata.language,
    categories: [],
    tags: [],
    chapterCount: chapters.length,
    uploaderId: metadata.uploaderId,
    forkCount: 0,
    prCount: 0,
    mergedPrCount: 0,
    status: "active",
    classificationStatus: "pending",
    createdAt: now,
    updatedAt: now,
  };

  // 存储到 PostgreSQL + Supabase Storage
  // 1. 书籍元数据（PostgreSQL）
  await saveBook(book);

  // 2. 章节元数据（PostgreSQL）+ 内容（Storage）
  for (let i = 0; i < chapters.length; i++) {
    await saveChapterMeta(chapters[i]);
    await saveChapterContent(bookId, i, parseResult.chapters[i].content);
  }

  return { book, chapters };
}
