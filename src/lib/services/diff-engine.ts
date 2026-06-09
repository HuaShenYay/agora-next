// ====================
// Diff 引擎（基于 npm:diff）
// ====================

import { diffLines } from "diff";
import type { DiffHunk, DiffLine } from "@/lib/utils/types";
import { getChapterContent } from "@/lib/db/chapters";
import { getTranslationChapterContent } from "@/lib/db/translations";

export async function generateDiff(
  bookId: string,
  translationId: string,
  chapterIndices: number[],
): Promise<DiffHunk[]> {
  const hunks: DiffHunk[] = [];

  for (const idx of chapterIndices) {
    const [original, translated] = await Promise.all([
      getChapterContent(bookId, idx),
      getTranslationChapterContent(bookId, translationId, idx),
    ]);

    if (!translated || translated.trim().length === 0) continue;

    const changes = diffLines(original ?? "", translated);
    const lines: DiffLine[] = [];
    let lineNumber = 0;

    for (const change of changes) {
      const changeLines = change.value.split("\n").filter((l) => l !== "");
      for (const line of changeLines) {
        lineNumber++;
        lines.push({
          type: change.added ? "added" : change.removed ? "removed" : "unchanged",
          value: line,
          lineNumber,
        });
      }
    }

    hunks.push({
      chapterId: `${bookId}-ch-${idx}`,
      chapterIndex: idx,
      chapterTitle: `第 ${idx + 1} 章`,
      lines,
    });
  }

  return hunks;
}
