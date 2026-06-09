// ====================
// 翻译项目 PostgreSQL + Storage 存储操作
// ====================

import { getSupabase } from "@/lib/supabase/client";
import { storageUpload, storageDownload, storageList } from "@/lib/supabase/storage";
import { STORAGE_PATHS } from "@/lib/utils/constants";
import type { Translation } from "@/lib/utils/types";

function rowToTranslation(row: Record<string, unknown>): Translation {
  return {
    id: row.id as string,
    bookId: row.book_id as string,
    forkedBy: row.forked_by as string,
    targetLanguage: row.target_language as string,
    name: row.name as string,
    description: (row.description as string) ?? "",
    status: (row.status as Translation["status"]) ?? "active",
    progress: (row.progress as number) ?? 0,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
  };
}

export async function getTranslation(
  _bookId: string,
  translationId: string,
): Promise<Translation | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("translations")
    .select("*")
    .eq("id", translationId)
    .single();
  if (error || !data) return null;
  return rowToTranslation(data);
}

export async function saveTranslation(
  _bookId: string,
  translation: Translation,
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("translations").upsert({
    id: translation.id,
    book_id: translation.bookId,
    forked_by: translation.forkedBy,
    target_language: translation.targetLanguage,
    name: translation.name,
    description: translation.description,
    status: translation.status,
    progress: translation.progress,
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });
  if (error) throw new Error(`saveTranslation failed: ${error.message}`);
}

export async function listTranslations(bookId: string): Promise<Translation[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("translations")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map(rowToTranslation);
}

export async function getTranslationChapterContent(
  bookId: string,
  translationId: string,
  chapterIndex: number,
): Promise<string | null> {
  return await storageDownload(
    STORAGE_PATHS.translationChapterFile(bookId, translationId, chapterIndex),
  );
}

export async function saveTranslationChapterContent(
  bookId: string,
  translationId: string,
  chapterIndex: number,
  content: string,
): Promise<void> {
  await storageUpload(
    STORAGE_PATHS.translationChapterFile(bookId, translationId, chapterIndex),
    content,
    "text/markdown",
  );
}

export async function listTranslationChapterFiles(
  bookId: string,
  translationId: string,
): Promise<string[]> {
  return await storageList(
    `${bookId}/translations/${translationId}/chapters`,
  );
}
