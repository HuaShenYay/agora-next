// ====================
// Fork 服务 — 创建翻译项目
// ====================

import { getBook, updateBookPartial } from "@/lib/db/books";
import { saveTranslation } from "@/lib/db/translations";
import type { Translation } from "@/lib/utils/types";

export async function forkBook(
  bookId: string,
  userId: string,
  options: {
    targetLanguage: string;
    name: string;
    description?: string;
  },
): Promise<Translation> {
  const book = await getBook(bookId);
  if (!book) {
    throw new Error("书籍不存在");
  }

  const translationId = crypto.randomUUID();
  const now = new Date().toISOString();

  const translation: Translation = {
    id: translationId,
    bookId,
    forkedBy: userId,
    targetLanguage: options.targetLanguage,
    name: options.name,
    description: options.description ?? "",
    status: "active",
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };

  // 保存翻译项目元数据（空翻译，章节内容由译者后续填写）
  await saveTranslation(bookId, translation);

  // 更新原书 fork 计数
  await updateBookPartial(bookId, { forkCount: book.forkCount + 1 });

  return translation;
}
