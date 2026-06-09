"use client";
import type { DiffHunk } from "@/lib/utils/types";

export default function DiffViewer({ diffSnapshot }: { diffSnapshot: DiffHunk[] }) {
  if (!diffSnapshot || diffSnapshot.length === 0) return <div className="diff-empty">暂无 diff 数据</div>;
  return (
    <div className="diff-viewer">
      {diffSnapshot.map((hunk) => (
        <div key={hunk.chapterId} className="diff-hunk">
          <div className="diff-hunk-header">
            <span className="diff-hunk-title">{hunk.chapterTitle}</span>
            <span className="diff-hunk-stats">+{hunk.lines.filter((l) => l.type === "added").length} / -{hunk.lines.filter((l) => l.type === "removed").length}</span>
          </div>
          <div className="diff-lines">
            {hunk.lines.map((line, i) => (
              <div key={i} className={`diff-line diff-line-${line.type}`}>
                <span className="diff-line-marker">{line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}</span>
                <span className="diff-line-num">{line.lineNumber ?? ""}</span>
                <span className="diff-line-content">{line.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
