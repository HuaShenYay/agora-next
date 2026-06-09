// ====================
// 文件上传服务（极简版）
// 接收文件 → 存 Supabase Storage → 写入 books 表
// 不做章节拆分、不做 AI 分类
// ====================

import { saveBook } from "@/lib/db/books";
import { storageUpload } from "@/lib/supabase/storage";
import { detectFormat, validateFile, getExtension, getMimeType } from "@/lib/utils/upload-utils";
import type { Book } from "@/lib/utils/types";

export interface UploadResult {
  book: Book;
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
  },
): Promise<UploadResult> {
  const format = detectFormat(mimeType, filename);
  validateFile(fileData, format);

  const bookId = crypto.randomUUID();
  const now = new Date().toISOString();
  const ext = getExtension(filename);
  const storagePath = `${bookId}/source.${ext}`;
  const contentType = getMimeType(format);

  // 上传原文件到 Supabase Storage
  await storageUpload(storagePath, fileData, contentType);

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
    chapterCount: 0,
    uploaderId: "anonymous",
    forkCount: 0,
    prCount: 0,
    mergedPrCount: 0,
    status: "active",
    classificationStatus: "pending",
    createdAt: now,
    updatedAt: now,
  };

  await saveBook(book, { storagePath, sizeBytes: fileData.byteLength });
  return { book };
}
