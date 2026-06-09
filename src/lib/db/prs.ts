// ====================
// PR PostgreSQL 存储操作
// ====================

import { getSupabase } from "@/lib/supabase/client";
import type { PullRequest } from "@/lib/utils/types";

function rowToPR(row: Record<string, unknown>): PullRequest {
  return {
    id: row.id as string,
    bookId: row.book_id as string,
    translationId: row.translation_id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    authorId: row.author_id as string,
    reviewerId: row.reviewer_id as string | undefined,
    chapterIds: (row.chapter_ids as string[]) ?? [],
    status: (row.status as PullRequest["status"]) ?? "open",
    diffSnapshot: (row.diff_snapshot as PullRequest["diffSnapshot"]) ?? [],
    reviewComments: (row.review_comments as PullRequest["reviewComments"]) ?? [],
    mergedAt: row.merged_at as string | undefined,
    mergedBy: row.merged_by as string | undefined,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
  };
}

export async function getPR(
  _bookId: string,
  prId: string,
): Promise<PullRequest | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pull_requests")
    .select("*")
    .eq("id", prId)
    .single();
  if (error || !data) return null;
  return rowToPR(data);
}

export async function savePR(
  _bookId: string,
  pr: PullRequest,
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("pull_requests").upsert({
    id: pr.id,
    book_id: pr.bookId,
    translation_id: pr.translationId,
    title: pr.title,
    description: pr.description,
    author_id: pr.authorId,
    reviewer_id: pr.reviewerId,
    chapter_ids: pr.chapterIds,
    status: pr.status,
    diff_snapshot: pr.diffSnapshot,
    review_comments: pr.reviewComments,
    merged_at: pr.mergedAt,
    merged_by: pr.mergedBy,
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });
  if (error) throw new Error(`savePR failed: ${error.message}`);
}

export async function listPRs(bookId: string): Promise<PullRequest[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pull_requests")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToPR);
}
