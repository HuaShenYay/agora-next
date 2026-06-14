// ====================
// BookToc — 左侧可折叠 TOC 侧栏
// 点击章节滚动到对应 anchor
// ====================

"use client";

import { useState } from "react";
import type { Chapter } from "@/lib/utils/markdown";

interface Props {
  chapters: Chapter[];
  activeId: string | null;
  onJump: (id: string) => void;
}

export default function BookToc({ chapters, activeId, onJump }: Props) {
  const [open, setOpen] = useState(true);
  if (chapters.length === 0) return null;

  return (
    <aside
      className={`reader-toc ${open ? "is-open" : "is-collapsed"}`}
      aria-label="目录"
    >
      <button
        className="reader-toc-toggle"
        onClick={() => setOpen((o) => !o)}
        type="button"
        aria-expanded={open}
      >
        <span className="reader-toc-toggle-mark">{open ? "◀" : "▶"}</span>
        <span className="reader-toc-toggle-label">
          {open ? "HIDE TOC" : "TOC"}
        </span>
      </button>

      {open && (
        <nav className="reader-toc-nav">
          <div className="reader-toc-head">CONTENTS</div>
          <ol className="reader-toc-list">
            {chapters.map((ch, i) => (
              <li
                key={ch.id}
                className={`reader-toc-item reader-toc-item--lv${ch.level} ${
                  activeId === ch.id ? "is-active" : ""
                }`}
              >
                <button
                  onClick={() => onJump(ch.id)}
                  type="button"
                  className="reader-toc-link"
                >
                  <span className="reader-toc-no">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="reader-toc-title">{ch.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </aside>
  );
}
